export const formatEGP = (n: number) =>
  new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(n);

export const finalPrice = (price: number, discount?: number | null) => {
  if (!discount || discount <= 0) return price;
  return Math.round(price - (price * discount) / 100);
};