// Calcul de la prochaine échéance de versement selon la fréquence (pur, sans import).
export function nextPayoutFrom(date: Date, frequency: string): Date {
  const d = new Date(date);
  if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else if (frequency === "biweekly") d.setDate(d.getDate() + 14);
  else d.setMonth(d.getMonth() + 1); // monthly (par défaut)
  return d;
}
