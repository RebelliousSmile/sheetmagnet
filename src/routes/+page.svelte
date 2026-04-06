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

// Connection mode: null = choose, 'local' | 'forge' | 'import'
let mode = $state<null | 'local' | 'forge' | 'import'>(null);

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
        heroSubtitle:
          "Exportez vos feuilles de personnage TTRPG vers n'importe quoi — PDF, images et plus encore.",
        getStarted: 'Commencer',
        connectTitle: 'Comment accédez-vous à Foundry VTT ?',
        modeLocal: '🏠 Foundry local',
        modeLocalHint:
          'Foundry installé sur votre réseau local ou un serveur personnel',
        modeForge: '☁️ Forge VTT',
        modeForgeHint: 'Vous jouez sur forge-vtt.com',
        modeImport: '👤 Joueur sans accès MJ',
        modeImportHint:
          "Importez directement le JSON d'un acteur exporté depuis Foundry",
        back: '← Retour',
        localHint:
          'Ouvrez Foundry VTT, cliquez sur le bouton Sheet Magnet et copiez les informations affichées.',
        foundryUrl: 'URL Foundry',
        accessToken: "Jeton d'accès",
        connect: 'Connecter',
        connecting: 'Connexion…',
        forgeHint:
          'Dans Foundry (Forge VTT), cliquez sur Sheet Magnet dans le répertoire d\'acteurs, puis copiez le code de session et le jeton affichés dans la section "Forge VTT".',
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
        heroSubtitle:
          'Export your TTRPG character sheets to anything — PDF, images, and more.',
        getStarted: 'Get Started',
        connectTitle: 'How do you access Foundry VTT?',
        modeLocal: '🏠 Local Foundry',
        modeLocalHint:
          'Foundry installed on your local network or personal server',
        modeForge: '☁️ Forge VTT',
        modeForgeHint: 'You play on forge-vtt.com',
        modeImport: '👤 Player without GM access',
        modeImportHint: 'Import a JSON file exported from Foundry directly',
        back: '← Back',
        localHint:
          'Open Foundry VTT, click the Sheet Magnet button and copy the information shown.',
        foundryUrl: 'Foundry URL',
        accessToken: 'Access Token',
        connect: 'Connect',
        connecting: 'Connecting…',
        forgeHint:
          'In Foundry (Forge VTT), click Sheet Magnet in the Actors Directory, then copy the session code and token shown in the "Forge VTT" section.',
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
    <h1>🧲 Sheet Magnet</h1>
    <p class="hero-subtitle">{t.heroSubtitle}</p>
    <a href="#connect" class="btn btn-primary">{t.getStarted}</a>
  </section>

  <!-- Connect -->
  <section id="connect" class="landing-section">
    <h2>{t.connectTitle}</h2>

    {#if mode === null}
      <!-- Mode selection -->
      <div class="mode-grid">
        <button class="mode-card" onclick={() => (mode = 'local')}>
          <span class="mode-icon">🏠</span>
          <strong>{t.modeLocal}</strong>
          <span class="mode-hint">{t.modeLocalHint}</span>
        </button>
        <button class="mode-card" onclick={() => (mode = 'forge')}>
          <span class="mode-icon">☁️</span>
          <strong>{t.modeForge}</strong>
          <span class="mode-hint">{t.modeForgeHint}</span>
        </button>
        <button class="mode-card" onclick={() => (mode = 'import')}>
          <span class="mode-icon">👤</span>
          <strong>{t.modeImport}</strong>
          <span class="mode-hint">{t.modeImportHint}</span>
        </button>
      </div>

    {:else if mode === 'local'}
      <button class="btn-back" onclick={() => (mode = null)}>{t.back}</button>
      <div class="card">
        <p class="hint">{t.localHint}</p>
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
          class="btn btn-primary btn-block"
          onclick={handleLocalConnect}
          disabled={isLoading || !url || !token}
        >
          {#if isLoading}<span class="spinner"></span>{/if}
          {isLoading ? t.connecting : t.connect}
        </button>
      </div>

    {:else if mode === 'forge'}
      <button class="btn-back" onclick={() => (mode = null)}>{t.back}</button>
      <div class="card">
        <p class="hint">{t.forgeHint}</p>
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
          class="btn btn-primary btn-block"
          onclick={handleRelayConnect}
          disabled={isLoading || !relayCode || !relayToken}
        >
          {#if isLoading}<span class="spinner"></span>{/if}
          {isLoading ? t.connecting : t.relayConnect}
        </button>
      </div>

    {:else if mode === 'import'}
      <button class="btn-back" onclick={() => (mode = null)}>{t.back}</button>
      <div class="card">
        <p class="hint">{t.importHint}</p>
        <div class="form-group">
          <label for="json-text">{t.importJson}</label>
          <textarea
            id="json-text"
            bind:value={jsonText}
            placeholder={t.importJsonPlaceholder}
            rows="8"
            style="font-family: var(--font-mono); font-size: 0.8rem; resize: vertical;"
          ></textarea>
        </div>
        <label class="btn btn-secondary btn-block" style="cursor: pointer; text-align: center; margin-bottom: var(--space-md);">
          {t.importFileBtn}
          <input type="file" accept=".json" onchange={handleFileUpload} style="display: none;" />
        </label>
        {#if jsonError}
          <div class="error">{jsonError}</div>
        {/if}
        <button
          class="btn btn-primary btn-block"
          onclick={handleImport}
          disabled={!jsonText.trim()}
        >
          {t.importBtn}
        </button>
      </div>
    {/if}

  </section>

</div>

<style>
  .landing {
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

  .hero-subtitle {
    color: var(--color-text-muted);
    font-size: 1.1rem;
    margin-bottom: var(--space-xl);
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }

  .landing-section {
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .landing-section h2 {
    margin-bottom: var(--space-lg);
  }

  .mode-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .mode-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
    padding: var(--space-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, box-shadow 0.15s;
    width: 100%;
  }

  .mode-card:hover {
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .mode-icon {
    font-size: 1.5rem;
  }

  .mode-card strong {
    font-size: 1rem;
  }

  .mode-hint {
    font-size: 0.85rem;
    color: var(--color-text-muted);
  }

  .btn-back {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0;
    margin-bottom: var(--space-lg);
  }

  .btn-back:hover {
    color: var(--color-text);
  }

  .hint {
    color: var(--color-text-muted);
    margin-bottom: var(--space-lg);
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .error {
    color: var(--color-error, #c0392b);
    background: var(--color-error-bg, #fdf0ed);
    border: 1px solid currentColor;
    border-radius: var(--radius-sm);
    padding: var(--space-sm) var(--space-md);
    margin-bottom: var(--space-md);
    font-size: 0.9rem;
  }

  @media (min-width: 640px) {
    .hero h1 { font-size: 2.5rem; }
    .landing-section { padding: var(--space-xl); }
    .mode-grid { flex-direction: row; }
    .mode-card { flex: 1; }
  }
</style>
