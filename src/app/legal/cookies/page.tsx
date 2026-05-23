export default function CookiesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <p className="text-xs text-gray-400 mb-2">Dernière mise à jour : 1er janvier 2026</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique des Cookies</h1>

      <p className="text-gray-600 mb-8">
        TontiFlow utilise des cookies et technologies similaires pour assurer le fonctionnement du service
        et améliorer votre expérience. Voici comment et pourquoi.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Qu&apos;est-ce qu&apos;un cookie ?</h2>
        <p className="text-gray-600 leading-relaxed text-sm">
          Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.
          Les cookies permettent au site de se souvenir de vos préférences et actions sur une période de temps.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Types de cookies utilisés</h2>
        <div className="space-y-4">
          {[
            {
              type: "Cookies essentiels",
              required: true,
              description: "Nécessaires au fonctionnement du service. Ils permettent notamment de maintenir votre session de connexion sécurisée et de mémoriser vos préférences de langue.",
              examples: "session_token, csrf_token, locale",
            },
            {
              type: "Cookies analytiques",
              required: false,
              description: "Nous aident à comprendre comment les utilisateurs interagissent avec TontiFlow (pages visitées, durée de session). Les données sont anonymisées et ne permettent pas de vous identifier.",
              examples: "analytics_session, page_views",
            },
            {
              type: "Cookies de performance",
              required: false,
              description: "Permettent de mémoriser vos préférences d'interface pour améliorer votre expérience lors de vos prochaines visites.",
              examples: "ui_theme, sidebar_state",
            },
          ].map(({ type, required, description, examples }) => (
            <div key={type} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-900">{type}</p>
                {required ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Requis</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-600">Optionnel</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{description}</p>
              <p className="text-xs text-gray-400">Exemples : {examples}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Gérer vos préférences</h2>
        <p className="text-gray-600 leading-relaxed text-sm mb-3">
          Vous pouvez accepter ou refuser les cookies optionnels à tout moment depuis les paramètres
          de votre compte. Notez que désactiver certains cookies peut affecter le fonctionnement du service.
        </p>
        <p className="text-gray-600 leading-relaxed text-sm">
          Vous pouvez également configurer votre navigateur pour bloquer les cookies. Consultez l&apos;aide
          de votre navigateur pour les instructions spécifiques.
        </p>
      </section>

      <div className="mt-10 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-700">
          Questions sur les cookies ?{" "}
          <a href="/contact" className="font-semibold hover:underline">Contactez-nous</a>.
        </p>
      </div>
    </article>
  );
}
