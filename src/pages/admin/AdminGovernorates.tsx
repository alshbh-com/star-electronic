import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const AdminGovernorates = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");

  const load = async () => {
    const { data } = await supabase.from("governorates").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("governorates").insert({ name: name.trim(), sort_order: items.length + 1 });
    if (error) return toast.error(error.message);
    setName("");
    load();
  };

  const toggle = async (g: any) => {
    await supabase.from("governorates").update({ is_active: !g.is_active }).eq("id", g.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف؟")) return;
    await supabase.from("governorates").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="font-bold text-xl mb-4">المحافظات ({items.length})</h1>
      <form onSubmit={add} className="flex gap-2 mb-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المحافظة" />
        <Button type="submit" className="bg-gradient-primary border-0"><Plus className="h-4 w-4" /></Button>
      </form>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((g) => (
          <div key={g.id} className={`flex items-center justify-between bg-gradient-card border border-border/60 rounded-xl p-3 ${!g.is_active && "opacity-50"}`}>
            <span>{g.name}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => toggle(g)}>
                {g.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(g.id)} className="text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGovernorates;