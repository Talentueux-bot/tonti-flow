import type { PaymentType } from "@/lib/paymentMethods";

/**
 * Logos (SVG inline) des moyens de paiement.
 * Auto-contenus : pas d'image externe ni de config de domaine nécessaire.
 */
export default function PaymentLogo({
  type,
  className = "w-10 h-10",
}: {
  type: PaymentType;
  className?: string;
}) {
  const common = `rounded-xl ${className}`;

  switch (type) {
    case "wave":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="Wave">
          <rect width="40" height="40" rx="10" fill="#1DC4F4" />
          <path
            d="M6 24c3 0 3-5 6-5s3 5 6 5 3-5 6-5 3 5 6 5 4-2 4-2"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="20" y="34" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="700" fontFamily="Arial, sans-serif">
            wave
          </text>
        </svg>
      );

    case "orange":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="Orange Money">
          <rect width="40" height="40" rx="10" fill="#FF7900" />
          <text x="20" y="24" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif">
            orange
          </text>
          <text x="20" y="32" textAnchor="middle" fill="#fff" fontSize="6" fontWeight="600" fontFamily="Arial, sans-serif">
            Money
          </text>
        </svg>
      );

    case "mtn":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="MTN Money">
          <rect width="40" height="40" rx="10" fill="#FFCB05" />
          <ellipse cx="20" cy="19" rx="14" ry="9" fill="none" stroke="#004F9F" strokeWidth="1.4" />
          <text x="20" y="23" textAnchor="middle" fill="#004F9F" fontSize="10" fontWeight="800" fontFamily="Arial, sans-serif">
            MTN
          </text>
          <text x="20" y="33" textAnchor="middle" fill="#003a75" fontSize="5.5" fontWeight="700" fontFamily="Arial, sans-serif">
            MoMo
          </text>
        </svg>
      );

    case "free":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="Free Money">
          <rect width="40" height="40" rx="10" fill="#CD1F2D" />
          <text x="20" y="25" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="Arial, sans-serif">
            free
          </text>
        </svg>
      );

    case "visa":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="Visa">
          <rect width="40" height="40" rx="10" fill="#fff" stroke="#e5e7eb" />
          <text x="20" y="25" textAnchor="middle" fill="#1A1F71" fontSize="12" fontWeight="800" fontStyle="italic" fontFamily="Arial, sans-serif" letterSpacing="0.5">
            VISA
          </text>
        </svg>
      );

    case "mastercard":
      return (
        <svg viewBox="0 0 40 40" className={common} role="img" aria-label="Mastercard">
          <rect width="40" height="40" rx="10" fill="#1A1F36" />
          <circle cx="16" cy="20" r="8" fill="#EB001B" />
          <circle cx="24" cy="20" r="8" fill="#F79E1B" />
          <path d="M20 14a8 8 0 0 0 0 12 8 8 0 0 0 0-12z" fill="#FF5F00" />
        </svg>
      );

    default:
      return <div className={`${common} bg-gray-200`} />;
  }
}
