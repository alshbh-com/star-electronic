import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { formatEGP, finalPrice } from "@/lib/format";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount: number | null;
  stock: number;
};

export const ProductCard = ({ p, index = 0 }: { p: Product; index?: number }) => {
  const { add } = useCart();
  const navigate = useNavigate();
  const price = finalPrice(p.price, p.discount);
  const hasDiscount = p.discount && p.discount > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add({ id: p.id, name: p.name, price, image_url: p.image_url });
    toast.success("تمت الإضافة للسلة");
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${p.id}?buy=1`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        to={`/product/${p.id}`}
        className="group block bg-gradient-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/50 shadow-card hover:shadow-glow transition-all duration-300"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary">
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              لا توجد صورة
            </div>
          )}
          {hasDiscount ? (
            <span className="absolute top-2 right-2 bg-gradient-gold text-gold-foreground text-xs font-bold px-2 py-1 rounded-lg">
              -{p.discount}%
            </span>
          ) : null}
          {p.stock <= 0 && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center font-bold">
              نفذ المخزون
            </div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{p.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-primary text-lg">{formatEGP(price)}</span>
            {hasDiscount ? (
              <span className="text-xs text-muted-foreground line-through">{formatEGP(p.price)}</span>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAdd}
              disabled={p.stock <= 0}
              className="border-border/60 hover:border-primary/60 hover:bg-primary/10"
            >
              <ShoppingCart className="h-4 w-4 ml-1" />
              السلة
            </Button>
            <Button
              size="sm"
              onClick={handleBuy}
              disabled={p.stock <= 0}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 border-0"
            >
              <Zap className="h-4 w-4 ml-1" />
              اشتري
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};