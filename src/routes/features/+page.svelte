<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'Features',
  subtitle: 'Everything sheetmag.net does for you at the table.',

  featuresTitle: 'What you can do',
  features: [
    {
      title: 'Connect to Foundry in seconds',
      desc: "Open the Sheet Magnet panel in Foundry VTT, copy the session code, and paste it here. No account, no configuration — you're in.",
    },
    {
      title: 'Browse and pick your characters',
      desc: 'All actors visible to you in Foundry appear in the list. Select one or several and export them together.',
    },
    {
      title: 'Preview before you export',
      desc: 'See a live render of your sheet before downloading. Check that everything looks right — then export.',
    },
    {
      title: 'Works on any device',
      desc: "Phone, tablet, laptop — the interface adapts. No app to install: open the URL and you're ready.",
    },
    {
      title: 'For players without GM access',
      desc: 'Not on the server? Ask your GM to export your sheet as JSON via the Sheet Magnet button, then import it here directly.',
    },
    {
      title: 'Your data stays on your network',
      desc: 'Nothing is stored on external servers. The connection goes directly from your browser to your Foundry instance.',
    },
  ],

  formatsTitle: 'Print formats',
  formatsSubtitle: 'Choose the format that fits your table and your printer.',
  formats: [
    {
      id: 'a4',
      name: 'PDF A4',
      size: '210 × 297 mm',
      ideal: 'Home printing',
      desc: 'The classic character sheet. Print it at home or at your local print shop. Perfect for keeping in a binder or slipping into a page protector.',
    },
    {
      id: 'a5',
      name: 'PDF A5',
      size: '148 × 210 mm',
      ideal: 'Booklet / notebook',
      desc: 'Half the size of A4. Fits neatly into a campaign notebook or a small gaming folder. Easier to handle at a crowded table.',
    },
    {
      id: 'a6',
      name: 'PDF A6',
      size: '105 × 148 mm',
      ideal: 'Pocket reference',
      desc: 'Postcard-sized. Ideal as a quick-reference card for key stats: slip it in your pocket or prop it up next to your dice.',
    },
    {
      id: 'a3',
      name: 'PDF A3',
      size: '297 × 420 mm',
      ideal: 'Display / GM screen',
      desc: 'Large format for when you want every detail visible at a glance. Great as a poster on the table or pinned to a GM screen.',
    },
    {
      id: 'card',
      name: 'PNG Card',
      size: '63 × 88 mm',
      ideal: 'Poker card / Printful',
      desc: 'Standard poker card dimensions. Order physical prints via Printful — sleeve them, shuffle them, hand them out. Also useful for digital reference on a tablet.',
    },
  ],

  ctaTitle: 'Need another format?',
  ctaDesc:
    'Stickers, pencil wraps, mugs, custom sizes — if you have a specific need, tell us about it.',
  ctaBtn: 'Contact us',
};

const fr = {
  title: 'Fonctionnalités',
  subtitle: 'Tout ce que sheetmag.net fait pour vous à la table.',

  featuresTitle: 'Ce que vous pouvez faire',
  features: [
    {
      title: 'Connectez-vous à Foundry en quelques secondes',
      desc: 'Ouvrez le panneau Sheet Magnet dans Foundry VTT, copiez le code de session et collez-le ici. Pas de compte, pas de configuration — vous êtes connecté.',
    },
    {
      title: 'Parcourez et choisissez vos personnages',
      desc: 'Tous les acteurs visibles dans Foundry apparaissent dans la liste. Sélectionnez-en un ou plusieurs et exportez-les ensemble.',
    },
    {
      title: "Prévisualisez avant d'exporter",
      desc: 'Voyez un rendu en direct de votre fiche avant de la télécharger. Vérifiez que tout est correct — puis exportez.',
    },
    {
      title: 'Fonctionne sur tous les appareils',
      desc: "Téléphone, tablette, ordinateur — l'interface s'adapte. Aucune application à installer : ouvrez l'URL et vous êtes prêt.",
    },
    {
      title: 'Pour les joueurs sans accès MJ',
      desc: "Pas accès au serveur ? Demandez à votre MJ d'exporter votre fiche en JSON via le bouton Sheet Magnet, puis importez-la ici directement.",
    },
    {
      title: 'Vos données restent sur votre réseau',
      desc: "Rien n'est stocké sur des serveurs externes. La connexion se fait directement de votre navigateur à votre instance Foundry.",
    },
  ],

  formatsTitle: "Formats d'impression",
  formatsSubtitle:
    'Choisissez le format adapté à votre table et à votre imprimante.',
  formats: [
    {
      id: 'a4',
      name: 'PDF A4',
      size: '210 × 297 mm',
      ideal: 'Impression à domicile',
      desc: 'La fiche de personnage classique. Imprimez-la chez vous ou en reprographie. Idéale pour un classeur ou une pochette plastique.',
    },
    {
      id: 'a5',
      name: 'PDF A5',
      size: '148 × 210 mm',
      ideal: 'Livret / carnet',
      desc: "La moitié d'un A4. S'intègre parfaitement dans un carnet de campagne ou un petit dossier de jeu. Plus pratique à une table encombrée.",
    },
    {
      id: 'a6',
      name: 'PDF A6',
      size: '105 × 148 mm',
      ideal: 'Référence de poche',
      desc: 'Format carte postale. Idéal comme aide-mémoire pour vos stats clés : glissez-le dans une poche ou posez-le à côté de vos dés.',
    },
    {
      id: 'a3',
      name: 'PDF A3',
      size: '297 × 420 mm',
      ideal: 'Affichage / écran MJ',
      desc: "Grand format pour voir chaque détail d'un coup d'œil. Parfait comme poster sur la table ou accroché à un écran de MJ.",
    },
    {
      id: 'card',
      name: 'PNG Carte',
      size: '63 × 88 mm',
      ideal: 'Carte de poker / Printful',
      desc: "Dimensions standard d'une carte de poker. Commandez des impressions physiques via Printful — protégez-les, battez-les, distribuez-les. Utile aussi en référence numérique sur tablette.",
    },
  ],

  ctaTitle: "Besoin d'un autre format ?",
  ctaDesc:
    'Stickers, porte-mines, mugs, formats personnalisés — si vous avez un besoin spécifique, parlez-nous en.',
  ctaBtn: 'Nous contacter',
};

const t = $derived($lang === 'fr' ? fr : en);
</script>

<Nav />

<div class="page">
  <section class="hero">
    <h1>{t.title}</h1>
    <p class="subtitle">{t.subtitle}</p>
  </section>

  <!-- Features list -->
  <section class="section">
    <div class="inner">
      <h2>{t.featuresTitle}</h2>
      <div class="features-grid">
        {#each t.features as feature}
          <div class="feature-card">
            <strong>{feature.title}</strong>
            <p>{feature.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Print formats -->
  <section class="section section-alt">
    <div class="inner">
      <h2>{t.formatsTitle}</h2>
      <p class="section-sub">{t.formatsSubtitle}</p>
      <div class="formats-grid">
        {#each t.formats as f}
          <div class="format-card">
            <div class="format-thumb format-thumb--{f.id}">
              <!-- illustration placeholder -->
            </div>
            <div class="format-body">
              <div class="format-header">
                <strong>{f.name}</strong>
                <span class="format-size">{f.size}</span>
              </div>
              <span class="format-ideal">{f.ideal}</span>
              <p>{f.desc}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="section">
    <div class="inner">
      <div class="format-cta">
        <div>
          <strong>{t.ctaTitle}</strong>
          <p>{t.ctaDesc}</p>
        </div>
        <a href="/contact" class="btn btn-primary">{t.ctaBtn}</a>
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

  .section-alt {
    background: var(--color-bg-secondary);
  }

  .section h2 {
    margin-bottom: var(--space-lg);
  }

  .section-sub {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    margin-bottom: var(--space-xl);
    margin-top: calc(-1 * var(--space-sm));
  }

  /* Features grid */
  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-lg) var(--space-xl);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .feature-card strong {
    font-size: 1rem;
    color: var(--color-text);
  }

  .feature-card p {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  /* Format placeholder illustration */
  .format-thumb {
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  /* Inner sheet silhouette */
  .format-thumb::after {
    content: '';
    position: absolute;
    inset: 16px;
    background: var(--color-bg);
    border: 1px solid var(--color-border-light);
    border-radius: 2px;
    box-shadow: var(--shadow-sm);
  }

  /* Ratio par format — hauteur fixe, largeur via aspect-ratio */
  .format-thumb--a3  { aspect-ratio: 297 / 420; max-height: 180px; width: 100%; }
  .format-thumb--a4  { aspect-ratio: 210 / 297; max-height: 180px; width: 100%; }
  .format-thumb--a5  { aspect-ratio: 148 / 210; max-height: 180px; width: 100%; }
  .format-thumb--a6  { aspect-ratio: 105 / 148; max-height: 180px; width: 100%; }
  .format-thumb--card { aspect-ratio: 63 / 88;  max-height: 180px; width: 100%; }

  /* Formats grid */
  .formats-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .format-card {
    display: flex;
    flex-direction: column;
    padding: var(--space-lg);
    background: var(--color-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
  }

  .format-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .format-header {
    display: flex;
    align-items: baseline;
    gap: var(--space-md);
  }

  .format-header strong {
    font-size: 1rem;
  }

  .format-size {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    font-family: var(--font-mono);
  }

  .format-ideal {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .format-card p {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  /* Bottom CTA */
  .format-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-xl);
    flex-wrap: wrap;
  }

  .format-cta strong {
    display: block;
    font-size: 1.1rem;
    margin-bottom: var(--space-sm);
  }

  .format-cta p {
    color: var(--color-text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
    max-width: 480px;
  }

  @media (min-width: 640px) {
    .hero h1 { font-size: 2.5rem; }
    .features-grid { grid-template-columns: 1fr 1fr; }
    .formats-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (min-width: 900px) {
    .features-grid { grid-template-columns: repeat(3, 1fr); }
    .formats-grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>
