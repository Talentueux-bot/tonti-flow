export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <p className="text-xs text-gray-400 mb-2">Dernière mise à jour : 1er janvier 2026</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de Confidentialité</h1>

      <p className="text-gray-600 mb-8">
        La protection de vos données personnelles est une priorité pour TontiFlow. Cette politique explique
        quelles données nous collectons, comment nous les utilisons et vos droits.
      </p>

      {[
        {
          title: "1. Données collectées",
          body: `Nous collectons les informations que vous nous fournissez lors de l'inscription (nom, email, numéro
          de téléphone, pays), ainsi que les données générées par votre utilisation du service (transactions,
          historique des groupes, préférences de notification). Nous ne collectons jamais vos identifiants
          bancaires ou codes PIN Mobile Money.`,
        },
        {
          title: "2. Utilisation des données",
          body: `Vos données sont utilisées pour : fournir et améliorer le service TontiFlow, envoyer des
          notifications WhatsApp et email relatives à vos tontines, assurer la sécurité de votre compte,
          respecter nos obligations légales et réglementaires. Nous n'utilisons pas vos données à des fins
          publicitaires tierces.`,
        },
        {
          title: "3. Partage des données",
          body: `Nous ne vendons jamais vos données personnelles. Nous partageons uniquement les informations
          nécessaires avec nos prestataires techniques (opérateurs Mobile Money, hébergeur cloud sécurisé,
          API WhatsApp de Meta) dans le cadre strict de la fourniture du service.`,
        },
        {
          title: "4. Sécurité",
          body: `TontiFlow utilise un chiffrement SSL 256 bits pour toutes les communications. Les données sont
          stockées sur des serveurs sécurisés avec accès restreint. L'authentification à deux facteurs est
          disponible et recommandée pour tous les utilisateurs.`,
        },
        {
          title: "5. Conservation des données",
          body: `Vos données sont conservées pendant toute la durée de votre compte actif, puis 30 jours après
          résiliation avant suppression définitive. Les données de transaction peuvent être conservées plus
          longtemps pour respecter les obligations légales comptables (généralement 5 ans).`,
        },
        {
          title: "6. Vos droits",
          body: `Conformément aux réglementations applicables, vous disposez des droits suivants : accès à vos
          données, rectification, suppression (droit à l'oubli), portabilité, opposition au traitement.
          Pour exercer ces droits, contactez-nous à privacy@tontiflow.com.`,
        },
        {
          title: "7. Cookies",
          body: `TontiFlow utilise des cookies essentiels au fonctionnement du service et des cookies analytiques
          anonymisés. Consultez notre politique cookies pour plus de détails.`,
        },
      ].map(({ title, body }) => (
        <section key={title} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 leading-relaxed text-sm">{body}</p>
        </section>
      ))}

      <div className="mt-10 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-700">
          Pour toute question sur vos données, écrivez-nous à{" "}
          <a href="mailto:privacy@tontiflow.com" className="font-semibold hover:underline">
            privacy@tontiflow.com
          </a>.
        </p>
      </div>
    </article>
  );
}
