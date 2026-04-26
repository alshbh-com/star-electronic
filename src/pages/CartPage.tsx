import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { CheckoutForm, CheckoutData } from "@/components/CheckoutForm";
import { formatEGP } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { buildOrderMessage, buildWhatsappLink, getWhatsappNumber } from "@/lib/whatsapp";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const CartPage = () => {
  const { items, remove, setQty, total, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (d: CheckoutData) => {
    setSubmitting(true);
    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_name: d.customer_name,
          phone: d.phone,
          governorate: d.governorate,
          address: d.address,
          notes: d.notes || null,
          total_price: total,
        })
        .select()
        .single();
      if (error) throw error;

      await supabase.from("order_items").insert(
        items.map((i) => ({
          order_id: order.id,
          product_id: i.id,
          product_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
      );

      const wa = await getWhatsappNumber();
      const msg = buildOrderMessage({
        customer: d.customer_name,
        phone: d.phone,
        governorate: d.governorate,
        address: d.address,
        notes: d.notes,
        lines: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
        total,
      });
      clear();
      window.location.href = buildWhatsappLink(wa, msg);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground mb-6">السلة فارغة</p>
          <Link to="/">
            <Button className="bg-gradient-primary border-0">تصفح المنتجات</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-2xl space-y-3">
        <h1 className="font-bold text-xl mb-2">السلة ({items.length})</h1>

        {items.map((i) => (
          <div key={i.id} className="flex gap-3 bg-gradient-card rounded-2xl p-3 border border-border/60">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
              {i.image_url && <img src={i.image_url} alt={i.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2">{i.name}</h3>
              <p className="text-primary font-bold mt-1">{formatEGP(i.price)}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQty(i.id, i.quantity - 1)} className="px-2 py-1"><Minus className="h-3 w-3" /></button>
                  <span className="px-3 text-sm font-bold">{i.quantity}</span>
                  <button onClick={() => setQty(i.id, i.quantity + 1)} className="px-2 py-1"><Plus className="h-3 w-3" /></button>
                </div>
                <button onClick={() => remove(i.id)} className="text-destructive p-1.5">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-gradient-card rounded-2xl p-4 border border-border/60 shadow-card sticky bottom-3">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted-foreground">الإجمالي</span>
            <span className="font-display font-bold text-2xl text-gradient-primary">{formatEGP(total)}</span>
          </div>
          {!checkout ? (
            <Button onClick={() => setCheckout(true)} size="lg" className="w-full bg-gradient-primary border-0 shadow-glow">
              متابعة الدفع
            </Button>
          ) : (
            <CheckoutForm onSubmit={handleSubmit} submitting={submitting} />
          )}
        </div>
      </main>
    </div>
  );
};

export default CartPage;