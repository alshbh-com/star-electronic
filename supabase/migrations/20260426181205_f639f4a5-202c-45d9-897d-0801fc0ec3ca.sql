-- Hash existing plaintext password
UPDATE public.settings
SET admin_password = extensions.crypt(admin_password, extensions.gen_salt('bf', 10))
WHERE admin_password IS NOT NULL
  AND admin_password <> ''
  AND admin_password NOT LIKE '$2%';

-- Secure verifier
CREATE OR REPLACE FUNCTION public.verify_admin_password(_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.settings
    WHERE admin_password = extensions.crypt(_password, admin_password)
    LIMIT 1
  );
$$;

-- Auto-hash trigger
CREATE OR REPLACE FUNCTION public.hash_admin_password()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.admin_password IS NOT NULL
     AND NEW.admin_password <> ''
     AND NEW.admin_password NOT LIKE '$2%' THEN
    NEW.admin_password := extensions.crypt(NEW.admin_password, extensions.gen_salt('bf', 10));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS settings_hash_admin_password ON public.settings;
CREATE TRIGGER settings_hash_admin_password
BEFORE INSERT OR UPDATE OF admin_password ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.hash_admin_password();

GRANT EXECUTE ON FUNCTION public.verify_admin_password(text) TO anon, authenticated;