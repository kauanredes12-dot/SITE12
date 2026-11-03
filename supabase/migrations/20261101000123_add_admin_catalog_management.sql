/*
# Admin catalog management: checkout links, category images, admin write access, cover storage

## Plain-English summary
Administrators can now create, edit, and delete products and categories from the admin area.
Each product stores its own Kiwify and Cakto checkout links, chooses which platform is the
active one, and can switch each checkout on or off. Covers are stored in a public image bucket
that only administrators can write to.

## 1. Modified table: products
- kiwify_url (text, optional): Kiwify checkout link. Must start with https.
- cakto_url (text, optional): Cakto checkout link. Must start with https.
- kiwify_enabled (boolean, default true): Kiwify checkout on or off.
- cakto_enabled (boolean, default true): Cakto checkout on or off.
- checkout_platform (text, default 'kiwify'): which platform the Buy button uses ('kiwify' or 'cakto').
- updated_at (timestamptz): last change time, set automatically on every update.
- The older checkout_url column is kept untouched for safety and is no longer read by the store.

## 2. Modified table: categories
- image_url (text, optional): category image or icon.
- updated_at (timestamptz): last change time, set automatically on every update.

## 3. Security
- Row level security stays enabled on products and categories.
- Administrators (role 'admin') get full read, insert, update, and delete access.
- Visitors keep read-only access to active products and to categories.
- Only administrators can write to the product-covers storage bucket.

## 4. Storage
- New public bucket 'product-covers' for cover images.
- Limit 5 MB per file; accepted types: JPEG, PNG, WebP.

## Important notes
1. Checkout links are validated in the database; an invalid link is rejected.
2. Existing products keep their data; the new checkout fields start empty.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS kiwify_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cakto_url text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS kiwify_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cakto_enabled boolean NOT NULL DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS checkout_platform text NOT NULL DEFAULT 'kiwify';
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_checkout_platform_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_checkout_platform_check
      CHECK (checkout_platform IN ('kiwify', 'cakto'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_kiwify_url_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_kiwify_url_check
      CHECK (kiwify_url IS NULL OR kiwify_url ~* '^https://[^[:space:]]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_cakto_url_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_cakto_url_check
      CHECK (cakto_url IS NULL OR cakto_url ~* '^https://[^[:space:]]+$');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS products_set_updated_at ON products;
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS categories_set_updated_at ON categories;
CREATE TRIGGER categories_set_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;

DROP POLICY IF EXISTS "admin_select_all_products" ON products;
CREATE POLICY "admin_select_all_products" ON products FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO authenticated USING (is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-covers', 'product-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "admin_insert_product_covers" ON storage.objects;
CREATE POLICY "admin_insert_product_covers" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'product-covers' AND is_admin());

DROP POLICY IF EXISTS "admin_update_product_covers" ON storage.objects;
CREATE POLICY "admin_update_product_covers" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-covers' AND is_admin())
  WITH CHECK (bucket_id = 'product-covers' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_product_covers" ON storage.objects;
CREATE POLICY "admin_delete_product_covers" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-covers' AND is_admin());
