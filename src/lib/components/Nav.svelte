<script lang="ts">
import { lang } from '$lib/stores/lang';

let menuOpen = $state(false);

function toggleMenu() {
  menuOpen = !menuOpen;
}

function closeMenu() {
  menuOpen = false;
}

const t = $derived(
  $lang === 'fr'
    ? {
        features: 'Fonctionnalités',
        showcase: 'Galerie',
        faq: 'FAQ',
        contact: 'Contact',
        start: 'Commencer',
      }
    : {
        features: 'Features',
        showcase: 'Showcase',
        faq: 'FAQ',
        contact: 'Contact',
        start: 'Get Started',
      },
);
</script>

<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-brand" onclick={closeMenu}>
      <span class="brand-sub">Foundry VTT</span>
      <span class="brand-name">sheetmag<span class="brand-dot">.net</span></span>
    </a>

    <button class="nav-toggle" onclick={toggleMenu} aria-label="Toggle menu">
      {#if menuOpen}✕{:else}☰{/if}
    </button>

    <ul class="nav-links" class:open={menuOpen}>
      <li><a href="/features" onclick={closeMenu}>{t.features}</a></li>
      <li><a href="/showcase" onclick={closeMenu}>{t.showcase}</a></li>
      <li><a href="/faq" onclick={closeMenu}>{t.faq}</a></li>
      <li><a href="/contact" onclick={closeMenu}>{t.contact}</a></li>
      <li class="nav-lang-switcher">
        <button
          class="nav-lang" class:active={$lang === 'en'}
          onclick={() => { if ($lang !== 'en') { lang.toggle(); closeMenu(); } }}
        >EN</button>
        <span class="nav-lang-sep">/</span>
        <button
          class="nav-lang" class:active={$lang === 'fr'}
          onclick={() => { if ($lang !== 'fr') { lang.toggle(); closeMenu(); } }}
        >FR</button>
      </li>
      <li><a href="/#connect" class="nav-cta" onclick={closeMenu}>{t.start}</a></li>
    </ul>
  </div>
</nav>

<style>
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-sm) var(--space-lg);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
  }

  .nav-brand {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .brand-dot {
    color: var(--color-primary);
  }

  .brand-sub {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-weight: 500;
  }

  .nav-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--color-text);
    font-size: 1.25rem;
    cursor: pointer;
    padding: var(--space-xs);
  }

  .nav-links {
    display: none;
    list-style: none;
    flex-direction: column;
    gap: 0;
    position: absolute;
    top: calc(100% + var(--space-sm));
    right: 0;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    min-width: 180px;
    padding: var(--space-sm) 0;
    box-shadow: var(--shadow-lg);
  }

  .nav-links.open {
    display: flex;
  }

  .nav-links li a {
    display: block;
    padding: var(--space-sm) var(--space-lg);
    color: var(--color-text);
    text-decoration: none;
    font-size: 0.95rem;
    transition: background-color 0.15s ease;
  }

  .nav-links li a:hover {
    background-color: var(--color-bg-card);
    color: var(--color-primary);
  }

  .nav-links li a.nav-cta {
    color: var(--color-primary);
    font-weight: 600;
  }

  @media (min-width: 640px) {
    .nav-toggle {
      display: none;
    }

    .nav-links {
      display: flex;
      flex-direction: row;
      position: static;
      background: none;
      border: none;
      box-shadow: none;
      padding: 0;
      gap: var(--space-md);
      align-items: center;
      min-width: unset;
    }

    .nav-links li a {
      padding: var(--space-xs) var(--space-sm);
      border-radius: var(--radius-sm);
    }

    .nav-links li a.nav-cta {
      padding: var(--space-xs) var(--space-md);
      background-color: var(--color-primary);
      color: white;
      border-radius: var(--radius-md);
    }

    .nav-links li a.nav-cta:hover {
      background-color: var(--color-primary-hover);
    }
  }

  .nav-lang-switcher {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .nav-lang-sep {
    color: var(--color-border);
    font-size: 0.8rem;
    user-select: none;
  }

  .nav-lang {
    background: none;
    border: none;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    padding: 2px var(--space-xs);
    transition: color 0.15s ease;
    letter-spacing: 0.04em;
  }

  .nav-lang:hover {
    color: var(--color-text);
  }

  .nav-lang.active {
    color: var(--color-primary);
    cursor: default;
  }
</style>
