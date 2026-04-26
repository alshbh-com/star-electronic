import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { CheckoutForm, CheckoutData } from "@/components/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { formatEGP, finalPrice } from "@/lib/format";
import { buildOrderMessage, buildWhatsappLink, getWhatsappNumber } from "@/lib/whatsapp";
import { Loader2, ShoppingCart, Zap, ArrowRight } from "lucide-react";
import { toast } from "sonner";

type FullProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  discount: number | null;
  stock: number;
};

const ProductPage = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBuy, setShowBuy] = useState(params.get("buy") === "1");
  const [submitting, setSubmitting] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("products")
      .select("id,name,price,image_url,description,discount,stock")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as FullProduct | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="text-center py-20">المنتج غير موجود</div>
      </div>
    );
  }

  const price = finalPrice(product.price, product.discount);
  const total = price * qty;

  const handleAddToCart = () => {
    add({ id: product.id, name: product.name, price, image_url: product.image_url }, qty);
    toast.success("تمت الإضافة للسلة");
  };

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

      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price,
        quantity: qty,
      });

      const wa = await getWhatsappNumber();
      const msg = buildOrderMessage({
        customer: d.customer_name,
        phone: d.phone,
        governorate: d.governorate,
        address: d.address,
        notes: d.notes,
        lines: [{ name: product.name, qty, price }],
        total,
      });
      window.location.href = buildWhatsappLink(wa, msg);
    } catch (e: any) {
      toast.error(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <Header />
      <main className="container mx-auto px-4 py-4 max-w-3xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground">
          <ArrowRight className="h-4 w-4" /> رجوع
        </button>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border/60">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-3xl text-gradient-primary">{formatEGP(price)}</span>
              {product.discount && product.discount > 0 ? (
                <span className="text-base text-muted-foreground line-through">{formatEGP(product.price)}</span>
              ) : null}
            </div>
            {product.description ? (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            ) : null}

            <div className="flex items-center gap-3">
              <span className="text-sm">الكمية:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1 hover:bg-secondary">-</button>
                <span className="px-4 font-bold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-1 hover:bg-secondary">+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button variant="outline" size="lg" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart className="h-5 w-5 ml-2" /> أضف للسلة
              </Button>
              <Button size="lg" onClick={() => setShowBuy(true)} disabled={product.stock <= 0}
                className="bg-gradient-primary text-primary-foreground border-0 shadow-glow">
                <Zap className="h-5 w-5 ml-2" /> اشتري الآن
              </Button>
            </div>
          </div>
        </div>

        {showBuy && (
          <div className="mt-8 bg-gradient-card rounded-2xl p-5 border border-border/60 shadow-card animate-fade-up">
            <h2 className="font-bold text-lg mb-4">إتمام الطلب — الإجمالي: <span className="text-primary">{formatEGP(total)}</span></h2>
            <CheckoutForm onSubmit={handleSubmit} submitting={submitting} />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductPage;