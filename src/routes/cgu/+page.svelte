<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'Terms of use',
  updated: 'Last updated: April 2026',
  sections: [
    {
      title: '1. Purpose',
      content: `sheetmag.net (the "Service") is a free web application that allows users to export character sheets from Foundry VTT to various formats (PDF, PNG). These terms govern use of the Service.`,
    },
    {
      title: '2. Access to the Service',
      content: `The Service is accessible free of charge to any user with an internet connection. No account or registration is required. Scriptami reserves the right to modify, suspend or discontinue the Service at any time without notice.`,
    },
    {
      title: '3. Foundry VTT module',
      content: `Use of the Service requires the installation of the Sheet Magnet Connector module in Foundry VTT. This module is open source (MIT licence) and provided as-is, without warranty of any kind.`,
    },
    {
      title: '4. User data',
      content: `The Service does not collect or store any personal data or character data. All data processed remains in the user's browser memory for the duration of the session and is not transmitted to any external server, except through the temporary relay required for hosted Foundry connections (data is forwarded in transit only and never persisted).`,
    },
    {
      title: '5. Intellectual property',
      content: `The source code of sheetmag.net is published under the MIT licence. The visual identity, name and content of the site remain the property of Scriptami. Users may not reproduce, represent or distribute them without prior written consent.`,
    },
    {
      title: '6. Liability',
      content: `The Service is provided "as is", without warranty of any kind, express or implied. Scriptami cannot be held liable for any direct or indirect damage resulting from use of the Service, including loss of data, interruption of service, or incompatibility with a specific Foundry VTT version.`,
    },
    {
      title: '7. Applicable law',
      content: `These terms are governed by French law. Any dispute relating to their interpretation or execution shall be subject to the jurisdiction of the competent French courts.`,
    },
    {
      title: '8. Contact',
      content: `For any question regarding these terms, use the contact form on the site.`,
    },
  ],
};

const fr = {
  title: "Conditions générales d'utilisation",
  updated: 'Dernière mise à jour : avril 2026',
  sections: [
    {
      title: '1. Objet',
      content: `sheetmag.net (le « Service ») est une application web gratuite permettant aux utilisateurs d'exporter des fiches de personnage depuis Foundry VTT vers différents formats (PDF, PNG). Les présentes conditions régissent l'utilisation du Service.`,
    },
    {
      title: '2. Accès au Service',
      content: `Le Service est accessible gratuitement à tout utilisateur disposant d'une connexion internet. Aucun compte ni inscription n'est requis. Scriptami se réserve le droit de modifier, suspendre ou interrompre le Service à tout moment et sans préavis.`,
    },
    {
      title: '3. Module Foundry VTT',
      content: `L'utilisation du Service nécessite l'installation du module Sheet Magnet Connector dans Foundry VTT. Ce module est open source (licence MIT) et fourni tel quel, sans garantie d'aucune sorte.`,
    },
    {
      title: '4. Données utilisateur',
      content: `Le Service ne collecte ni ne stocke aucune donnée personnelle ou donnée de personnage. L'ensemble des données traitées reste en mémoire dans le navigateur de l'utilisateur le temps de la session et n'est pas transmis à un serveur externe, à l'exception du relay temporaire nécessaire aux connexions Foundry hébergé (les données y transitent uniquement et ne sont jamais persistées).`,
    },
    {
      title: '5. Propriété intellectuelle',
      content: `Le code source de sheetmag.net est publié sous licence MIT. L'identité visuelle, le nom et le contenu du site restent la propriété de Scriptami. Les utilisateurs ne peuvent les reproduire, représenter ou diffuser sans accord écrit préalable.`,
    },
    {
      title: '6. Responsabilité',
      content: `Le Service est fourni « en l'état », sans garantie d'aucune sorte, expresse ou implicite. Scriptami ne saurait être tenu responsable de tout dommage direct ou indirect résultant de l'utilisation du Service, y compris perte de données, interruption de service ou incompatibilité avec une version spécifique de Foundry VTT.`,
    },
    {
      title: '7. Droit applicable',
      content: `Les présentes conditions sont régies par le droit français. Tout litige relatif à leur interprétation ou à leur exécution sera soumis à la compétence des tribunaux français compétents.`,
    },
    {
      title: '8. Contact',
      content: `Pour toute question relative aux présentes conditions : le formulaire de contact du site`,
    },
  ],
};

const t = $derived($lang === 'fr' ? fr : en);
</script>

<Nav />

<div class="page">
  <section class="hero">
    <h1>{t.title}</h1>
    <p class="updated">{t.updated}</p>
  </section>

  <section class="section">
    <div class="inner">
      {#each t.sections as s}
        <div class="legal-block">
          <h2>{s.title}</h2>
          <p>{s.content}</p>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .page { display: flex; flex-direction: column; }

  .inner {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  .hero {
    padding: 3rem var(--space-lg);
    background: linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border);
  }

  .hero h1 { font-size: 2rem; margin-bottom: var(--space-sm); }

  .updated {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .section { padding: 3rem var(--space-lg); }

  .legal-block {
    margin-bottom: var(--space-xl);
  }

  .legal-block h2 {
    font-size: 1.05rem;
    margin-bottom: var(--space-md);
    color: var(--color-text);
  }

  .legal-block p {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.8;
    white-space: pre-line;
  }
</style>
