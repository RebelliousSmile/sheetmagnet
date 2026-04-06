<script lang="ts">
import { lang } from '$lib/stores/lang';

const t = $derived(
  $lang === 'fr'
    ? {
        tagline: 'Exportez vos fiches de personnage Foundry VTT.',
        legal: 'Mentions légales',
        terms: "Conditions d'utilisation",
        contact: 'Contact',
        features: 'Fonctionnalités',
        faq: 'FAQ',
        rights: 'Tous droits réservés.',
      }
    : {
        tagline: 'Export your Foundry VTT character sheets.',
        legal: 'Legal notices',
        terms: 'Terms of use',
        contact: 'Contact',
        features: 'Features',
        faq: 'FAQ',
        rights: 'All rights reserved.',
      },
);

const year = new Date().getFullYear();
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="brand-name">sheetmag<span class="brand-dot">.net</span></span>
      <span class="brand-tagline">{t.tagline}</span>
      <span class="copyright">© {year} <a href="https://www.scriptami.com" target="_blank" rel="noopener">Scriptami</a> — {t.rights}</span>
    </div>

    <nav class="footer-nav">
      <div class="footer-col">
        <a href="/features">{t.features}</a>
        <a href="/faq">{t.faq}</a>
        <a href="/contact">{t.contact}</a>
      </div>
      <div class="footer-col">
        <a href="/mentions-legales">{t.legal}</a>
        <a href="/cgu">{t.terms}</a>
        <a href="https://github.com/RebelliousSmile/sheetmagnet" target="_blank" rel="noopener">GitHub</a>
      </div>
    </nav>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    padding: var(--space-xl) var(--space-lg);
    margin-top: auto;
  }

  .footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .footer-brand {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .brand-name {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: 0.02em;
  }

  .brand-dot {
    color: var(--color-primary);
  }

  .brand-tagline {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .copyright {
    font-size: 0.8rem;
    color: var(--color-text-dim);
    margin-top: var(--space-xs);
  }

  .copyright a {
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .copyright a:hover {
    color: var(--color-primary);
  }

  .footer-nav {
    display: flex;
    gap: var(--space-xl);
  }

  .footer-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .footer-col a {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color 0.15s;
  }

  .footer-col a:hover {
    color: var(--color-primary);
  }

  @media (min-width: 640px) {
    .footer-inner {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
  }
</style>
