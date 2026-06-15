export type PaymentType = "wave" | "orange" | "mtn" | "free" | "visa" | "mastercard";

export type PaymentPlatform = {
  type: PaymentType;
  label: string;
  hint: string;
};

export const PAYMENT_CATALOG: PaymentPlatform[] = [
  { type: "wave", label: "Wave", hint: "Numéro Wave" },
  { type: "orange", label: "Orange Money", hint: "Numéro Orange" },
  { type: "mtn", label: "MTN Money", hint: "Numéro MTN" },
  { type: "free", label: "Free Money", hint: "Numéro Free" },
  { type: "visa", label: "Carte Visa", hint: "Numéro de carte (16 chiffres)" },
  { type: "mastercard", label: "Mastercard", hint: "Numéro de carte (16 chiffres)" },
];

export function getPlatform(type: string): PaymentPlatform {
  return PAYMENT_CATALOG.find((p) => p.type === type) ?? PAYMENT_CATALOG[0];
}

export function maskNumber(n: string, type: string): string {
  if (!n) return "";
  if (type === "visa" || type === "mastercard") return `•••• •••• •••• ${n.slice(-4)}`;
  return `${n.slice(0, 4)} •••• ${n.slice(-2)}`;
}
