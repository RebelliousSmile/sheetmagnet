<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'Features',
  subtitle: 'Everything you need to bring your character sheets to life.',
  features: [
    {
      icon: '🔒',
      title: 'Zero Storage',
      desc: 'Your data stays on your network. Nothing is ever sent to or stored on external servers — complete privacy by design.',
    },
    {
      icon: '📄',
      title: 'Multi-Format Export',
      desc: 'Export to PDF (A3, A4, A5, A6) or PNG poker card format. Choose the size that fits your table or print service.',
    },
    {
      icon: '📡',
      title: 'QR Code Connection',
      desc: 'Open Foundry, click the Sheet Magnet button, and scan the QR code with your phone. Connected in seconds.',
    },
    {
      icon: '📱',
      title: 'Mobile-First PWA',
      desc: 'Designed for phones and tablets from the ground up. Install it as a PWA and use it anywhere, even offline.',
    },
    {
      icon: '🎲',
      title: 'Any Game System',
      desc: 'Works with every Foundry VTT game system. Select one or more actors and export them instantly.',
    },
    {
      icon: '🖼️',
      title: 'Template Engine',
      desc: 'A declarative layout engine binds actor data to card templates. Fully typed with TypeScript for reliability.',
    },
    {
      icon: '🖨️',
      title: 'Print Services',
      desc: 'Order physical prints via Printful — poker cards, stickers, and more. (Coming soon)',
    },
    {
      icon: '👁️',
      title: 'Live Preview',
      desc: 'Preview your export in real time with the Konva canvas renderer before downloading or ordering prints.',
    },
  ],
  formats: 'Supported Export Formats',
  formatsTable: [
    ['Format', 'Size', 'Use Case'],
    ['PDF A3', '297×420 mm', 'Poster'],
    ['PDF A4', '210×297 mm', 'Standard sheet'],
    ['PDF A5', '148×210 mm', 'Booklet'],
    ['PDF A6', '105×148 mm', 'Pocket sheet'],
    ['PNG Card', '63×88 mm', 'Poker card (Printful)'],
  ],
  roadmap: 'Roadmap',
  roadmapItems: [
    { done: true, text: 'Foundry VTT connector' },
    { done: true, text: 'PDF export (A3–A6)' },
    { done: true, text: 'PNG export' },
    { done: true, text: 'Poker card format' },
    { done: true, text: 'Template engine with bindings' },
    { done: true, text: 'Konva live preview' },
    { done: true, text: 'QR code scanner for mobile' },
    {
      done: false,
      text: 'System-specific templates (City of Mist, D&D 5e, …)',
    },
    { done: false, text: 'Printful API integration' },
    { done: false, text: 'More print formats (stickers, pencil wraps, mugs)' },
  ],
};

const fr = {
  title: 'Fonctionnalités',
  subtitle: "Tout ce qu'il faut pour donner vie à vos feuilles de personnage.",
  features: [
    {
      icon: '🔒',
      title: 'Zéro stockage',
      desc: "Vos données restent sur votre réseau. Rien n'est jamais envoyé ni stocké sur des serveurs externes — confidentialité totale.",
    },
    {
      icon: '📄',
      title: 'Export multi-format',
      desc: "Exportez en PDF (A3, A4, A5, A6) ou en PNG format carte de poker. Choisissez la taille adaptée à votre table ou à votre service d'impression.",
    },
    {
      icon: '📡',
      title: 'Connexion par QR Code',
      desc: 'Ouvrez Foundry, cliquez sur le bouton Sheet Magnet et scannez le QR code avec votre téléphone. Connecté en quelques secondes.',
    },
    {
      icon: '📱',
      title: 'PWA Mobile-first',
      desc: "Conçu pour les téléphones et tablettes. Installez-le comme une PWA et utilisez-le n'importe où, même hors ligne.",
    },
    {
      icon: '🎲',
      title: 'Tous les systèmes de jeu',
      desc: 'Compatible avec chaque système de jeu Foundry VTT. Sélectionnez un ou plusieurs acteurs et exportez-les instantanément.',
    },
    {
      icon: '🖼️',
      title: 'Moteur de templates',
      desc: 'Un moteur de mise en page déclaratif lie les données des acteurs aux templates de cartes. Entièrement typé en TypeScript.',
    },
    {
      icon: '🖨️',
      title: "Services d'impression",
      desc: 'Commandez des impressions physiques via Printful — cartes de poker, stickers et plus. (Bientôt disponible)',
    },
    {
      icon: '👁️',
      title: 'Aperçu en temps réel',
      desc: 'Visualisez votre export en temps réel avec le rendu canvas Konva avant de télécharger ou de commander.',
    },
  ],
  formats: "Formats d'export supportés",
  formatsTable: [
    ['Format', 'Taille', 'Usage'],
    ['PDF A3', '297×420 mm', 'Poster'],
    ['PDF A4', '210×297 mm', 'Feuille standard'],
    ['PDF A5', '148×210 mm', 'Livret'],
    ['PDF A6', '105×148 mm', 'Feuille de poche'],
    ['PNG Card', '63×88 mm', 'Carte de poker (Printful)'],
  ],
  roadmap: 'Feuille de route',
  roadmapItems: [
    { done: true, text: 'Connecteur Foundry VTT' },
    { done: true, text: 'Export PDF (A3–A6)' },
    { done: true, text: 'Export PNG' },
    { done: true, text: 'Format carte de poker' },
    { done: true, text: 'Moteur de templates avec liaisons' },
    { done: true, text: 'Aperçu en direct avec Konva' },
    { done: true, text: 'Scanner QR code sur mobile' },
    {
      done: false,
      text: 'Templates spécifiques aux systèmes (City of Mist, D&D 5e, …)',
    },
    { done: false, text: 'Intégration API Printful' },
    {
      done: false,
      text: "Plus de formats d'impression (stickers, porte-mines, mugs)",
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
    <div class="features-grid">
      {#each t.features as feature}
        <div class="feature-card">
          <span class="feature-icon">{feature.icon}</span>
          <h3>{feature.title}</h3>
          <p>{feature.desc}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="section">
    <h2>{t.formats}</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            {#each t.formatsTable[0] as col}
              <th>{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each t.formatsTable.slice(1) as row}
            <tr>
              {#each row as cell}
                <td>{cell}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <h2>{t.roadmap}</h2>
    <ul class="roadmap-list">
      {#each t.roadmapItems as item}
        <li class:done={item.done}>
          <span class="check">{item.done ? '✅' : '⬜'}</span>
          {item.text}
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .hero {
    text-align: center;
    padding: var(--space-xl) var(--space-md);
  }

  .hero h1 {
    font-size: 2rem;
    margin-bottom: var(--space-md);
  }

  .subtitle {
    color: var(--color-text-muted);
    font-size: 1.05rem;
    max-width: 480px;
    margin: 0 auto;
  }

  .section {
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .section h2 {
    margin-bottom: var(--space-lg);
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .feature-card {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .feature-icon {
    font-size: 1.75rem;
  }

  .feature-card h3 {
    font-size: 1rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    text-align: left;
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  th {
    color: var(--color-text-muted);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  tr:last-child td {
    border-bottom: none;
  }

  .roadmap-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .roadmap-list li {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }

  .roadmap-list li.done {
    color: var(--color-text);
  }

  .check {
    font-size: 1rem;
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .section {
      padding: var(--space-xl);
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 900px) {
    .features-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
