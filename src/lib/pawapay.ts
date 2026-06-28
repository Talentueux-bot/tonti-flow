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

// Indicatif téléphonique par pays (pour compléter le numéro si besoin).
const DIAL: Record<string, string> = { SN: "221", CI: "225", CM: "237", BJ: "229", GH: "233", BF: "226" };

// (pays app 2 lettres) + opérateur générique → code PawaPay (selon ton compte production).
const PROVIDER_MAP: Record<string, Record<string, string>> = {
  SN: { orange: "ORANGE_SEN", free: "FREE_SEN" },
  CI: { orange: "ORANGE_CIV", mtn: "MTN_MOMO_CIV" },
  CM: { orange: "ORANGE_CMR", mtn: "MTN_MOMO_CMR" },
  BJ: { mtn: "MTN_MOMO_BEN", moov: "MOOV_BEN" },
};

export function pawapayProvider(appCountry?: string | null, generic?: string | null): string | null {
  return PROVIDER_MAP[(appCountry ?? "").toUpperCase()]?.[(generic ?? "").toLowerCase()] ?? null;
}

/** Normalise un numéro en MSISDN international sans '+' (ajoute l'indicatif pays si absent). */
export function normalizeMsisdn(appCountry: string | null | undefined, raw: string): string {
  let digits = (raw ?? "").replace(/\D/g, "");
  const dial = DIAL[(appCountry ?? "").toUpperCase()];
  if (dial && !digits.startsWith(dial)) {
    digits = dial + digits.replace(/^0+/, "");
  }
  return digits;
}

type PayoutParams = {
  payoutId: string;
  phoneNumber: string;
  provider: string;
  amount: string;
  currency: string;
  customerMessage?: string;
};

export type PayoutStatus = "ACCEPTED" | "SUBMITTED" | "ENQUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "REJECTED" | "UNKNOWN";

/** Initie un payout (envoi d'argent) vers un compte Mobile Money. */
export async function createPayout(p: PayoutParams): Promise<{ status: PayoutStatus; message?: string }> {
  const res = await fetch(`${BASE}/v2/payouts`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      payoutId: p.payoutId,
      recipient: { type: "MMO", accountDetails: { phoneNumber: p.phoneNumber, provider: p.provider } },
      amount: p.amount,
      currency: p.currency,
      customerMessage: (p.customerMessage ?? "Retrait TontiFlow").slice(0, 22),
    }),
  });
  const data = await res.json().catch(() => ({}));
  const status = (data?.status as PayoutStatus) ?? "UNKNOWN";
  if (status === "REJECTED" || !res.ok) {
    return { status: "REJECTED", message: data?.failureReason?.failureMessage || "Payout refusé par PawaPay." };
  }
  return { status };
}

export async function getPayoutStatus(payoutId: string): Promise<PayoutStatus> {
  const res = await fetch(`${BASE}/v2/payouts/${payoutId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json().catch(() => ({}));
  return (data?.data?.status ?? data?.status ?? "UNKNOWN") as PayoutStatus;
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
