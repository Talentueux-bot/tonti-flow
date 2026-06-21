// Liste des comptes administrateurs (accès à la page Admin / revenus).
// Modifiable ici ; utilisé côté client (affichage du lien) et côté base (RPC).
export const ADMIN_EMAILS = ["sonfackdiviol45@gmail.com"];

export function isAdminEmail(email?: string | null): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
