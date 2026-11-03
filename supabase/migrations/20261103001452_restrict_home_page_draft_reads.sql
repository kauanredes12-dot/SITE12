/*
# Restrict home page draft reads to administrators

## Summary
Draft content of the home page editor could be read by any signed-in user, because the
signed-in role had table-wide read access. This migration removes that access and exposes
drafts only through an administrator-only function.

## 1. Changed objects
- `home_page_items`: the signed-in role loses table-wide SELECT and receives column-level
  SELECT on every column except `draft`.
- New function `admin_list_home_page_items()`: returns all rows including `draft`, only when
  `is_admin()` is true. Runs with definer rights so column restrictions do not block admins.

## 2. Security
- `anon` keeps its existing column-level SELECT (no `draft`).
- `authenticated` cannot read `draft` directly anymore.
- The function is executable only by `authenticated`; `PUBLIC` and `anon` are revoked.
- Non-admins calling the function receive a permission error.

## 3. Notes
- No data is removed or changed. Existing policies stay in place.
- Idempotent: the grant changes and the function use replace-if-exists semantics.
*/

REVOKE SELECT ON home_page_items FROM authenticated;
GRANT SELECT (id, kind, item_key, section_id, label, sort_order, is_visible, published, created_at, updated_at)
  ON home_page_items TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_home_page_items()
RETURNS SETOF public.home_page_items
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso restrito a administradores' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY SELECT * FROM public.home_page_items ORDER BY sort_order ASC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_home_page_items() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_home_page_items() TO authenticated;
