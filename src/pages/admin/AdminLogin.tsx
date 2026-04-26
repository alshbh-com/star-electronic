import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const AdminLogin = () => {
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-bootstrap", {
        body: { password: pwd },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signErr) throw signErr;
      toast.success("مرحباً");
      navigate("/admin");
    } catch (e: any) {
      toast.error(e.message || "خطأ في الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={handle} className="w-full max-w-sm bg-gradient-card border border-border/60 rounded-2xl p-6 shadow-card space-y-5">
        <div className="text-center space-y-2">
          <img src={logo} alt="" className="h-16 w-16 mx-auto rounded-xl" />
          <h1 className="font-bold text-xl">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">أدخل كلمة المرور للمتابعة</p>
        </div>
        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="كلمة المرور"
            className="pr-10"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-gradient-primary border-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "دخول"}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;