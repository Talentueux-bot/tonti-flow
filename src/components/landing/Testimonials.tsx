import Image from "next/image";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Aminata Kouyaté",
    role: "Commerçante, Dakar",
    flag: "🇸🇳",
    photo: "https://i.pravatar.cc/80?img=47",
    content:
      "Avant TontiFlow, je gérais notre tontine familiale sur un carnet. Maintenant tout est automatique ! Les rappels WhatsApp ont réduit les retards de 80%.",
    stars: 5,
  },
  {
    name: "Jean-Pierre Mvondo",
    role: "Diaspora, Paris",
    flag: "🇫🇷",
    photo: "https://i.pravatar.cc/80?img=12",
    content:
      "Je participe à une tontine au Cameroun depuis la France. Les paiements via carte bancaire sont instantanés et mon groupe voit tout en temps réel.",
    stars: 5,
  },
  {
    name: "Fatou Diallo",
    role: "Étudiante, Abidjan",
    flag: "🇨🇮",
    photo: "https://i.pravatar.cc/80?img=44",
    content:
      "On est 10 étudiantes et on utilise TontiFlow pour notre tontine mensuelle. L'application est super simple, même ma mère l'utilise facilement.",
    stars: 5,
  },
  {
    name: "Moussa Traoré",
    role: "Association, Bamako",
    flag: "🇲🇱",
    photo: "https://i.pravatar.cc/80?img=8",
    content:
      "Notre association gère 3 tontines simultanément avec TontiFlow. La rotation automatique des bénéficiaires nous a évité beaucoup de conflits.",
    stars: 5,
  },
  {
    name: "Aïssatou Bah",
    role: "Infirmière, Conakry",
    flag: "🇬🇳",
    photo: "https://i.pravatar.cc/80?img=56",
    content:
      "Le tableau de bord est clair et les notifications Mobile Money sont immédiates. Je recommande à toutes mes collègues.",
    stars: 5,
  },
  {
    name: "Kofi Mensah",
    role: "Entrepreneur, Accra",
    flag: "🇬🇭",
    photo: "https://i.pravatar.cc/80?img=15",
    content:
      "TontiFlow m'a permis de digitaliser la susu de mon équipe. Fini les discussions sur qui a payé ou non — tout est transparent.",
    stars: 5,
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400" fill="#fbbf24" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Ils font confiance à{" "}
            <span className="text-emerald-600">TontiFlow</span>
          </h2>
          <p className="mt-4 text-gray-500 text-lg">
            Des milliers de familles et associations à travers l&apos;Afrique et la
            diaspora.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-emerald-100" />

              <StarRating count={t.stars} />

              <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>

              <div className="mt-5 flex items-center gap-3">
                <Image
                  src={t.photo}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-100 shrink-0"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {t.name} {t.flag}
                  </p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall rating */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border border-gray-200 shadow-sm">
            <StarRating count={5} />
            <span className="text-sm font-semibold text-gray-900">4.9/5</span>
            <span className="text-sm text-gray-400">· +1 200 avis vérifiés</span>
          </div>
        </div>
      </div>
    </section>
  );
}
