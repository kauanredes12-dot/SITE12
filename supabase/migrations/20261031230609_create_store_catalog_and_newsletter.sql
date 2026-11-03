/*
# Create EDVORA store catalog and newsletter tables

1. New Tables
- `categories`: store categories used to organize digital products (name, slug, description, display order).
- `products`: digital products (eBooks, guides, educational materials) with title, description, benefits, table of contents, prices (in cents), promotional price, cover image, external checkout link, sales count and visibility flags.
- `newsletter_subscribers`: people who subscribed to news and offers (name, unique email).

2. Security
- Row Level Security enabled on all three tables.
- `categories` and active `products` are readable by visitors (anon and signed-in roles), since the storefront is public.
- Inactive products are never exposed to visitors.
- `newsletter_subscribers` accepts inserts from visitors only; it has no read grant, so emails cannot be listed from the browser.
- Product and category writes are not granted to browser roles; they will be handled by a protected admin area later.

3. Important Notes
- Prices are stored as integer cents to avoid rounding errors.
- A promotional price must be lower than the regular price (enforced by a check constraint).
- Email uniqueness is case-insensitive, preventing duplicate newsletter sign-ups.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text,
  description text NOT NULL DEFAULT '',
  benefits text[] NOT NULL DEFAULT '{}',
  table_of_contents text[] NOT NULL DEFAULT '{}',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  promo_price_cents integer CHECK (promo_price_cents IS NULL OR (promo_price_cents >= 0 AND promo_price_cents < price_cents)),
  cover_url text,
  checkout_url text,
  format text NOT NULL DEFAULT 'PDF',
  pages integer CHECK (pages IS NULL OR pages > 0),
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  sales_count integer NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_key ON newsletter_subscribers (lower(email));

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT ON newsletter_subscribers TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_active_products" ON products;
CREATE POLICY "public_read_active_products" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "public_subscribe_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_subscribe_newsletter" ON newsletter_subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);
