import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Eye, EyeOff, Check } from "lucide-react";
import { toast } from "sonner";

const AdminGovernorates = () => {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [editPrices, setEditPrices] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase.from("governorates").select("*").order("sort_order");
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("governorates").insert({
      name: name.trim(),
      delivery_price: Number(price) || 0,
      sort_order: items.length + 1,
    });
    if (error) return toast.error(error.message);
    setName(""); setPrice(0);
    toast.success("تمت الإضافة");
    load();
  };

  const toggle = async (g: any) => {
    await supabase.from("governorates").update({ is_active: !g.is_active }).eq("id", g.id);
    load();
  };

  const savePrice = async (id: string) => {
    const v = editPrices[id];
    if (v === undefined) return;
    const { error } = await supabase.from("governorates").update({ delivery_price: v }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم تحديث السعر");
    setEditPrices((p) => { const n = { ...p }; delete n[id]; return n; });
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
      <form onSubmit={add} className="bg-gradient-card border border-border/60 rounded-2xl p-4 mb-4 grid sm:grid-cols-[1fr_140px_auto] gap-2 items-end">
        <div>
          <Label>اسم المحافظة</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: المنيا" />
        </div>
        <div>
          <Label>سعر التوصيل</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} placeholder="0" />
        </div>
        <Button type="submit" className="bg-gradient-primary border-0">
          <Plus className="h-4 w-4 ml-1" /> إضافة
        </Button>
      </form>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((g) => (
          <div key={g.id} className={`flex items-center gap-2 bg-gradient-card border border-border/60 rounded-xl p-3 ${!g.is_active && "opacity-50"}`}>
            <span className="flex-1 font-semibold">{g.name}</span>
            <Input
              type="number"
              className="w-24 h-8"
              value={editPrices[g.id] ?? g.delivery_price ?? 0}
              onChange={(e) => setEditPrices((p) => ({ ...p, [g.id]: Number(e.target.value) }))}
            />
            <span className="text-xs text-muted-foreground">ج.م</span>
            {editPrices[g.id] !== undefined && editPrices[g.id] !== g.delivery_price && (
              <Button size="sm" variant="ghost" onClick={() => savePrice(g.id)} className="text-primary">
                <Check className="h-3 w-3" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => toggle(g)}>
              {g.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove(g.id)} className="text-destructive">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminGovernorates;