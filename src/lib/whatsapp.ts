import { formatAmount } from "@/lib/db";

/** Garde uniquement les chiffres (format requis par wa.me). */
export function sanitizePhone(phone?: string | null): string {
  return (phone ?? "").replace(/\D/g, "");
}

/** Message de rappel de cotisation pré-rempli. */
export function reminderMessage(opts: {
  memberName: string;
  groupName: string;
  amount: number;
  currency: string;
}): string {
  const { memberName, groupName, amount, currency } = opts;
  return (
    `Bonjour ${memberName} 👋\n` +
    `Petit rappel amical : votre cotisation de ${formatAmount(amount, currency)} ` +
    `pour la tontine « ${groupName} » est attendue. 🙏\n` +
    `Merci de régler dès que possible. — via TontiFlow`
  );
}

/** Lien vers un membre précis (ouvre la conversation WhatsApp). */
export function waLink(phone: string | null | undefined, text: string): string {
  const num = sanitizePhone(phone);
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

/** Lien de partage générique (laisse choisir un contact ou un groupe WhatsApp). */
export function waShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
