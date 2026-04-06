<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'FAQ',
  subtitle: 'Frequently asked questions about sheetmag.net.',
  items: [
    {
      q: 'What is sheetmag.net?',
      a: 'sheetmag.net is a web app for Foundry VTT that exports your character sheets to PDF or image formats directly from your browser. No account required, nothing stored on external servers.',
    },
    {
      q: 'How do I connect to Foundry?',
      a: "It depends on how you run Foundry. If it's on your local network, open Foundry, click the Sheet Magnet button in the Actors Directory, and copy the URL and access token shown. If you use a hosting provider (Forge VTT, Molten…), use the session code and relay token instead. If you're a player without server access, ask your GM to export your character as JSON and import it here.",
    },
    {
      q: 'Which game systems are supported?',
      a: 'D&D 5e, City of Mist, Legend in the Mist, Powered by the Apocalypse, and Cypher System have ready-to-use templates. Other systems can be exported too — the layout will be more generic. More system-specific templates are added regularly; contact us to request yours.',
    },
    {
      q: 'Which export formats are available?',
      a: 'PDF in A3, A4, A5, and A6 sizes, and PNG in poker card format (63×88 mm). More formats — stickers, custom sizes — can be requested via the contact page.',
    },
    {
      q: 'Do I need to install anything?',
      a: 'You need to install the Sheet Magnet Connector module in Foundry VTT (available in the official module browser). The web app itself runs entirely in your browser — no installation needed.',
    },
    {
      q: 'Is my data safe?',
      a: 'Yes. Your character data is never stored on any external server. For local Foundry, the connection goes directly from your browser to your instance. For hosted Foundry, a temporary relay is used — it only forwards messages and stores nothing. The session expires automatically.',
    },
    {
      q: "I'm a player and my GM doesn't want to share server access. Can I still use sheetmag.net?",
      a: 'Yes. Ask your GM to export your character sheet via the Sheet Magnet button in Foundry (Export JSON). Then import that file directly on the home page — no server connection needed.',
    },
    {
      q: 'Can I order physical prints?',
      a: 'Not yet. Printful integration for ordering physical poker cards and other products is planned. Contact us if this is important to you — it helps us prioritise.',
    },
    {
      q: 'Is sheetmag.net free?',
      a: 'Yes. The app and the Foundry module are open source and free to use. Source code is available on GitHub.',
      link: {
        href: 'https://github.com/RebelliousSmile/sheetmagnet',
        label: 'github.com/RebelliousSmile/sheetmagnet',
      },
    },
  ],
};

const fr = {
  title: 'FAQ',
  subtitle: 'Questions fréquentes sur sheetmag.net.',
  items: [
    {
      q: "Qu'est-ce que sheetmag.net ?",
      a: 'sheetmag.net est une application web pour Foundry VTT qui exporte vos fiches de personnage en PDF ou en image directement depuis votre navigateur. Aucun compte requis, rien de stocké sur des serveurs externes.',
    },
    {
      q: 'Comment se connecter à Foundry ?',
      a: "Cela dépend de la façon dont vous utilisez Foundry. S'il tourne sur votre réseau local, ouvrez Foundry, cliquez sur le bouton Sheet Magnet dans le Répertoire des Acteurs et copiez l'URL et le jeton d'accès affichés. Si vous utilisez un hébergeur (Forge VTT, Molten…), utilisez le code de session et le jeton relay à la place. Si vous êtes joueur sans accès au serveur, demandez à votre MJ d'exporter votre personnage en JSON et importez-le ici.",
    },
    {
      q: 'Quels systèmes de jeu sont supportés ?',
      a: "D&D 5e, City of Mist, Legend in the Mist, Powered by the Apocalypse et Cypher System disposent de templates prêts à l'emploi. Les autres systèmes peuvent aussi être exportés — la mise en page sera plus générique. De nouveaux templates sont ajoutés régulièrement ; contactez-nous pour demander le vôtre.",
    },
    {
      q: "Quels formats d'export sont disponibles ?",
      a: "PDF en A3, A4, A5 et A6, et PNG au format carte de poker (63×88 mm). D'autres formats — stickers, tailles personnalisées — peuvent être demandés via la page contact.",
    },
    {
      q: 'Dois-je installer quelque chose ?',
      a: "Vous devez installer le module Sheet Magnet Connector dans Foundry VTT (disponible dans le navigateur de modules officiel). L'application web tourne entièrement dans votre navigateur — aucune installation nécessaire.",
    },
    {
      q: 'Mes données sont-elles en sécurité ?',
      a: 'Oui. Vos données de personnage ne sont jamais stockées sur un serveur externe. Pour un Foundry local, la connexion va directement de votre navigateur à votre instance. Pour un Foundry hébergé, un relay temporaire est utilisé — il ne fait que transmettre les messages, sans rien stocker. La session expire automatiquement.',
    },
    {
      q: "Je suis joueur et mon MJ ne veut pas partager l'accès au serveur. Puis-je quand même utiliser sheetmag.net ?",
      a: "Oui. Demandez à votre MJ d'exporter votre fiche via le bouton Sheet Magnet dans Foundry (Exporter JSON). Importez ensuite ce fichier directement sur la page d'accueil — aucune connexion au serveur nécessaire.",
    },
    {
      q: 'Puis-je commander des impressions physiques ?',
      a: "Pas encore. L'intégration Printful pour commander des cartes de poker et d'autres produits est prévue. Contactez-nous si c'est important pour vous — cela nous aide à prioriser.",
    },
    {
      q: 'sheetmag.net est-il gratuit ?',
      a: "Oui. L'application et le module Foundry sont open source et gratuits. Le code source est disponible sur GitHub.",
      link: {
        href: 'https://github.com/RebelliousSmile/sheetmagnet',
        label: 'github.com/RebelliousSmile/sheetmagnet',
      },
    },
  ],
};

const t = $derived($lang === 'fr' ? fr : en);
</script>

<Nav />

<div class="page">
  <section class="hero">
    <h1>{t.title}</h1>
    <p class="subtitle">{t.subtitle}</p>
  </section>

  <section class="section">
    <div class="inner">
      <div class="faq-list">
        {#each t.items as item}
          <details class="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
            {#if item.link}
              <a href={item.link.href} class="faq-link" target="_blank" rel="noopener">{item.link.label}</a>
            {/if}
          </details>
        {/each}
      </div>
    </div>
  </section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
  }

  .inner {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  .hero {
    text-align: center;
    padding: 3.5rem var(--space-lg);
    background: linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg) 100%);
    border-bottom: 1px solid var(--color-border);
  }

  .hero h1 {
    font-size: 2rem;
    margin-bottom: var(--space-md);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 1.05rem;
    max-width: 560px;
    margin: 0 auto;
    line-height: 1.6;
  }

  .section {
    padding: 3rem var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    max-width: 760px;
  }

  .faq-item {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--color-border);
  }

  .faq-item summary {
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    font-size: 0.95rem;
  }

  .faq-item summary::after {
    content: '▸';
    font-size: 0.875rem;
    color: var(--color-text-muted);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }

  .faq-item[open] summary::after {
    transform: rotate(90deg);
  }

  .faq-item p {
    margin-top: var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .faq-link {
    display: inline-block;
    margin-top: var(--space-sm);
    font-size: 0.85rem;
    color: var(--color-primary);
    text-decoration: none;
    font-family: var(--font-mono);
  }

  .faq-link:hover {
    text-decoration: underline;
  }

  @media (min-width: 640px) {
    .hero h1 { font-size: 2.5rem; }
  }
</style>
