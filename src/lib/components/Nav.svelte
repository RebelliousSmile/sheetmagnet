<script lang="ts">
  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }
</script>

<nav class="nav">
  <div class="nav-inner">
    <a href="#top" class="nav-brand" onclick={closeMenu}>
      🧲 Sheet Magnet
    </a>

    <button class="nav-toggle" onclick={toggleMenu} aria-label="Toggle menu">
      {#if menuOpen}✕{:else}☰{/if}
    </button>

    <ul class="nav-links" class:open={menuOpen}>
      <li><a href="#features" onclick={closeMenu}>Features</a></li>
      <li><a href="#faq" onclick={closeMenu}>FAQ</a></li>
      <li><a href="#content" onclick={closeMenu}>About</a></li>
      <li><a href="#connect" class="nav-cta" onclick={closeMenu}>Get Started</a></li>
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
    padding: var(--space-sm) var(--space-md);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 900px;
    margin: 0 auto;
    position: relative;
  }

  .nav-brand {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
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
</style>
