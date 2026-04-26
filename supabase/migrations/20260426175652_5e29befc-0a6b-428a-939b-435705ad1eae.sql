-- Governorates table
CREATE TABLE public.governorates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.governorates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view active governorates"
ON public.governorates FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage governorates"
ON public.governorates FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add governorate to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS governorate TEXT;

-- Seed Egyptian governorates
INSERT INTO public.governorates (name, sort_order) VALUES
  ('القاهرة', 1),
  ('الجيزة', 2),
  ('القليوبية', 3),
  ('المنوفية', 4),
  ('الإسكندرية', 5),
  ('الدقهلية', 6),
  ('الشرقية', 7),
  ('الغربية', 8),
  ('كفر الشيخ', 9),
  ('دمياط', 10),
  ('بورسعيد', 11),
  ('الإسماعيلية', 12),
  ('السويس', 13),
  ('بني سويف', 14),
  ('الفيوم', 15),
  ('المنيا', 16),
  ('أسيوط', 17),
  ('سوهاج', 18),
  ('قنا', 19),
  ('الأقصر', 20),
  ('أسوان', 21),
  ('البحر الأحمر', 22),
  ('الوادي الجديد', 23),
  ('مطروح', 24),
  ('شمال سيناء', 25),
  ('جنوب سيناء', 26),
  ('البحيرة', 27);