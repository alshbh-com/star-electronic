import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Phone, MapPin } from "lucide-react";
import { formatEGP } from "@/lib/format";

type Order = {
  id: string;
  customer_name: string;
  phone: string;
  governorate: string | null;
  address: string;
  total_price: number;
  status: string;
  created_at: string;
  notes: string | null;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      setOrders((data as Order[]) || []);
      setLoading(false);
    })();
  }, []);

  const loadItems = async (orderId: string) => {
    if (items[orderId]) return;
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setItems((p) => ({ ...p, [orderId]: data || [] }));
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", id);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  if (loading) return <Loader2 className="h-6 w-6 animate-spin mx-auto my-10 text-primary" />;

  return (
    <div>
      <h1 className="font-bold text-xl mb-4">الطلبات ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <details key={o.id} onToggle={() => loadItems(o.id)} className="bg-gradient-card border border-border/60 rounded-2xl p-4">
            <summary className="cursor-pointer flex flex-wrap justify-between items-center gap-2">
              <div>
                <p className="font-semibold">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("ar-EG")}</p>
              </div>
              <div className="text-left">
                <p className="font-bold text-primary">{formatEGP(o.total_price)}</p>
                <select
                  value={o.status}
                  onChange={(e) => { e.stopPropagation(); updateStatus(o.id, e.target.value); }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs bg-secondary border border-border rounded px-2 py-0.5"
                >
                  <option value="pending">قيد الانتظار</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="shipped">تم الشحن</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </summary>
            <div className="mt-3 pt-3 border-t border-border/60 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {o.phone}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {o.governorate} — {o.address}</p>
              {o.notes && <p className="text-muted-foreground">📝 {o.notes}</p>}
              {items[o.id] && (
                <ul className="space-y-1 mt-2">
                  {items[o.id].map((it: any) => (
                    <li key={it.id} className="flex justify-between bg-secondary/50 px-2 py-1 rounded">
                      <span>{it.product_name} × {it.quantity}</span>
                      <span className="font-semibold">{formatEGP(it.price * it.quantity)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;