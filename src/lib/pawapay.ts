// ⚠️ Serveur uniquement — n'importez jamais ce fichier dans un composant client.
// Le token PawaPay ne doit jamais atteindre le navigateur.

const BASE = process.env.PAWAPAY_BASE_URL ?? "https://api.sandbox.pawapay.io";
const TOKEN = process.env.PAWAPAY_TOKEN;

export function pawapayConfigured(): boolean {
  return !!TOKEN;
}

// Pays de l'app (2 lettres) → pays PawaPay (ISO-3) + devise mobile money.
// Les pays non couverts par le sandbox basculent sur le Sénégal (XOF) pour les tests.
const COUNTRY_MAP: Record<string, { country: string; currency: string }> = {
  SN: { country: "SEN", currency: "XOF" },
  CI: { country: "CIV", currency: "XOF" },
  CM: { country: "CMR", currency: "XAF" },
  BJ: { country: "BEN", currency: "XOF" },
  GH: { country: "GHA", currency: "GHS" },
  BF: { country: "BFA", currency: "XOF" },
};

export function resolveCountry(appCountry?: string | null): { country: string; currency: string } {
  return COUNTRY_MAP[(appCountry ?? "").toUpperCase()] ?? { country: "SEN", currency: "XOF" };
}

type PaymentPageParams = {
  depositId: string;
  amount: string;
  currency: string;
  country: string;
  reason: string;
  returnUrl: string;
  language?: string;
};

// Le montant va dans `amountDetails: { amount, currency }`. returnUrl en HTTPS.
export async function createPaymentPage(p: PaymentPageParams): Promise<{ redirectUrl: string }> {
  const res = await fetch(`${BASE}/v2/paymentpage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      depositId: p.depositId,
      returnUrl: p.returnUrl,
      amountDetails: { amount: p.amount, currency: p.currency },
      country: p.country,
      reason: p.reason,
      language: p.language ?? "FR",
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirectUrl) {
    throw new Error(data?.message || data?.failureReason?.failureMessage || "Échec de création de la page de paiement PawaPay");
  }
  return { redirectUrl: data.redirectUrl as string };
}

export type DepositStatus = "ACCEPTED" | "PROCESSING" | "IN_RECONCILIATION" | "COMPLETED" | "FAILED" | "UNKNOWN";

export async function getDepositStatus(depositId: string): Promise<DepositStatus> {
  const res = await fetch(`${BASE}/v2/deposits/${depositId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json().catch(() => ({}));
  // v2 : { status: "FOUND"|"NOT_FOUND", data: { status: "COMPLETED"|... } }
  const s = data?.data?.status ?? data?.status;
  return (s as DepositStatus) ?? "UNKNOWN";
}
