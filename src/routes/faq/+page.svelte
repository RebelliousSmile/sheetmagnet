<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import { lang } from '$lib/stores/lang';

  const en = {
    title: 'FAQ',
    subtitle: 'Frequently asked questions about Sheet Magnet.',
    items: [
      {
        q: 'What is Sheet Magnet?',
        a: 'Sheet Magnet is a companion web app for Foundry VTT that lets you export character sheets to PDF, PNG, and other formats directly from your browser or mobile device. Your data never leaves your local network.'
      },
      {
        q: 'How do I connect to Foundry?',
        a: 'Open Foundry VTT and click the Sheet Magnet button in the Actors Directory. A dialog will appear with a URL, an access token, and a QR code. On mobile, scan the QR code to connect instantly. On desktop, copy the URL and token and paste them into the app.'
      },
      {
        q: 'Which export formats are supported?',
        a: 'Sheet Magnet currently supports PDF (A3, A4, A5, A6) and PNG in poker card format (63×88 mm). More formats — including stickers and other print sizes — are planned for future releases.'
      },
      {
        q: 'Do I need to install anything?',
        a: 'You need to install the Sheet Magnet Connector module in Foundry VTT. The web app itself runs entirely in your browser — no installation required. You can also install it as a PWA on your phone for quick access.'
      },
      {
        q: 'Is my data safe?',
        a: 'Yes. Sheet Magnet is designed with zero persistence in mind. The Foundry module only accepts connections from your local network, uses a session token that changes every restart, and has read-only access to your data. Nothing is stored on any external server.'
      },
      {
        q: 'Which Foundry VTT game systems are supported?',
        a: 'Sheet Magnet works with any game system installed in Foundry VTT, as it fetches raw actor data through the REST API. System-specific templates (for prettier card layouts) are planned for popular systems like D&D 5e and City of Mist.'
      },
      {
        q: 'Can I order physical prints?',
        a: 'Printful integration for ordering physical poker cards and other print products is planned but not yet available. Check the Features page for the current roadmap.'
      },
      {
        q: 'Is Sheet Magnet free?',
        a: 'Yes, Sheet Magnet is open source and free to use. Contributions and feedback from the community are welcome.'
      }
    ]
  };

  const fr = {
    title: 'FAQ',
    subtitle: 'Questions fréquemment posées sur Sheet Magnet.',
    items: [
      {
        q: 'Qu\'est-ce que Sheet Magnet ?',
        a: 'Sheet Magnet est une application web compagnon pour Foundry VTT qui vous permet d\'exporter des feuilles de personnage en PDF, PNG et d\'autres formats directement depuis votre navigateur ou votre mobile. Vos données ne quittent jamais votre réseau local.'
      },
      {
        q: 'Comment se connecter à Foundry ?',
        a: 'Ouvrez Foundry VTT et cliquez sur le bouton Sheet Magnet dans le Répertoire des Acteurs. Une fenêtre apparaît avec une URL, un jeton d\'accès et un QR code. Sur mobile, scannez le QR code pour vous connecter instantanément. Sur ordinateur, copiez l\'URL et le jeton puis collez-les dans l\'application.'
      },
      {
        q: 'Quels formats d\'export sont supportés ?',
        a: 'Sheet Magnet supporte actuellement le PDF (A3, A4, A5, A6) et le PNG au format carte de poker (63×88 mm). D\'autres formats — stickers, autres tailles d\'impression — sont prévus pour les prochaines versions.'
      },
      {
        q: 'Dois-je installer quelque chose ?',
        a: 'Vous devez installer le module Sheet Magnet Connector dans Foundry VTT. L\'application web tourne entièrement dans votre navigateur — aucune installation requise. Vous pouvez aussi l\'installer en tant que PWA sur votre téléphone pour un accès rapide.'
      },
      {
        q: 'Mes données sont-elles en sécurité ?',
        a: 'Oui. Sheet Magnet est conçu avec un principe de zéro persistance. Le module Foundry n\'accepte que les connexions depuis votre réseau local, utilise un jeton de session qui change à chaque redémarrage et n\'a accès qu\'en lecture seule à vos données. Rien n\'est stocké sur un serveur externe.'
      },
      {
        q: 'Quels systèmes de jeu Foundry VTT sont supportés ?',
        a: 'Sheet Magnet fonctionne avec n\'importe quel système de jeu installé dans Foundry VTT, car il récupère les données brutes des acteurs via l\'API REST. Des templates spécifiques aux systèmes (pour des mises en page plus soignées) sont prévus pour les systèmes populaires comme D&D 5e et City of Mist.'
      },
      {
        q: 'Puis-je commander des impressions physiques ?',
        a: 'L\'intégration Printful pour commander des cartes de poker et d\'autres produits imprimés est prévue mais pas encore disponible. Consultez la page Fonctionnalités pour la feuille de route actuelle.'
      },
      {
        q: 'Sheet Magnet est-il gratuit ?',
        a: 'Oui, Sheet Magnet est open source et gratuit. Les contributions et retours de la communauté sont les bienvenus.'
      }
    ]
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
    <div class="faq-list">
      {#each t.items as item}
        <details class="faq-item">
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      {/each}
    </div>
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

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
  }

  .faq-item {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .faq-item summary {
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
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

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .section {
      padding: var(--space-xl);
    }
  }
</style>
