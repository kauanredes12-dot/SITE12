/*
# Create user profiles, roles and admin check

## Plain-English summary
Every person who signs up gets a profile row with their name, email, signup date and a role.
Roles are "customer" (default) or "admin". Customers can only edit their own name. Nobody can
change their own role from the browser; only a privileged database function (added later for
the admin area) can change roles, and it checks the caller is already an admin.

## 1. New table: profiles
- id (uuid, primary key): same id as the Supabase login account (auth.users).
- email (text): copy of the account email, shown in the customer area.
- full_name (text): display name, 2 to 120 characters, editable by the owner.
- role (text): 'customer' or 'admin'. Defaults to 'customer'.
- created_at (timestamptz): signup date.

## 2. Automatic profile creation
- A trigger on new accounts creates the matching profile. The role is always 'customer';
  the signup form cannot set it.

## 3. Admin check function: is_admin()
- Returns true when the logged-in user has role 'admin'. Used by later admin policies.
- Only signed-in users may call it.

## 4. Security
- Row level security enabled on profiles.
- Logged-in users can read only their own profile.
- Logged-in users can update only their own full_name. The role column is not writable.
- No insert or delete from the browser; creation happens via the trigger only.
- Default table access for anonymous visitors is removed from profiles.
- Anonymous visitors lose write access (insert, update, delete) on products and categories,
  and read or update access on newsletter emails. Public reads and newsletter sign-up are unchanged.

## Important notes
1. Existing auth accounts (if any) receive a profile during this migration.
2. The first administrator is granted manually by the project owner (see the admin stage).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 120),
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT UPDATE (full_name) ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile_name" ON profiles;
CREATE POLICY "update_own_profile_name" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NULLIF(left(btrim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), 120), ''),
      'Cliente EDVORA'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO profiles (id, email, full_name)
SELECT u.id, COALESCE(u.email, ''), 'Cliente EDVORA'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON products, categories FROM anon;
REVOKE SELECT, UPDATE, DELETE ON newsletter_subscribers FROM anon;
