import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";

export type CheckoutData = {
  customer_name: string;
  phone: string;
  governorate: string;
  address: string;
  notes?: string;
};

export const CheckoutForm = ({
  onSubmit,
  submitting,
  buttonLabel = "تأكيد الطلب عبر واتساب",
}: {
  onSubmit: (d: CheckoutData) => void;
  submitting?: boolean;
  buttonLabel?: string;
}) => {
  const [governorates, setGovernorates] = useState<{ id: string; name: string }[]>([]);
  const [data, setData] = useState<CheckoutData>({
    customer_name: "",
    phone: "",
    governorate: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    supabase
      .from("governorates")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setGovernorates(data || []));
  }, []);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.customer_name || !data.phone || !data.governorate || !data.address) return;
    onSubmit(data);
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      <div>
        <Label htmlFor="name">الاسم بالكامل *</Label>
        <Input
          id="name"
          required
          value={data.customer_name}
          onChange={(e) => setData({ ...data, customer_name: e.target.value })}
          placeholder="مثال: أحمد محمد"
        />
      </div>
      <div>
        <Label htmlFor="phone">رقم الهاتف *</Label>
        <Input
          id="phone"
          required
          type="tel"
          inputMode="tel"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          placeholder="01xxxxxxxxx"
        />
      </div>
      <div>
        <Label htmlFor="gov">المحافظة *</Label>
        <select
          id="gov"
          required
          value={data.governorate}
          onChange={(e) => setData({ ...data, governorate: e.target.value })}
          className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">اختر المحافظة</option>
          {governorates.map((g) => (
            <option key={g.id} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="addr">العنوان بالتفصيل *</Label>
        <Textarea
          id="addr"
          required
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          placeholder="الشارع، المنطقة، علامة مميزة..."
          rows={2}
        />
      </div>
      <div>
        <Label htmlFor="notes">ملاحظات (اختياري)</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          rows={2}
        />
      </div>
      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full bg-gradient-primary text-primary-foreground border-0 shadow-glow"
      >
        {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-2" />}
        {buttonLabel}
      </Button>
    </form>
  );
};