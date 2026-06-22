// Serveur uniquement — envoi d'emails transactionnels via Resend.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "TontiFlow <onboarding@resend.dev>";

export function emailConfigured(): boolean {
  return !!RESEND_API_KEY;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY manquant — email ignoré :", subject, "→", to);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[email] échec envoi :", res.status, t);
  }
}

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f5f7f6;font-family:Segoe UI,Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="text-align:center;margin-bottom:24px">
      <span style="font-size:22px;font-weight:800;color:#0f172a">Tonti<span style="color:#059669">Flow</span></span>
    </div>
    <div style="background:#fff;border-radius:18px;border:1px solid #eef2f1;padding:28px">
      <h1 style="font-size:18px;color:#0f172a;margin:0 0 12px">${title}</h1>
      <div style="font-size:14px;color:#475569;line-height:1.6">${body}</div>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px">TontiFlow — épargnez ensemble, en toute confiance.</p>
  </div></body></html>`;
}

export function verificationApprovedHtml(name: string): string {
  return shell(
    `Bonjour ${name}, votre compte est vérifié ✅`,
    `Bonne nouvelle ! Nous avons examiné votre pièce d'identité et votre compte <strong>TontiFlow</strong> est désormais
     <strong>vérifié</strong>. Vous pouvez maintenant créer et rejoindre des tontines, cotiser et recevoir vos gains en toute sérénité.<br/><br/>
     Merci de votre confiance,<br/>— L'équipe TontiFlow`
  );
}

export function verificationRejectedHtml(name: string): string {
  return shell(
    `Bonjour ${name}, vérification à compléter`,
    `Nous n'avons pas pu valider votre pièce d'identité (document illisible ou informations non concordantes).
     Aucune inquiétude : reconnectez-vous à votre profil <strong>TontiFlow</strong> et renvoyez une photo nette de votre pièce
     (carte d'identité, passeport ou permis).<br/><br/>
     Nous restons à votre disposition,<br/>— L'équipe TontiFlow`
  );
}
