import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const [s, setS] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("settings").select("*").limit(1).maybeSingle().then(({ data }) => setS(data || {}));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        platform_name: s.platform_name,
        whatsapp_number: s.whatsapp_number,
        logo_url: s.logo_url,
        tagline: s.tagline,
        admin_password: s.admin_password,
      };
      const res = s.id
        ? await supabase.from("settings").update(payload).eq("id", s.id)
        : await supabase.from("settings").insert(payload).select().single();
      if (res.error) throw res.error;
      toast.success("تم الحفظ");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!s) return <Loader2 className="h-6 w-6 animate-spin mx-auto my-10 text-primary" />;

  return (
    <div className="max-w-md space-y-4">
      <h1 className="font-bold text-xl">الإعدادات</h1>
      <div><Label>اسم المتجر</Label><Input value={s.platform_name || ""} onChange={(e) => setS({ ...s, platform_name: e.target.value })} /></div>
      <div><Label>الشعار / الوصف</Label><Input value={s.tagline || ""} onChange={(e) => setS({ ...s, tagline: e.target.value })} /></div>
      <div><Label>رقم الواتساب</Label><Input value={s.whatsapp_number || ""} onChange={(e) => setS({ ...s, whatsapp_number: e.target.value })} /></div>
      <div><Label>رابط اللوجو</Label><Input value={s.logo_url || ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })} /></div>
      <div><Label>كلمة مرور الأدمن</Label><Input type="text" value={s.admin_password || ""} onChange={(e) => setS({ ...s, admin_password: e.target.value })} /></div>
      <Button onClick={save} disabled={saving} className="w-full bg-gradient-primary border-0">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
      </Button>
    </div>
  );
};

export default AdminSettings;