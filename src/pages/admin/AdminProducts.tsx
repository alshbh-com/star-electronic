import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, X, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatEGP } from "@/lib/format";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  stock: number;
  discount: number | null;
  is_active: boolean;
  category: string;
};

const empty = {
  name: "",
  price: 0,
  description: "",
  image_url: "",
  stock: 10,
  discount: 0,
  category: "accessories",
  is_active: true,
};

const AdminProducts = () => {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("slug, name").eq("is_active", true).order("sort_order"),
    ]);
    setItems((p as Product[]) || []);
    setCategories((c as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing.price) return toast.error("اسم وسعر مطلوبين");
    const payload: any = {
      name: editing.name,
      price: Number(editing.price),
      description: editing.description || null,
      image_url: editing.image_url || null,
      stock: Number(editing.stock || 0),
      discount: Number(editing.discount || 0),
      category: editing.category || "accessories",
      is_active: editing.is_active ?? true,
    };
    const res = editing.id
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return toast.error(res.error.message);
    toast.success("تم الحفظ");
    setOpen(false);
    setEditing(null);
    load();
  };

  const toggleActive = async (p: Product) => {
    await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذا المنتج؟")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("تم الحذف");
    load();
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `products/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setEditing((p) => ({ ...p, image_url: data.publicUrl }));
    } catch (e: any) {
      toast.error(e.message || "فشل الرفع — تأكد من إنشاء bucket باسم product-images");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-bold text-xl">المنتجات ({items.length})</h1>
        <Button onClick={() => { setEditing(empty as any); setOpen(true); }} className="bg-gradient-primary border-0">
          <Plus className="h-4 w-4 ml-1" /> منتج جديد
        </Button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-10 text-primary" /> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((p) => (
            <div key={p.id} className={`bg-gradient-card border border-border/60 rounded-2xl p-3 ${!p.is_active && "opacity-60"}`}>
              <div className="flex gap-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm line-clamp-1">{p.name}</h3>
                  <p className="text-primary font-bold">{formatEGP(p.price)}</p>
                  <p className="text-xs text-muted-foreground">المخزون: {p.stock}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(p); setOpen(true); }}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleActive(p)}>
                  {p.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {open && editing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-md space-y-3 my-8">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">{editing.id ? "تعديل" : "منتج جديد"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div><Label>الاسم</Label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>السعر</Label><Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} /></div>
              <div><Label>المخزون</Label><Input type="number" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} /></div>
            </div>
            <div><Label>خصم %</Label><Input type="number" value={editing.discount || 0} onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })} /></div>
            <div>
              <Label>التصنيف</Label>
              <select
                value={editing.category || "accessories"}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div><Label>الوصف</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} /></div>
            <div>
              <Label>الصورة</Label>
              {editing.image_url && <img src={editing.image_url} alt="" className="w-24 h-24 rounded-lg object-cover my-2" />}
              <Input placeholder="رابط مباشر" value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
              <label className="mt-2 flex items-center gap-2 cursor-pointer text-sm text-primary">
                <Upload className="h-4 w-4" />
                {uploading ? "جاري الرفع..." : "أو ارفع صورة"}
                <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
              </label>
            </div>
            <Button onClick={save} className="w-full bg-gradient-primary border-0">حفظ</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;