<script lang="ts">
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';

const en = {
  title: 'Showcase',
  subtitle:
    'Character sheets exported with sheetmag.net — shared by the community.',
  empty: 'No magnets yet — be the first to share yours!',
  cta: 'Export your first magnet',
  share: 'Want to share your export?',
  shareBtn: 'Contact us',
  systems: {
    dnd5e: 'D&D 5e',
    'city-of-mist': 'City of Mist',
    litm: 'Legend in the Mist',
    pbta: 'PBTA',
    cypher: 'Cypher System',
  } as Record<string, string>,
  format: {
    'pdf-a4': 'PDF A4',
    'pdf-a5': 'PDF A5',
    'png-card': 'Card',
  } as Record<string, string>,
};

const fr = {
  title: 'Galerie',
  subtitle:
    'Des fiches de personnage exportées avec sheetmag.net — partagées par la communauté.',
  empty: "Aucun magnet pour l'instant — soyez le premier à partager le vôtre !",
  cta: 'Exporter votre premier magnet',
  share: 'Envie de partager votre export ?',
  shareBtn: 'Contactez-nous',
  systems: {
    dnd5e: 'D&D 5e',
    'city-of-mist': 'City of Mist',
    litm: 'Legend in the Mist',
    pbta: 'PBTA',
    cypher: 'Cypher System',
  } as Record<string, string>,
  format: {
    'pdf-a4': 'PDF A4',
    'pdf-a5': 'PDF A5',
    'png-card': 'Carte',
  } as Record<string, string>,
};

// Placeholder items — will be replaced by real community exports
const placeholders = [
  {
    id: '1',
    system: 'dnd5e',
    format: 'pdf-a4',
    title: 'Aldric Flambecœur',
    author: 'RebelliousSmile',
  },
  {
    id: '2',
    system: 'city-of-mist',
    format: 'png-card',
    title: 'Nyx',
    author: 'GM_Kayla',
  },
  {
    id: '3',
    system: 'dnd5e',
    format: 'pdf-a5',
    title: 'Tharynn',
    author: 'DungeonKrueger',
  },
  {
    id: '4',
    system: 'litm',
    format: 'png-card',
    title: 'Marco Rossi',
    author: 'GMFrancesco',
  },
  {
    id: '5',
    system: 'cypher',
    format: 'pdf-a4',
    title: 'Zephira',
    author: 'NumenPlayer',
  },
  {
    id: '6',
    system: 'pbta',
    format: 'png-card',
    title: 'Juniper',
    author: 'StoryHoncho',
  },
];

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
      <div class="showcase-grid">
        {#each placeholders as item}
          <div class="showcase-card placeholder">
            <div class="card-thumb"></div>
            <div class="card-meta">
              <strong>{item.title}</strong>
              <span class="card-tags">
                <span class="tag">{t.systems[item.system] ?? item.system}</span>
                <span class="tag tag-format">{t.format[item.format] ?? item.format}</span>
              </span>
              <span class="card-author">by {item.author}</span>
            </div>
          </div>
        {/each}
      </div>

      <div class="share-cta">
        <div>
          <strong>{t.share}</strong>
          <p>{$lang === 'fr' ? 'Exportez votre fiche et envoyez-nous le résultat.' : 'Export your sheet and send us the result.'}</p>
        </div>
        <a href="/contact" class="btn btn-primary">{t.shareBtn}</a>
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
  }

  /* Showcase grid */
  .showcase-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
    margin-bottom: var(--space-xl);
  }

  .showcase-card {
    background: var(--color-bg-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .showcase-card.placeholder {
    opacity: 0.7;
  }

  .card-thumb {
    background: var(--color-bg-secondary);
    aspect-ratio: 3 / 4;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--color-border);
  }

  .card-meta {
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .card-meta strong {
    font-size: 0.95rem;
  }

  .card-tags {
    display: flex;
    gap: var(--space-xs);
    flex-wrap: wrap;
  }

  .tag {
    font-size: 0.72rem;
    padding: 2px var(--space-sm);
    border-radius: var(--radius-full);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  .tag-format {
    background: var(--color-primary-glow);
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .card-author {
    font-size: 0.8rem;
    color: var(--color-text-dim);
  }

  /* Share CTA */
  .share-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-lg);
    padding: var(--space-xl);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    flex-wrap: wrap;
  }

  .share-cta strong {
    display: block;
    margin-bottom: var(--space-xs);
  }

  .share-cta p {
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }

  @media (min-width: 640px) {
    .hero h1 { font-size: 2.5rem; }
    .showcase-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (min-width: 900px) {
    .showcase-grid { grid-template-columns: repeat(4, 1fr); }
  }
</style>
