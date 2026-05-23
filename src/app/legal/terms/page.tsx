export default function TermsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <p className="text-xs text-gray-400 mb-2">Dernière mise à jour : 1er janvier 2026</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Conditions Générales d&apos;Utilisation</h1>

      <p className="text-gray-600 mb-8">
        Bienvenue sur TontiFlow. En utilisant notre service, vous acceptez les présentes Conditions Générales
        d&apos;Utilisation (CGU). Veuillez les lire attentivement.
      </p>

      {[
        {
          title: "1. Présentation du service",
          body: `TontiFlow est une plateforme numérique permettant la gestion de tontines (épargnes collectives tournantes)
          entre particuliers. TontiFlow agit en qualité d'intermédiaire technique et n'est pas un établissement de crédit
          ni un prestataire de services de paiement. Les paiements sont traités directement via les API des opérateurs
          Mobile Money partenaires.`,
        },
        {
          title: "2. Inscription et compte utilisateur",
          body: `Pour utiliser TontiFlow, vous devez créer un compte en fournissant des informations exactes et complètes.
          Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée sous votre compte.
          TontiFlow se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU.`,
        },
        {
          title: "3. Utilisation du service",
          body: `Vous vous engagez à utiliser TontiFlow uniquement à des fins licites. Il est interdit d'utiliser
          le service pour des activités frauduleuses, de blanchiment d'argent, ou toute autre activité illégale.
          Chaque groupe tontine est géré de manière autonome par ses membres. TontiFlow n'intervient pas dans
          les décisions du groupe.`,
        },
        {
          title: "4. Frais et abonnements",
          body: `TontiFlow propose des plans d'abonnement mensuel (Gratuit, Pro, Diaspora). Les tarifs sont affichés
          clairement sur la page Tarifs. Une commission de 100 à 500 FCFA peut s'appliquer par transaction Mobile Money,
          conformément aux frais des opérateurs partenaires. Aucun frais caché ne sera appliqué.`,
        },
        {
          title: "5. Responsabilités",
          body: `TontiFlow met tout en œuvre pour assurer la disponibilité et la sécurité du service. Cependant,
          TontiFlow ne peut être tenu responsable des défaillances des opérateurs Mobile Money tiers, des litiges
          entre membres d'un groupe, ou de toute perte résultant d'une utilisation non autorisée de votre compte.`,
        },
        {
          title: "6. Propriété intellectuelle",
          body: `L'ensemble du contenu de TontiFlow (logo, textes, interfaces, code) est la propriété exclusive de
          TontiFlow SAS. Toute reproduction, distribution ou exploitation sans autorisation préalable est interdite.`,
        },
        {
          title: "7. Résiliation",
          body: `Vous pouvez résilier votre compte à tout moment depuis les paramètres de votre profil. En cas de
          résiliation, vos données seront conservées pendant 30 jours avant suppression définitive, conformément
          à notre politique de confidentialité.`,
        },
        {
          title: "8. Droit applicable",
          body: `Les présentes CGU sont régies par le droit sénégalais. Tout litige sera soumis à la compétence
          exclusive des tribunaux de Dakar, Sénégal.`,
        },
      ].map(({ title, body }) => (
        <section key={title} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-600 leading-relaxed text-sm">{body}</p>
        </section>
      ))}

      <div className="mt-10 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
        <p className="text-sm text-emerald-700">
          Des questions sur nos CGU ?{" "}
          <a href="/contact" className="font-semibold hover:underline">Contactez notre équipe</a>.
        </p>
      </div>
    </article>
  );
}
