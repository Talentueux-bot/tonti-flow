import Link from "next/link";
import { Zap } from "lucide-react";

const legalLinks = [
  { href: "/legal/terms", label: "Conditions d'utilisation" },
  { href: "/legal/privacy", label: "Politique de confidentialité" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/mentions", label: "Mentions légales" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-emerald flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Tonti<span className="text-emerald-600">Flow</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar nav */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-8 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Documents légaux</p>
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
