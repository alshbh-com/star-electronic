import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatEGP, finalPrice } from "@/lib/format";

export type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount: number | null;
  stock: number;
};

export const ProductCard = ({ p, index = 0 }: { p: Product; index?: number }) => {
  const price = finalPrice(p.price, p.discount);
  const hasDiscount = p.discount && p.discount > 0;

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
        </div>
      </Link>
    </motion.div>
  );
};