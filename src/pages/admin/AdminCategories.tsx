import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) =>
  s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_\u0600-\u06FF]/g, "");

const AdminCategories = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const finalSlug = slug.trim() || slugify(name);
    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: finalSlug,
      sort_order: items.length + 1,
    });
    if (error) return toast.error(error.message);
    setName(""); setSlug("");
    toast.success("تمت الإضافة");
    load();
  };

  const toggle = async (c: any) => {
    await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا القسم؟")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <h1 className="font-bold text-xl mb-4">الأقسام ({items.length})</h1>
      <form onSubmit={add} className="bg-gradient-card border border-border/60 rounded-2xl p-4 space-y-3 mb-4">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <Label>اسم القسم *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: ساعات ذكية" />
          </div>
          <div>
            <Label>المعرّف (تلقائي)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="smart_watches" />
          </div>
        </div>
        <Button type="submit" className="bg-gradient-primary border-0">
          <Plus className="h-4 w-4 ml-1" /> إضافة قسم
        </Button>
      </form>

      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((c) => (
          <div key={c.id} className={`flex items-center justify-between bg-gradient-card border border-border/60 rounded-xl p-3 ${!c.is_active && "opacity-50"}`}>
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.slug}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => toggle(c)}>
                {c.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;