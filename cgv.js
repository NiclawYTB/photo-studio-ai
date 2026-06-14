import LegalLayout from '../components/LegalLayout';

export default function CGV() {
  return (
    <LegalLayout title="Conditions Générales de Vente" updated="13 juin 2026">
      <p>
        Les présentes conditions générales de vente (CGV) régissent l'utilisation du service
        <strong> Photo Studio</strong> et l'achat de crédits permettant de générer des photos
        produit par intelligence artificielle. Toute commande implique l'acceptation pleine et
        entière des présentes CGV.
      </p>

      <h2>1. Identité du vendeur</h2>
      <p>
        <span className="todo">[À COMPLÉTER : prénom nom / raison sociale, statut, SIRET, adresse, email]</span>
        (voir aussi les <a href="/mentions-legales">mentions légales</a>).
      </p>

      <h2>2. Service proposé</h2>
      <p>
        Photo Studio transforme une photo fournie par l'utilisateur en visuel de type studio
        (changement de fond, mise en scène, éclairage) à l'aide d'une IA. Le service fonctionne
        par <strong>crédits</strong> : 1 crédit = 1 image générée.
      </p>

      <h2>3. Prix et crédits</h2>
      <p>
        Les prix sont indiqués en euros, toutes taxes comprises. Le ratio en vigueur est de
        <strong> 1 € = 5 crédits</strong>. Les crédits achetés sont valables sans limite de durée et
        ne sont pas remboursables une fois utilisés. Le vendeur se réserve le droit de modifier ses
        prix à tout moment ; le prix applicable est celui affiché au moment de l'achat.
      </p>

      <h2>4. Paiement</h2>
      <p>
        Le paiement s'effectue en ligne par carte bancaire via <strong>Stripe</strong>, prestataire
        de paiement sécurisé. Photo Studio ne stocke aucune donnée bancaire. Les crédits sont
        ajoutés au compte dès la confirmation du paiement.
      </p>

      <h2>5. Livraison</h2>
      <p>
        Le service est numérique et immédiat : les crédits sont disponibles instantanément et les
        images sont générées en quelques dizaines de secondes. Aucune livraison physique n'est
        effectuée.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        S'agissant d'un contenu numérique fourni immédiatement, l'utilisateur reconnaît, en
        validant son achat puis en utilisant ses crédits, <strong>renoncer expressément à son droit
        de rétractation</strong> de 14 jours pour les crédits déjà consommés (article L.221-28 du
        Code de la consommation). Les crédits achetés mais non utilisés peuvent faire l'objet d'une
        demande de remboursement par e-mail dans un délai de 14 jours.
      </p>

      <h2>7. Propriété des images</h2>
      <p>
        Tu restes propriétaire des photos que tu importes et des images générées à partir de
        celles-ci. Tu garantis disposer des droits sur les photos importées et t'engages à ne pas
        importer de contenu illicite ou portant atteinte aux droits de tiers.
      </p>

      <h2>8. Responsabilité</h2>
      <p>
        Le service est fourni « en l'état ». L'IA peut produire des résultats imparfaits ; aucun
        rendu spécifique n'est garanti. La responsabilité du vendeur ne saurait être engagée pour
        l'usage fait des images générées (notamment sur des plateformes tierces comme Vinted,
        Leboncoin ou eBay).
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement des données est décrit dans la <a href="/confidentialite">politique de
        confidentialité</a>.
      </p>

      <h2>10. Droit applicable et litiges</h2>
      <p>
        Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable
        sera recherchée avant toute action judiciaire. Le consommateur peut recourir gratuitement à
        un médiateur de la consommation. À défaut d'accord, les tribunaux français sont compétents.
      </p>
    </LegalLayout>
  );
}
