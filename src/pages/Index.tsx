import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ProductCard, Product } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("products")
      .select("id,name,price,image_url,discount,stock")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setProducts((data as Product[]) || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-3 py-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            لا توجد منتجات حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p, i) => (
              <ProductCard key={p.id} p={p} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
