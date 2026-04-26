-- Drop the problematic view if exists
DROP VIEW IF EXISTS public.settings_public;

-- Create a SECURITY DEFINER function that exposes only public fields
CREATE OR REPLACE FUNCTION public.get_public_settings()
RETURNS TABLE (
  id UUID,
  platform_name TEXT,
  whatsapp_number TEXT,
  logo_url TEXT,
  tagline TEXT,
  primary_color TEXT,
  secondary_color TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, platform_name, whatsapp_number, logo_url, tagline, primary_color, secondary_color
  FROM public.settings
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_settings() TO anon, authenticated;

-- Seed default settings if empty
INSERT INTO public.settings (platform_name, whatsapp_number, tagline, admin_password)
SELECT 'Star Electronics', '01278006248', 'Smart Technology, Better Life', '01278006248'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);