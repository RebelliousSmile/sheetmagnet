<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'Legal notices',
  sections: [
    {
      title: 'Publisher',
      content: `sheetmag.net is published by Scriptami.
Website: www.scriptami.com
Contact: contact form on the site`,
    },
    {
      title: 'Hosting',
      content: `The application is hosted on Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA — vercel.com
The WebSocket relay service is hosted on Railway Corp., 340 Pine Street, Suite 701, San Francisco, CA 94104, USA — railway.app`,
    },
    {
      title: 'Intellectual property',
      content: `The sheetmag.net source code is published under the MIT licence and is available on GitHub: github.com/RebelliousSmile/sheetmagnet

The name "sheetmag.net", the visual identity and the content of this site are the property of Scriptami. Any reproduction without prior written consent is prohibited.

Foundry VTT is a trademark of Foundry Gaming LLC. Forge VTT is a trademark of The Forge. sheetmag.net is an independent project and is not affiliated with these entities.`,
    },
    {
      title: 'Personal data',
      content: `sheetmag.net does not collect any personal data. No account is required. Character data processed by the application is never stored on external servers and is only held in memory for the duration of the session.

For any question relating to your data, use the contact form on the site.`,
    },
    {
      title: 'Cookies',
      content: `The site uses a single cookie to remember your language preference (EN/FR). No tracking or advertising cookie is used.`,
    },
  ],
};

const fr = {
  title: 'Mentions légales',
  sections: [
    {
      title: 'Éditeur',
      content: `sheetmag.net est édité par Scriptami.
Site web : www.scriptami.com
Contact : le formulaire de contact du site`,
    },
    {
      title: 'Hébergement',
      content: `L'application est hébergée par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis — vercel.com
Le service relay WebSocket est hébergé par Railway Corp., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis — railway.app`,
    },
    {
      title: 'Propriété intellectuelle',
      content: `Le code source de sheetmag.net est publié sous licence MIT et disponible sur GitHub : github.com/RebelliousSmile/sheetmagnet

Le nom « sheetmag.net », l'identité visuelle et le contenu de ce site sont la propriété de Scriptami. Toute reproduction sans accord écrit préalable est interdite.

Foundry VTT est une marque de Foundry Gaming LLC. Forge VTT est une marque de The Forge. sheetmag.net est un projet indépendant et n'est pas affilié à ces entités.`,
    },
    {
      title: 'Données personnelles',
      content: `sheetmag.net ne collecte aucune donnée personnelle. Aucun compte n'est requis. Les données de personnage traitées par l'application ne sont jamais stockées sur des serveurs externes et ne sont conservées qu'en mémoire le temps de la session.

Pour toute question relative à vos données, contactez : le formulaire de contact du site`,
    },
    {
      title: 'Cookies',
      content: `Le site utilise un unique cookie pour mémoriser votre préférence de langue (FR/EN). Aucun cookie de traçage ou publicitaire n'est utilisé.`,
    },
  ],
};

const t = $derived($lang === 'fr' ? fr : en);
</script>

<Nav />

<div class="page">
  <section class="hero">
    <h1>{t.title}</h1>
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

  .hero h1 { font-size: 2rem; }

  .section { padding: 3rem var(--space-lg); }

  .legal-block {
    margin-bottom: var(--space-xl);
  }

  .legal-block h2 {
    font-size: 1.1rem;
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
