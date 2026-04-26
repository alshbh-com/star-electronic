-- 1. Categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active categories"
ON public.categories FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage categories"
ON public.categories FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed with current enum values
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('موبايلات', 'mobiles', 1),
  ('لابتوبات', 'laptops', 2),
  ('سماعات', 'headphones', 3),
  ('إكسسوارات', 'accessories', 4),
  ('أجهزة ذكية', 'smart_devices', 5),
  ('عروض', 'offers', 6);

-- 2. Convert products.category from enum to text (slug reference)
ALTER TABLE public.products ALTER COLUMN category TYPE TEXT USING category::text;
ALTER TABLE public.products ALTER COLUMN category SET DEFAULT 'accessories';

-- 3. Delivery price per governorate
ALTER TABLE public.governorates
  ADD COLUMN IF NOT EXISTS delivery_price NUMERIC NOT NULL DEFAULT 0;

-- 4. Delivery price snapshot per order
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_price NUMERIC NOT NULL DEFAULT 0;