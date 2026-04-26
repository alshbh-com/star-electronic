import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/logo.png";

export const Header = () => {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Star Electronics" className="h-10 w-10 rounded-lg object-cover" />
          <span className="font-display font-bold text-lg hidden sm:inline text-gradient-primary">
            Star Electronics
          </span>
        </Link>
        <Link
          to="/cart"
          className="relative p-2.5 rounded-xl bg-secondary hover:bg-secondary/70 transition-colors"
          aria-label="السلة"
        >
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-primary text-primary-foreground text-xs font-bold h-5 min-w-5 px-1 rounded-full flex items-center justify-center shadow-glow">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};