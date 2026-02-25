<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import { lang } from '$lib/stores/lang';

  const en = {
    title: 'Contact',
    subtitle: 'Sheet Magnet is an open-source project. The best way to get in touch is through GitHub.',
    sections: [
      {
        icon: '🐛',
        title: 'Report a Bug',
        desc: 'Found something that isn\'t working? Open an issue on GitHub and describe what happened.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet/issues',
        label: 'Open an Issue'
      },
      {
        icon: '💡',
        title: 'Feature Request',
        desc: 'Have an idea for a new feature or improvement? Share it with the community on GitHub.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet/issues',
        label: 'Suggest a Feature'
      },
      {
        icon: '🤝',
        title: 'Contribute',
        desc: 'Fork the repository, create a feature branch, and submit a pull request. All contributions are welcome.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet',
        label: 'View on GitHub'
      }
    ],
    techTitle: 'Tech Stack',
    tech: [
      ['Component', 'Technology'],
      ['PWA Framework', 'SvelteKit 2, Svelte 5'],
      ['PDF Generation', 'pdf-lib'],
      ['Canvas / Preview', 'Konva.js'],
      ['Template System', 'TypeScript declarative layouts'],
      ['Styling', 'Custom CSS (mobile-first)'],
      ['Foundry Module', 'Vanilla JS']
    ],
    licenseTitle: 'License',
    license: 'Sheet Magnet is released under the MIT License. You are free to use, modify and distribute it.'
  };

  const fr = {
    title: 'Contact',
    subtitle: 'Sheet Magnet est un projet open source. Le meilleur moyen de nous contacter est via GitHub.',
    sections: [
      {
        icon: '🐛',
        title: 'Signaler un bug',
        desc: 'Quelque chose ne fonctionne pas ? Ouvrez un ticket sur GitHub et décrivez ce qui s\'est passé.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet/issues',
        label: 'Ouvrir un ticket'
      },
      {
        icon: '💡',
        title: 'Demande de fonctionnalité',
        desc: 'Vous avez une idée de nouvelle fonctionnalité ou d\'amélioration ? Partagez-la avec la communauté sur GitHub.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet/issues',
        label: 'Suggérer une fonctionnalité'
      },
      {
        icon: '🤝',
        title: 'Contribuer',
        desc: 'Forkez le dépôt, créez une branche de fonctionnalité et soumettez une pull request. Toutes les contributions sont les bienvenues.',
        link: 'https://github.com/RebelliousSmile/sheetmagnet',
        label: 'Voir sur GitHub'
      }
    ],
    techTitle: 'Stack technique',
    tech: [
      ['Composant', 'Technologie'],
      ['Framework PWA', 'SvelteKit 2, Svelte 5'],
      ['Génération PDF', 'pdf-lib'],
      ['Canvas / Aperçu', 'Konva.js'],
      ['Système de templates', 'Layouts déclaratifs TypeScript'],
      ['Style', 'CSS personnalisé (mobile-first)'],
      ['Module Foundry', 'Vanilla JS']
    ],
    licenseTitle: 'Licence',
    license: 'Sheet Magnet est publié sous la licence MIT. Vous êtes libre de l\'utiliser, le modifier et le distribuer.'
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
    <div class="contact-grid">
      {#each t.sections as s}
        <div class="contact-card">
          <span class="contact-icon">{s.icon}</span>
          <h3>{s.title}</h3>
          <p>{s.desc}</p>
          <a href={s.link} target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
            {s.label} ↗
          </a>
        </div>
      {/each}
    </div>
  </section>

  <section class="section">
    <h2>{t.techTitle}</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            {#each t.tech[0] as col}
              <th>{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each t.tech.slice(1) as row}
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
    <h2>{t.licenseTitle}</h2>
    <div class="card">
      <p>{t.license}</p>
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
    max-width: 520px;
    margin: 0 auto;
  }

  .section {
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .section h2 {
    margin-bottom: var(--space-lg);
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .contact-card {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .contact-icon {
    font-size: 1.75rem;
  }

  .contact-card h3 {
    font-size: 1rem;
  }

  .contact-card p {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    flex: 1;
  }

  .contact-card .btn {
    align-self: flex-start;
    margin-top: var(--space-sm);
    font-size: 0.875rem;
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

  .card p {
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .section {
      padding: var(--space-xl);
    }

    .contact-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
