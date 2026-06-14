import LegalLayout from '../components/LegalLayout';

export default function MentionsLegales() {
  return (
    <LegalLayout title="Mentions légales" updated="13 juin 2026">
      <p>
        Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie
        numérique, voici les informations légales du site <strong>Photo Studio</strong>.
      </p>

      <h2>Éditeur du site</h2>
      <p>
        Le site est édité par <span className="todo">[À COMPLÉTER : prénom nom / raison sociale]</span>,
        <span className="todo">[statut : auto-entrepreneur / EI / SAS…]</span>.<br />
        SIREN / SIRET : <span className="todo">[à compléter]</span><br />
        Adresse : <span className="todo">[adresse complète]</span><br />
        E-mail : <span className="todo">[email de contact]</span><br />
        TVA intracommunautaire : <span className="todo">[le cas échéant]</span>
      </p>

      <h2>Directeur de la publication</h2>
      <p><span className="todo">[Prénom Nom du responsable]</span></p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par <strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133,
        Walnut, CA 91789, États-Unis — <a href="https://vercel.com">vercel.com</a>.
      </p>
      <p>
        Les données (comptes, crédits, historique) sont stockées via <strong>Supabase</strong>
        (hébergement en Union Européenne, région Irlande). La génération d'images est opérée par
        <strong> Replicate, Inc.</strong> (États-Unis) et les paiements par <strong>Stripe</strong>.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        La marque, le logo, les textes et l'interface de Photo Studio sont protégés. Toute
        reproduction sans autorisation est interdite. Les images <strong>que tu génères</strong> à
        partir de tes propres photos t'appartiennent (voir les CGV).
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question : <span className="todo">[email de contact]</span>.
      </p>
    </LegalLayout>
  );
}
