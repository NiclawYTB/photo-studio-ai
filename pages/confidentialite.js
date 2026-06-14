import LegalLayout from '../components/LegalLayout';

export default function Confidentialite() {
  return (
    <LegalLayout title="Politique de confidentialité" updated="13 juin 2026">
      <p>
        Cette politique explique quelles données Photo Studio collecte, pourquoi, et quels sont tes
        droits, conformément au Règlement Général sur la Protection des Données (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        <span className="todo">[À COMPLÉTER : prénom nom / raison sociale]</span> — contact :
        <span className="todo">[email]</span>.
      </p>

      <h2>Données collectées</h2>
      <ul>
        <li><strong>Compte</strong> : adresse e-mail, mot de passe (chiffré), nom d'affichage facultatif.</li>
        <li><strong>Photos</strong> : les images que tu importes et celles générées par l'IA.</li>
        <li><strong>Paiement</strong> : géré par Stripe — nous ne stockons aucune donnée bancaire, seulement l'historique des crédits.</li>
        <li><strong>Usage</strong> : date des générations, sélections de style.</li>
      </ul>

      <h2>Finalités</h2>
      <p>
        Fournir le service (génération d'images, gestion des crédits), assurer la sécurité du
        compte, le support client, et le respect des obligations légales et comptables.
      </p>

      <h2>Base légale</h2>
      <p>
        Exécution du contrat (fourniture du service), respect d'obligations légales (facturation),
        et intérêt légitime (sécurité, prévention de la fraude).
      </p>

      <h2>Sous-traitants</h2>
      <p>Pour fonctionner, le service s'appuie sur des prestataires qui peuvent traiter certaines données :</p>
      <ul>
        <li><strong>Supabase</strong> — base de données et authentification (hébergement Union Européenne, Irlande).</li>
        <li><strong>Stripe</strong> — paiements sécurisés.</li>
        <li><strong>Replicate</strong> — génération des images par IA (États-Unis).</li>
        <li><strong>Vercel</strong> — hébergement du site (États-Unis).</li>
      </ul>
      <p>
        Certains transferts de données ont lieu hors Union Européenne (États-Unis), encadrés par les
        garanties contractuelles de ces prestataires.
      </p>

      <h2>Durée de conservation</h2>
      <p>
        Les données de compte sont conservées tant que le compte est actif. Les images générées sont
        conservées pour ta galerie ; les liens d'images fournis par l'IA peuvent expirer après
        quelques jours. Tu peux demander la suppression de ton compte à tout moment.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition
        et de portabilité de tes données. Pour les exercer, écris à <span className="todo">[email]</span>.
        Tu peux aussi introduire une réclamation auprès de la CNIL (<a href="https://www.cnil.fr">cnil.fr</a>).
      </p>

      <h2>Cookies</h2>
      <p>
        Le site utilise uniquement les cookies strictement nécessaires au fonctionnement (session de
        connexion). Aucun cookie publicitaire de suivi n'est déposé sans ton consentement.
      </p>

      <h2>Contact</h2>
      <p>Pour toute question relative à tes données : <span className="todo">[email]</span>.</p>
    </LegalLayout>
  );
}
