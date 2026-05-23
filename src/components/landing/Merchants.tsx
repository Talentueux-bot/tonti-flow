import Link from "next/link";
import Image from "next/image";

const merchants = [
  {
    photo: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=600&q=80",
    name: "Mariama T.",
    job: "Vendeuse de tissu",
    city: "Dakar, Sénégal",
    flag: "🇸🇳",
    quote: "Je gère ma tontine de 15 commerçantes du marché Sandaga directement depuis mon téléphone.",
    amount: "75 000 FCFA / mois",
  },
  {
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    name: "Kofi A.",
    job: "Réparateur téléphones",
    city: "Accra, Ghana",
    flag: "🇬🇭",
    quote: "Avec TontiFlow, j'ai pu acheter du nouveau matériel grâce au pot que j'ai reçu ce mois-ci.",
    amount: "200 GHS / mois",
  },
  {
    photo: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80",
    name: "Awa D.",
    job: "Coiffeuse",
    city: "Abidjan, Côte d'Ivoire",
    flag: "🇨🇮",
    quote: "Toutes mes clientes participent à notre tontine. Les rappels WhatsApp, c'est magique !",
    amount: "50 000 FCFA / mois",
  },
  {
    photo: "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=600&q=80",
    name: "Amadou B.",
    job: "Étalage de légumes",
    city: "Bamako, Mali",
    flag: "🇲🇱",
    quote: "Notre groupe de 8 vendeurs du marché utilise TontiFlow depuis 6 mois. Zéro problème.",
    amount: "30 000 FCFA / mois",
  },
];

export default function Merchants() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              Ils utilisent TontiFlow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Des petits commerçants qui{" "}
              <span className="text-emerald-600">grandissent ensemble</span>
            </h2>
            <p className="mt-4 text-gray-500 text-lg">
              Marchandes, artisans, vendeurs de rue — TontiFlow est fait pour vous.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-colors"
          >
            Rejoindre la communauté →
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {merchants.map((m) => (
            <div
              key={m.name}
              className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Photo */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={m.photo}
                  alt={m.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {/* Flag + city */}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{m.name} {m.flag}</p>
                    <p className="text-white/80 text-xs">{m.city}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold">
                    {m.amount}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-white">
                <p className="text-xs font-semibold text-emerald-600 mb-1">{m.job}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{m.quote}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom banner */}
        <div className="mt-14 rounded-3xl gradient-emerald p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-white font-bold text-xl sm:text-2xl">
              Rejoignez 12 000+ commerçants africains
            </p>
            <p className="text-emerald-100 mt-1">
              Aucun compte bancaire requis · Démarrez en 2 minutes
            </p>
          </div>
          <Link
            href="/auth/register"
            className="shrink-0 px-7 py-3.5 rounded-xl font-semibold text-emerald-700 bg-white hover:bg-emerald-50 transition-colors shadow-md text-sm"
          >
            Créer ma tontine gratuitement →
          </Link>
        </div>
      </div>
    </section>
  );
}
