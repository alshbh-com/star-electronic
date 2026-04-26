import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Package, ShoppingBag, MapPin, Settings as SettingsIcon, Loader2, Home, Layers } from "lucide-react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return navigate("/admin/login");
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.session.user.id)
        .eq("role", "admin");
      if (!roles?.length) return navigate("/admin/login");
      setReady(true);
    };
    check();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const link = "flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm";
  const active = "bg-primary/15 text-primary font-semibold";

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-30">
        <div className="container mx-auto h-14 px-4 flex items-center justify-between">
          <Link to="/admin" className="font-bold text-gradient-primary">لوحة Star</Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" /> المتجر
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 ml-1" /> خروج
            </Button>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-4 grid md:grid-cols-[200px_1fr] gap-4">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          <NavLink to="/admin" end className={({ isActive }) => `${link} ${isActive ? active : ""}`}>
            <Package className="h-4 w-4" /> المنتجات
          </NavLink>
          <NavLink to="/admin/categories" className={({ isActive }) => `${link} ${isActive ? active : ""}`}>
            <Layers className="h-4 w-4" /> الأقسام
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `${link} ${isActive ? active : ""}`}>
            <ShoppingBag className="h-4 w-4" /> الطلبات
          </NavLink>
          <NavLink to="/admin/governorates" className={({ isActive }) => `${link} ${isActive ? active : ""}`}>
            <MapPin className="h-4 w-4" /> المحافظات
          </NavLink>
          <NavLink to="/admin/settings" className={({ isActive }) => `${link} ${isActive ? active : ""}`}>
            <SettingsIcon className="h-4 w-4" /> الإعدادات
          </NavLink>
        </nav>
        <main><Outlet /></main>
      </div>
    </div>
  );
};

export default AdminLayout;