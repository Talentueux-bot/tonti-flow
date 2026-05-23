import { Zap } from "lucide-react";

const links = {
  Produit: ["Fonctionnalités", "Tarifs", "Sécurité", "Nouveautés"],
  Ressources: ["Blog", "Documentation", "Statut", "API"],
  Entreprise: ["À propos", "Carrières", "Presse", "Contact"],
  Légal: ["CGU", "Confidentialité", "Cookies", "Mentions légales"],
};

const socials = [
  { label: "X", href: "#" },
  { label: "IG", href: "#" },
  { label: "FB", href: "#" },
  { label: "in", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* CTA Banner */}
      <div className="gradient-emerald">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Prêt à digitaliser votre tontine ?
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez 12 000+ utilisateurs qui font confiance à TontiFlow.
            Inscription gratuite en 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#"
              className="px-8 py-4 rounded-xl font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Créer mon compte gratuit
            </a>
            <a
              href="#"
              className="px-8 py-4 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              Voir la démo
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <a href="#" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">
                Tonti<span className="text-emerald-400">Flow</span>
              </span>
            </a>
            <p className="text-sm leading-relaxed">
              La plateforme de tontine africaine, moderne, automatisée et
              sécurisée.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socials.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-xs font-bold hover:bg-emerald-700 hover:text-white transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-white text-sm font-semibold mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm hover:text-emerald-400 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © 2026 TontiFlow. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-emerald-900 text-emerald-400 px-2 py-1 rounded-full font-medium">
              🇸🇳 🇨🇮 🇨🇲 🇲🇱 🇬🇳 🇧🇯
            </span>
            <span className="text-xs">Disponible en Afrique de l&apos;Ouest</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
