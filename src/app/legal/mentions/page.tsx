export default function MentionsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <p className="text-xs text-gray-400 mb-2">Dernière mise à jour : 1er janvier 2026</p>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions Légales</h1>

      {[
        {
          title: "Éditeur du site",
          lines: [
            "Dénomination sociale : TontiFlow SAS",
            "Forme juridique : Société par Actions Simplifiée",
            "Capital social : 10 000 000 FCFA",
            "Siège social : Dakar, Sénégal",
            "NINEA : 00000000 00",
            "Email : legal@tontiflow.com",
          ],
        },
        {
          title: "Directeur de la publication",
          lines: [
            "Le Directeur Général de TontiFlow SAS",
            "Email : contact@tontiflow.com",
          ],
        },
        {
          title: "Hébergement",
          lines: [
            "Hébergeur : Vercel Inc.",
            "Adresse : 340 Pine Street, Suite 1600, San Francisco, CA 94104, USA",
            "Site : vercel.com",
          ],
        },
        {
          title: "Propriété intellectuelle",
          lines: [
            "L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, code source) est la propriété exclusive de TontiFlow SAS, sauf mention contraire.",
            "Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, par quelque procédé que ce soit, sans autorisation préalable et écrite de TontiFlow SAS, est strictement interdite.",
          ],
        },
        {
          title: "Limitation de responsabilité",
          lines: [
            "TontiFlow SAS ne saurait être tenu responsable des dommages directs ou indirects causés au matériel de l'utilisateur, lors de l'accès au site.",
            "TontiFlow SAS décline toute responsabilité quant à l'utilisation qui pourrait être faite des informations et contenus présents sur ce site.",
          ],
        },
        {
          title: "Données personnelles",
          lines: [
            "Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection des données personnelles au Sénégal, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.",
            "Pour exercer ce droit, contactez : privacy@tontiflow.com",
          ],
        },
        {
          title: "Droit applicable",
          lines: [
            "Le présent site est soumis au droit sénégalais.",
            "Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des tribunaux de Dakar.",
          ],
        },
      ].map(({ title, lines }) => (
        <section key={title} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
          <div className="space-y-1.5">
            {lines.map((line, i) => (
              <p key={i} className="text-gray-600 leading-relaxed text-sm">{line}</p>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
