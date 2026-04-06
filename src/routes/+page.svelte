<script lang="ts">
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { page } from '$app/stores';
import Nav from '$lib/components/Nav.svelte';
import { lang } from '$lib/stores/lang';
import {
  connection,
  connect,
  connectViaRelay,
  importActorJson,
  isConnected,
} from '$lib/stores/session';

const STORAGE_KEY = 'foundry_url';

// Active tab
let mode = $state<'local' | 'forge' | 'import'>('local');

// Local connection
let url = $state(
  typeof localStorage !== 'undefined'
    ? (localStorage.getItem(STORAGE_KEY) ?? '')
    : '',
);
let token = $state('');

// Relay / Forge VTT
let relayCode = $state('');
let relayToken = $state('');

// JSON import
let jsonText = $state('');
let jsonError = $state('');

let isLoading = $state(false);

const t = $derived(
  $lang === 'fr'
    ? {
        heroDesc:
          'Sheet Magnet connecte votre instance Foundry VTT et exporte vos fiches de personnage en PDF, image ou format imprimable — sans installation, directement depuis votre navigateur.',
        getStarted: 'Commencer',
        whyTitle: 'Pourquoi sheetmag.net ?',
        benefits: [
          {
            title: 'Votre fiche, partout',
            desc: 'Exportez en PDF ou en image et gardez votre fiche sur votre téléphone, imprimez-la ou partagez-la avec votre groupe — sans dépendre de Foundry le soir de jeu.',
          },
          {
            title: 'Pour toute la table',
            desc: 'Même les joueurs sans accès au serveur Foundry peuvent récupérer leur fiche. Le MJ exporte, le joueur importe — en quelques secondes.',
          },
          {
            title: 'Rien ne quitte votre réseau',
            desc: 'Vos données de personnage ne transitent jamais par des serveurs tiers. La connexion se fait directement entre votre navigateur et votre Foundry.',
          },
          {
            title: 'Prêt à imprimer',
            desc: 'Choisissez le format adapté : feuille A4 classique, livret de poche, ou carte de poker pour un rendu pro à poser sur la table.',
          },
        ],
        systemsTitle: 'Systèmes supportés',
        systemsSubtitle:
          "Des templates prêts à l'emploi pour vos jeux préférés.",
        systemsList: [
          {
            id: 'dnd5e',
            name: 'D&D 5e',
            desc: 'Caractéristiques, compétences, sorts, équipement — tout est là.',
          },
          {
            id: 'city-of-mist',
            name: 'City of Mist',
            desc: 'Thèmes, tags, statuts et indices mis en valeur.',
          },
          {
            id: 'litm',
            name: 'Legend in the Mist',
            desc: 'Investigation et action dans un format léger.',
          },
          {
            id: 'pbta',
            name: 'Powered by the Apocalypse',
            desc: 'Moves, stats et cases de dommages pour vos jeux PBTA.',
          },
          {
            id: 'cypher',
            name: 'Cypher System',
            desc: 'Numenera, The Strange et tout univers Cypher.',
          },
        ],
        systemsCta: "Votre système n'est pas listé ?",
        systemsCtaBtn: 'Demander un système',
        connectTitle: 'Comment accédez-vous à Foundry VTT ?',
        modeLocal: 'Foundry local',
        modeLocalHint:
          'Foundry installé sur votre réseau local ou un serveur personnel',
        modeForge: 'Foundry hébergé',
        modeForgeHint: 'Forge VTT, Molten ou tout autre hébergeur Foundry',
        modeImport: 'Joueur sans accès MJ',
        modeImportHint:
          "Importez directement le JSON d'un acteur exporté depuis Foundry",
        localHint:
          'Ouvrez Foundry VTT, cliquez sur le bouton Sheet Magnet et copiez les informations affichées.',
        foundryUrl: 'URL Foundry',
        accessToken: "Jeton d'accès",
        connect: 'Connecter',
        connecting: 'Connexion…',
        forgeHint:
          "Dans Foundry, cliquez sur Sheet Magnet dans le répertoire d'acteurs, puis copiez le code de session et le jeton affichés.",
        relayCode: 'Code de session',
        relayToken: 'Jeton',
        relayConnect: 'Connecter',
        importHint:
          "Demandez à votre MJ d'exporter votre fiche via le bouton Sheet Magnet → Exporter JSON, puis collez le contenu ici.",
        importJson: "Coller le JSON de l'acteur",
        importJsonPlaceholder: '{ "id": "...", "name": "...", ... }',
        importBtn: 'Importer',
        importFileBtn: 'Charger un fichier .json',
        importError: 'JSON invalide ou format non reconnu.',
      }
    : {
        heroDesc:
          'Sheet Magnet connects to your Foundry VTT instance and exports your character sheets to PDF, image, or print-ready format — no installation needed, straight from your browser.',
        getStarted: 'Get Started',
        whyTitle: 'Why sheetmag.net?',
        benefits: [
          {
            title: 'Your sheet, anywhere',
            desc: 'Export to PDF or image and keep your character sheet on your phone, print it, or share it with the group — no need for Foundry on game night.',
          },
          {
            title: 'For the whole table',
            desc: 'Players without server access can still get their sheet. The GM exports, the player imports — done in seconds.',
          },
          {
            title: 'Nothing leaves your network',
            desc: 'Your character data never passes through third-party servers. The connection goes directly between your browser and your Foundry.',
          },
          {
            title: 'Print-ready',
            desc: 'Pick the right format: standard A4 sheet, pocket booklet, or poker card for a pro look on the table.',
          },
        ],
        systemsTitle: 'Supported systems',
        systemsSubtitle: 'Ready-to-use templates for your favourite games.',
        systemsList: [
          {
            id: 'dnd5e',
            name: 'D&D 5e',
            desc: 'Ability scores, skills, spells, equipment — all covered.',
          },
          {
            id: 'city-of-mist',
            name: 'City of Mist',
            desc: 'Themes, tags, statuses and clues, beautifully laid out.',
          },
          {
            id: 'litm',
            name: 'Legend in the Mist',
            desc: 'Investigation and action in a lightweight format.',
          },
          {
            id: 'pbta',
            name: 'Powered by the Apocalypse',
            desc: 'Moves, stats and harm boxes for your PBTA games.',
          },
          {
            id: 'cypher',
            name: 'Cypher System',
            desc: 'Numenera, The Strange and any Cypher universe.',
          },
        ],
        systemsCta: 'Your system is not listed?',
        systemsCtaBtn: 'Request a system',
        connectTitle: 'How do you access Foundry VTT?',
        modeLocal: 'Local Foundry',
        modeLocalHint:
          'Foundry installed on your local network or personal server',
        modeForge: 'Hosted Foundry',
        modeForgeHint:
          'Forge VTT, Molten, or any other Foundry hosting provider',
        modeImport: 'Player without GM access',
        modeImportHint: 'Import a JSON file exported from Foundry directly',
        localHint:
          'Open Foundry VTT, click the Sheet Magnet button and copy the information shown.',
        foundryUrl: 'Foundry URL',
        accessToken: 'Access Token',
        connect: 'Connect',
        connecting: 'Connecting…',
        forgeHint:
          'In Foundry, click Sheet Magnet in the Actors Directory, then copy the session code and token shown.',
        relayCode: 'Session code',
        relayToken: 'Token',
        relayConnect: 'Connect',
        importHint:
          'Ask your GM to export your sheet via the Sheet Magnet button → Export JSON, then paste the content here.',
        importJson: 'Paste actor JSON',
        importJsonPlaceholder: '{ "id": "...", "name": "...", ... }',
        importBtn: 'Import',
        importFileBtn: 'Load a .json file',
        importError: 'Invalid JSON or unrecognized format.',
      },
);

onMount(() => {
  const encodedData = $page.url.searchParams.get('data');
  if (encodedData) {
    // Legacy QR deep-link — ignore silently
  }
});

async function handleLocalConnect() {
  if (!url || !token) return;
  localStorage.setItem(STORAGE_KEY, url);
  isLoading = true;
  const success = await connect(url, token);
  isLoading = false;
  if (success) goto('/select');
}

async function handleRelayConnect() {
  if (!relayCode || !relayToken) return;
  isLoading = true;
  const success = await connectViaRelay(relayCode.trim(), relayToken.trim());
  isLoading = false;
  if (success) goto('/select');
}

function handleImport() {
  jsonError = '';
  const actor = importActorJson(jsonText.trim());
  if (!actor) {
    jsonError = t.importError;
    return;
  }
  goto('/select');
}

function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    jsonText = (ev.target?.result as string) ?? '';
  };
  reader.readAsText(file);
}

$effect(() => {
  if ($isConnected) goto('/select');
});
</script>

<Nav />

<div id="top" class="landing">

  <!-- Hero -->
  <section class="hero">
    <h1 class="hero-title">sheetmag<span class="hero-dot">.net</span></h1>
    <p class="hero-desc">{t.heroDesc}</p>
    <a href="#connect" class="btn btn-primary">{t.getStarted}</a>
  </section>

  <!-- Benefits -->
  <section class="benefits-section">
    <div class="inner">
      <h2>{t.whyTitle}</h2>
      <div class="benefits-grid">
        {#each t.benefits as b}
          <div class="benefit-card">
            <strong>{b.title}</strong>
            <p>{b.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Systems -->
  <section class="systems-section">
    <div class="inner">
      <h2>{t.systemsTitle}</h2>
      <p class="systems-subtitle">{t.systemsSubtitle}</p>
      <div class="systems-grid">
        {#each t.systemsList as s}
          <div class="system-card">
            <strong>{s.name}</strong>
            <span>{s.desc}</span>
          </div>
        {/each}
      </div>
      <div class="systems-cta">
        <span>{t.systemsCta}</span>
        <a href="/contact" class="cta-link">{t.systemsCtaBtn} →</a>
      </div>
    </div>
  </section>

  <!-- Connect -->
  <section id="connect" class="connect-section">
    <div class="inner">
      <h2>{t.connectTitle}</h2>

      <!-- Tabs -->
      <div class="tabs" role="tablist">
        <button
          class="tab" class:active={mode === 'local'}
          role="tab" aria-selected={mode === 'local'}
          onclick={() => (mode = 'local')}
        >
          {t.modeLocal}
        </button>
        <button
          class="tab" class:active={mode === 'forge'}
          role="tab" aria-selected={mode === 'forge'}
          onclick={() => (mode = 'forge')}
        >
          {t.modeForge}
        </button>
        <button
          class="tab" class:active={mode === 'import'}
          role="tab" aria-selected={mode === 'import'}
          onclick={() => (mode = 'import')}
        >
          {t.modeImport}
        </button>
      </div>

      <!-- Tab panels -->
      <div class="tab-panel">
        {#if mode === 'local'}
          <p class="hint">{t.localHint}</p>
          <div class="form-area">
            <div class="form-group">
              <label for="url">{t.foundryUrl}</label>
              <input
                id="url"
                type="url"
                bind:value={url}
                placeholder="http://192.168.1.100:30000"
                disabled={isLoading}
              />
            </div>
            <div class="form-group">
              <label for="token">{t.accessToken}</label>
              <input
                id="token"
                type="text"
                bind:value={token}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
                style="font-family: var(--font-mono);"
              />
            </div>
            {#if $connection.error}
              <div class="error">{$connection.error}</div>
            {/if}
            <button
              class="btn btn-primary"
              onclick={handleLocalConnect}
              disabled={isLoading || !url || !token}
            >
              {#if isLoading}<span class="spinner"></span>{/if}
              {isLoading ? t.connecting : t.connect}
            </button>
          </div>

        {:else if mode === 'forge'}
          <p class="hint">{t.forgeHint}</p>
          <div class="form-area">
            <div class="form-group">
              <label for="relay-code">{t.relayCode}</label>
              <input
                id="relay-code"
                type="text"
                bind:value={relayCode}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
                style="font-family: var(--font-mono);"
              />
            </div>
            <div class="form-group">
              <label for="relay-token">{t.relayToken}</label>
              <input
                id="relay-token"
                type="text"
                bind:value={relayToken}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                disabled={isLoading}
                style="font-family: var(--font-mono);"
              />
            </div>
            {#if $connection.error}
              <div class="error">{$connection.error}</div>
            {/if}
            <button
              class="btn btn-primary"
              onclick={handleRelayConnect}
              disabled={isLoading || !relayCode || !relayToken}
            >
              {#if isLoading}<span class="spinner"></span>{/if}
              {isLoading ? t.connecting : t.relayConnect}
            </button>
          </div>

        {:else if mode === 'import'}
          <p class="hint">{t.importHint}</p>
          <div class="form-area">
            <div class="form-group">
              <label for="json-text">{t.importJson}</label>
              <textarea
                id="json-text"
                bind:value={jsonText}
                placeholder={t.importJsonPlaceholder}
                rows="6"
                style="font-family: var(--font-mono); font-size: 0.8rem; resize: vertical;"
              ></textarea>
            </div>
            <label class="btn btn-secondary" style="cursor: pointer; margin-bottom: var(--space-md); display: inline-flex;">
              {t.importFileBtn}
              <input type="file" accept=".json" onchange={handleFileUpload} style="display: none;" />
            </label>
            {#if jsonError}
              <div class="error">{jsonError}</div>
            {/if}
            <button
              class="btn btn-primary"
              onclick={handleImport}
              disabled={!jsonText.trim()}
            >
              {t.importBtn}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </section>

</div>

<style>
  .landing {
    display: flex;
    flex-direction: column;
  }

  /* Inner content wrapper — centered with max-width */
  .inner {
    width: 100%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  /* Hero */
  .hero {
    text-align: center;
    padding: 4rem var(--space-lg);
    background: linear-gradient(
      180deg,
      var(--color-bg-secondary) 0%,
      var(--color-bg) 100%
    );
    border-bottom: 1px solid var(--color-border);
  }

  .hero-title {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 2.8rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    margin-bottom: var(--space-lg);
    color: var(--color-text);
  }

  .hero-dot {
    color: var(--color-primary);
  }

  .hero-desc {
    color: var(--color-text-muted);
    font-size: 1.1rem;
    margin-bottom: var(--space-xl);
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
  }

  /* Connect section */
  .connect-section {
    padding: 3rem var(--space-lg);
  }

  .connect-section h2 {
    margin-bottom: var(--space-xl);
    font-size: 1.4rem;
    color: var(--color-text-soft);
  }

  /* Benefits section */
  .benefits-section {
    padding: 3rem var(--space-lg);
    border-top: 1px solid var(--color-border);
  }

  .benefits-section h2 {
    margin-bottom: var(--space-xl);
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-md);
  }

  .benefit-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-xl) var(--space-lg);
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
  }

  .benefit-card strong {
    font-size: 1.05rem;
    color: var(--color-text);
  }

  .benefit-card p {
    font-size: 0.9rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  /* Systems section */
  .systems-section {
    padding: 3rem var(--space-lg);
    border-top: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
  }

  .systems-section h2 {
    margin-bottom: var(--space-sm);
  }

  .systems-subtitle {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    margin-bottom: var(--space-xl);
  }

  .systems-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-sm);
    margin-bottom: var(--space-lg);
  }

  .system-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-lg);
    background: var(--color-bg);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-primary);
  }

  .system-card strong {
    font-size: 0.95rem;
  }

  .system-card span {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  .systems-cta {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    font-size: 0.9rem;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  .cta-link {
    color: var(--color-primary);
    font-weight: 600;
    text-decoration: none;
  }

  .cta-link:hover {
    text-decoration: underline;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid var(--color-border);
    margin-bottom: var(--space-xl);
  }

  .tab {
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    padding: var(--space-sm) var(--space-lg);
    font-size: 0.95rem;
    font-weight: 500;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }

  .tab:hover {
    color: var(--color-text);
  }

  .tab.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  /* Tab panel */
  .tab-panel {
    max-width: 760px;
  }

  .form-area {
    max-width: 480px;
  }

  .hint {
    color: var(--color-text-muted);
    margin-bottom: var(--space-lg);
    font-size: 0.9rem;
    line-height: 1.6;
    padding: var(--space-md) var(--space-lg);
    background: var(--color-bg-card);
    border-radius: var(--radius-md);
    border-left: 3px solid var(--color-primary);
  }

  .error {
    color: var(--color-error, #c0392b);
    background: rgba(168, 64, 50, 0.08);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
    font-size: 0.9rem;
  }

  @media (min-width: 640px) {
    .hero-title { font-size: 3.5rem; }
    .hero-desc { font-size: 1.15rem; }
    .benefits-grid { grid-template-columns: 1fr 1fr; }
    .systems-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (min-width: 900px) {
    .benefits-grid { grid-template-columns: repeat(4, 1fr); }
    .systems-grid { grid-template-columns: repeat(3, 1fr); }
  }

  @media (min-width: 1024px) {
    .hero { padding: 5rem var(--space-lg); }
    .benefits-section { padding: 4rem var(--space-lg); }
    .systems-section { padding: 4rem var(--space-lg); }
    .connect-section { padding: 4rem var(--space-lg); }
  }
</style>
