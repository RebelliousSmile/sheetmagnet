<script lang="ts">
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { onMount } from 'svelte';
import { t } from '$lib/i18n';
import { isConnected, selectedActors, disconnect } from '$lib/stores/session';
import { getTemplate } from '$lib/templates';
import { exportAndDownload } from '$lib/export';

let templateId = $derived($page.url.searchParams.get('template') || 'pdf-a4');
let isExporting = $state(false);
let exportComplete = $state(false);
let exportError = $state<string | null>(null);

onMount(() => {
  if (!$isConnected || $selectedActors.length === 0) {
    goto('/');
  }
});

async function handleDownload(format: 'pdf' | 'png') {
  const template = getTemplate(templateId);
  if (!template) {
    exportError = 'Template not found';
    return;
  }

  isExporting = true;
  exportError = null;

  try {
    // Export each selected actor
    for (const actor of $selectedActors) {
      await exportAndDownload(actor, {
        templateId,
        format,
      });
    }

    exportComplete = true;
  } catch (e) {
    console.error('Export failed:', e);
    exportError = e instanceof Error ? e.message : 'Export failed';
  } finally {
    isExporting = false;
  }
}

function handlePrint() {
  // TODO: Integrate Printful API
  alert('Print integration coming soon!');
}

function handleNewExport() {
  exportComplete = false;
  exportError = null;
  goto('/select');
}

function handleDisconnect() {
  disconnect();
  goto('/');
}

// Determine available formats from template
let availableFormats = $derived(() => {
  const template = getTemplate(templateId);
  return template?.meta.exports || ['pdf', 'png'];
});
</script>

<div class="page-header">
  <h1>{$t.export.title}</h1>
  <p>{$selectedActors.length} character(s) • {templateId.toUpperCase().replace('-', ' ')}</p>
</div>

{#if exportComplete}
  <div class="card success-card">
    <div class="success-icon">✓</div>
    <h2>{$t.export.complete}</h2>
    <p>{$t.export.downloaded}</p>
  </div>

  <div class="action-buttons">
    <button class="btn btn-secondary btn-block" onclick={handleNewExport}>
      {$t.export.exportMore}
    </button>
    <button class="btn btn-secondary btn-block" onclick={handleDisconnect}>
      {$t.export.disconnect}
    </button>
  </div>
{:else}
  <div class="export-options">
    <h2>{$t.export.download}</h2>

    {#if exportError}
      <div class="error" style="margin-bottom: var(--space-md);">
        {exportError}
      </div>
    {/if}

    {#if availableFormats().includes('pdf')}
      <button
        class="export-option"
        onclick={() => handleDownload('pdf')}
        disabled={isExporting}
      >
        <span class="export-icon">📄</span>
        <div class="export-info">
          <span class="export-name">
            {#if isExporting}
              {$t.export.generatingPdf}
            {:else}
              {$t.export.downloadPdf}
            {/if}
          </span>
          <span class="export-desc">{$t.export.pdfDesc}</span>
        </div>
        {#if isExporting}
          <span class="spinner"></span>
        {/if}
      </button>
    {/if}

    {#if availableFormats().includes('png')}
      <button
        class="export-option"
        onclick={() => handleDownload('png')}
        disabled={isExporting}
      >
        <span class="export-icon">🖼️</span>
        <div class="export-info">
          <span class="export-name">
            {#if isExporting}
              {$t.export.generatingPng}
            {:else}
              {$t.export.downloadPng}
            {/if}
          </span>
          <span class="export-desc">{$t.export.pngDesc}</span>
        </div>
        {#if isExporting}
          <span class="spinner"></span>
        {/if}
      </button>
    {/if}

    <h2 style="margin-top: var(--space-xl);">{$t.export.printServices}</h2>
    <p style="color: var(--color-text-muted); font-size: 0.875rem; margin-bottom: var(--space-md);">
      {$t.export.printHint}
    </p>

    <button class="export-option" onclick={handlePrint}>
      <span class="export-icon">🖨️</span>
      <div class="export-info">
        <span class="export-name">{$t.export.printful}</span>
        <span class="export-desc">{$t.export.printfulDesc}</span>
      </div>
      <span class="coming-soon">{$t.export.soon}</span>
    </button>

    <button class="export-option disabled" disabled>
      <span class="export-icon">✏️</span>
      <div class="export-info">
        <span class="export-name">{$t.export.pencilWrap}</span>
        <span class="export-desc">{$t.export.pencilWrapDesc}</span>
      </div>
      <span class="coming-soon">{$t.export.soon}</span>
    </button>
  </div>

  <div class="spacer"></div>

  <button class="btn btn-secondary btn-block" onclick={() => goto('/preview?template=' + templateId)}>
    {$t.export.backToPreview}
  </button>
{/if}

<style>
  .success-card {
    text-align: center;
    padding: var(--space-xl);
  }
  
  .success-icon {
    width: 64px;
    height: 64px;
    background-color: var(--color-success);
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto var(--space-lg);
  }
  
  .success-card h2 {
    margin-bottom: var(--space-sm);
  }
  
  .success-card p {
    color: var(--color-text-muted);
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }
  
  .export-options h2 {
    font-size: 1rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
  }
  
  .export-option {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    width: 100%;
    padding: var(--space-md);
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
    margin-bottom: var(--space-sm);
  }
  
  .export-option:hover:not(:disabled) {
    background-color: var(--color-bg-card);
    border-color: var(--color-primary);
  }
  
  .export-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .export-icon {
    font-size: 1.5rem;
  }
  
  .export-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .export-name {
    font-weight: 500;
    color: var(--color-text);
  }
  
  .export-desc {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }
  
  .coming-soon {
    font-size: 0.75rem;
    padding: var(--space-xs) var(--space-sm);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
  }
</style>
