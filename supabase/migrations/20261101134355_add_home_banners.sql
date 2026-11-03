/*
# Home page banner carousel: banners table and image bucket

## Plain-English summary
Administrators can now upload horizontal promotional banners for the home page, order them,
turn them on or off, set how long each one stays on screen, add an optional mobile version,
and add an optional destination link. Visitors can only read banners that are switched on.

## 1. New table: home_banners
- id (uuid, primary key): unique identifier.
- desktop_image_url (text, required): banner image for computers and tablets. Must be an https link.
- mobile_image_url (text, optional): banner image for phones. Must be an https link when present.
- link_url (text, optional): destination when the banner is clicked. Must be an https link when present.
- alt_text (text, default ''): description read by screen readers, up to 160 characters.
- display_seconds (integer, default 6): how long the banner stays on screen, between 3 and 30 seconds.
- sort_order (integer, default 0): position in the carousel; lower numbers appear first.
- is_active (boolean, default true): when false, the banner is hidden from visitors.
- created_at / updated_at (timestamptz): creation and last change times. updated_at is set automatically.

## 2. Security
- Row level security is enabled on home_banners.
- Visitors (anonymous and signed-in) can read only banners where is_active is true.
- Administrators (role 'admin') can read all banners, including inactive ones.
- Only administrators can insert, update, or delete banners.
- Only administrators can write to the home-banners storage bucket.

## 3. Storage
- New public bucket 'home-banners' for banner images.
- Limit 8 MB per file; accepted types: JPEG, PNG, WebP.

## Important notes
1. Existing tables and data are not changed.
2. The migration is safe to run again: every statement checks whether it already exists.
*/

CREATE TABLE IF NOT EXISTS home_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  desktop_image_url text NOT NULL,
  mobile_image_url text,
  link_url text,
  alt_text text NOT NULL DEFAULT '',
  display_seconds integer NOT NULL DEFAULT 6,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_banners_desktop_url_check') THEN
    ALTER TABLE home_banners ADD CONSTRAINT home_banners_desktop_url_check
      CHECK (desktop_image_url ~* '^https://[^[:space:]]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_banners_mobile_url_check') THEN
    ALTER TABLE home_banners ADD CONSTRAINT home_banners_mobile_url_check
      CHECK (mobile_image_url IS NULL OR mobile_image_url ~* '^https://[^[:space:]]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_banners_link_url_check') THEN
    ALTER TABLE home_banners ADD CONSTRAINT home_banners_link_url_check
      CHECK (link_url IS NULL OR link_url ~* '^https://[^[:space:]]+$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_banners_display_seconds_check') THEN
    ALTER TABLE home_banners ADD CONSTRAINT home_banners_display_seconds_check
      CHECK (display_seconds BETWEEN 3 AND 30);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_banners_alt_text_check') THEN
    ALTER TABLE home_banners ADD CONSTRAINT home_banners_alt_text_check
      CHECK (char_length(alt_text) <= 160);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS home_banners_sort_idx ON home_banners (sort_order, created_at);

ALTER TABLE home_banners ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON home_banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON home_banners TO authenticated;

DROP TRIGGER IF EXISTS home_banners_set_updated_at ON home_banners;
CREATE TRIGGER home_banners_set_updated_at BEFORE UPDATE ON home_banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "public_select_active_banners" ON home_banners;
CREATE POLICY "public_select_active_banners" ON home_banners FOR SELECT
  TO anon, authenticated USING (is_active);

DROP POLICY IF EXISTS "admin_select_all_banners" ON home_banners;
CREATE POLICY "admin_select_all_banners" ON home_banners FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_banners" ON home_banners;
CREATE POLICY "admin_insert_banners" ON home_banners FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_banners" ON home_banners;
CREATE POLICY "admin_update_banners" ON home_banners FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_banners" ON home_banners;
CREATE POLICY "admin_delete_banners" ON home_banners FOR DELETE
  TO authenticated USING (is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('home-banners', 'home-banners', true, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "admin_insert_home_banners" ON storage.objects;
CREATE POLICY "admin_insert_home_banners" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'home-banners' AND is_admin());

DROP POLICY IF EXISTS "admin_update_home_banners" ON storage.objects;
CREATE POLICY "admin_update_home_banners" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'home-banners' AND is_admin())
  WITH CHECK (bucket_id = 'home-banners' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_home_banners" ON storage.objects;
CREATE POLICY "admin_delete_home_banners" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'home-banners' AND is_admin());
