/*
# Home page content editor: sections, texts and buttons

## Plain-English summary
The home page texts, sections and buttons are now stored in the database so an administrator can
edit, hide, reorder, create and delete them from the admin panel without touching code.
Every item keeps a published version (what visitors see) and an optional draft (what the
administrator is preparing). Publishing copies the draft into the published version.

## 1. New table: home_page_items
- id (uuid, primary key).
- kind (text): 'section', 'text' or 'button'.
- item_key (text, unique, optional): stable identifier of the built-in items that already exist on the home page
  (for example 'hero.title'). Custom items created by the administrator have no key and can be deleted.
- section_id (uuid, optional): the section a text or button belongs to. Sections have no parent.
- label (text): internal name shown in the admin panel.
- sort_order (integer): position inside its section (or among sections).
- is_visible (boolean): hidden items are not shown to visitors.
- published (jsonb): content visitors see. Text: role and content. Button: label, href, newTab, variant.
- draft (jsonb, optional): unpublished changes waiting to be published.
- created_at / updated_at (timestamptz).

## 2. Initial content
The current texts, section headings and hero buttons of the home page are inserted as built-in items,
so the editor starts from the real content. Nothing is invented.

## 3. Security
- Row level security is enabled.
- Visitors (anonymous and signed-in) can read only visible items, and anonymous visitors cannot read the draft column.
- Administrators (is_admin()) can read, create, update and delete items.
- Built-in items (item_key not null) cannot be deleted, only hidden.
- Changes are sent to visitors in real time through the realtime publication.

## Important notes
1. Existing tables and data are not changed.
2. The migration is safe to run again: inserts skip existing keys and policies are recreated.
*/

CREATE TABLE IF NOT EXISTS home_page_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  item_key text UNIQUE,
  section_id uuid REFERENCES home_page_items(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  published jsonb NOT NULL DEFAULT '{}'::jsonb,
  draft jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_items_kind_check') THEN
    ALTER TABLE home_page_items ADD CONSTRAINT home_page_items_kind_check
      CHECK (kind IN ('section', 'text', 'button'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_items_section_parent_check') THEN
    ALTER TABLE home_page_items ADD CONSTRAINT home_page_items_section_parent_check
      CHECK ((kind = 'section') = (section_id IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'home_page_items_label_check') THEN
    ALTER TABLE home_page_items ADD CONSTRAINT home_page_items_label_check
      CHECK (char_length(label) <= 120);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS home_page_items_section_idx ON home_page_items (section_id, sort_order);

ALTER TABLE home_page_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT (id, kind, item_key, section_id, label, sort_order, is_visible, published, created_at, updated_at)
  ON home_page_items TO anon;
GRANT SELECT ON home_page_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON home_page_items TO authenticated;

DROP TRIGGER IF EXISTS home_page_items_set_updated_at ON home_page_items;
CREATE TRIGGER home_page_items_set_updated_at BEFORE UPDATE ON home_page_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "public_select_visible_page_items" ON home_page_items;
CREATE POLICY "public_select_visible_page_items" ON home_page_items FOR SELECT
  TO anon, authenticated USING (is_visible);

DROP POLICY IF EXISTS "admin_select_all_page_items" ON home_page_items;
CREATE POLICY "admin_select_all_page_items" ON home_page_items FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_insert_page_items" ON home_page_items;
CREATE POLICY "admin_insert_page_items" ON home_page_items FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_page_items" ON home_page_items;
CREATE POLICY "admin_update_page_items" ON home_page_items FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_custom_page_items" ON home_page_items;
CREATE POLICY "admin_delete_custom_page_items" ON home_page_items FOR DELETE
  TO authenticated USING (is_admin() AND item_key IS NULL);

INSERT INTO home_page_items (kind, item_key, label, sort_order, published) VALUES
  ('section', 'hero', 'Destaque principal', 10, '{}'),
  ('section', 'categories', 'Categorias', 20, '{}'),
  ('section', 'bestsellers', 'Mais vendidos', 30, '{}'),
  ('section', 'launches', 'Lançamentos', 40, '{}'),
  ('section', 'offers', 'Promoções', 50, '{}'),
  ('section', 'specials', 'Seleção especial', 60, '{}'),
  ('section', 'benefits', 'Vantagens', 70, '{}'),
  ('section', 'brand', 'Sobre a EDVORA', 80, '{}'),
  ('section', 'newsletter', 'Newsletter', 90, '{}')
ON CONFLICT (item_key) DO NOTHING;

INSERT INTO home_page_items (kind, item_key, section_id, label, sort_order, published)
SELECT 'text', v.item_key, (SELECT id FROM home_page_items WHERE item_key = v.section_key), v.label, v.sort_order,
       jsonb_build_object('role', v.role, 'content', v.content)
FROM (VALUES
  ('hero.eyebrow', 'hero', 'Texto de destaque (topo)', 10, 'eyebrow', 'Plataforma de conteúdos digitais'),
  ('hero.title', 'hero', 'Título principal', 20, 'title', 'Conhecimento que transforma possibilidades em conquistas.'),
  ('hero.subtitle', 'hero', 'Texto de apresentação', 30, 'description', 'A EDVORA reúne eBooks, guias digitais e materiais educativos para você aprender, evoluir e alcançar novos objetivos.'),
  ('categories.eyebrow', 'categories', 'Título da seção (topo)', 10, 'eyebrow', 'Categorias'),
  ('categories.title', 'categories', 'Título da seção', 20, 'title', 'Encontre o conteúdo certo para cada fase'),
  ('categories.description', 'categories', 'Descrição da seção', 30, 'description', 'Explore temas organizados para que você avance no seu ritmo, do primeiro passo à próxima conquista.'),
  ('bestsellers.eyebrow', 'bestsellers', 'Título da seção (topo)', 10, 'eyebrow', 'Mais vendidos'),
  ('bestsellers.title', 'bestsellers', 'Título da seção', 20, 'title', 'Os favoritos de quem já aprendeu com a EDVORA'),
  ('launches.eyebrow', 'launches', 'Título da seção (topo)', 10, 'eyebrow', 'Lançamentos'),
  ('launches.title', 'launches', 'Título da seção', 20, 'title', 'Novidades recém-chegadas'),
  ('offers.eyebrow', 'offers', 'Título da seção (topo)', 10, 'eyebrow', 'Promoções'),
  ('offers.title', 'offers', 'Título da seção', 20, 'title', 'Ofertas por tempo especial'),
  ('specials.eyebrow', 'specials', 'Título da seção (topo)', 10, 'eyebrow', 'Seleção especial'),
  ('specials.title', 'specials', 'Título da seção', 20, 'title', 'Escolhas da curadoria EDVORA'),
  ('benefits.eyebrow', 'benefits', 'Título da seção (topo)', 10, 'eyebrow', 'Vantagens'),
  ('benefits.title', 'benefits', 'Título da seção', 20, 'title', 'Por que comprar na EDVORA'),
  ('brand.eyebrow', 'brand', 'Título da seção (topo)', 10, 'eyebrow', 'Sobre a EDVORA'),
  ('brand.title', 'brand', 'Título da seção', 20, 'title', 'Transformamos conhecimento em possibilidades reais.'),
  ('brand.description', 'brand', 'Descrição da seção', 30, 'description', 'A EDVORA nasceu para tornar o aprendizado profissional mais acessível e mais útil. Reunimos eBooks, guias digitais e materiais educativos criados por quem valoriza método, clareza e resultado. Nosso compromisso é oferecer conteúdo que você consiga aplicar de verdade, com uma experiência de compra transparente do início ao fim.'),
  ('newsletter.eyebrow', 'newsletter', 'Título da seção (topo)', 10, 'eyebrow', 'Receba nossas novidades'),
  ('newsletter.title', 'newsletter', 'Título da seção', 20, 'title', 'Receba novidades e ofertas antes de todo mundo.'),
  ('newsletter.description', 'newsletter', 'Descrição da seção', 30, 'description', 'Lançamentos, conteúdos selecionados e promoções especiais direto na sua caixa de entrada.')
) AS v(item_key, section_key, label, sort_order, role, content)
ON CONFLICT (item_key) DO NOTHING;

INSERT INTO home_page_items (kind, item_key, section_id, label, sort_order, published)
SELECT 'button', v.item_key, (SELECT id FROM home_page_items WHERE item_key = 'hero'), v.label, v.sort_order,
       jsonb_build_object('label', v.button_label, 'href', v.href, 'newTab', false, 'variant', v.variant)
FROM (VALUES
  ('hero.primary', 'Botão principal', 40, 'Explorar produtos', '/produtos', 'primary'),
  ('hero.secondary', 'Botão secundário', 50, 'Conheça a EDVORA', '/#sobre', 'secondary')
) AS v(item_key, label, sort_order, button_label, href, variant)
ON CONFLICT (item_key) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'home_page_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.home_page_items;
  END IF;
END $$;
