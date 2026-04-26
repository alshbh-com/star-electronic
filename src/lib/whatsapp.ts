import { supabase } from "@/integrations/supabase/client";

const FALLBACK_NUMBER = "01278006248";

export async function getWhatsappNumber(): Promise<string> {
  // settings table SELECT is admin-only; we use a public RPC fallback approach:
  // try anon read — if blocked, return fallback.
  const { data } = await supabase.from("settings").select("whatsapp_number").maybeSingle();
  return data?.whatsapp_number || FALLBACK_NUMBER;
}

export function buildWhatsappLink(phone: string, message: string) {
  const normalized = phone.replace(/[^0-9]/g, "").replace(/^0/, "20");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export type OrderLine = { name: string; qty: number; price: number };

export function buildOrderMessage(opts: {
  platform?: string;
  customer: string;
  phone: string;
  governorate: string;
  address: string;
  lines: OrderLine[];
  total: number;
  notes?: string;
}) {
  const { platform = "Star Electronics", customer, phone, governorate, address, lines, total, notes } = opts;
  const itemsText = lines
    .map((l, i) => `${i + 1}- ${l.name} × ${l.qty} = ${l.price * l.qty} ج.م`)
    .join("\n");
  return `🛒 *طلب جديد - ${platform}*

👤 الاسم: ${customer}
📱 الهاتف: ${phone}
🌍 المحافظة: ${governorate}
📍 العنوان: ${address}

*المنتجات:*
${itemsText}

💰 *الإجمالي: ${total} ج.م*${notes ? `\n\n📝 ملاحظات: ${notes}` : ""}`;
}