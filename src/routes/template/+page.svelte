<script lang="ts">
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import { connection, isConnected, selectedActorIds } from '$lib/stores/session';
import { listTemplatesForSystem, listTemplates } from '$lib/templates';
// Side-effect import: registers system templates into TEMPLATES registry
import '$lib/templates/systems';

let selectedTemplate = $state<string | null>(null);

const systemId = $derived($connection.serverInfo?.system?.id ?? '');

const templates = $derived(
  systemId ? listTemplatesForSystem(systemId) : listTemplates(),
);

const systemTemplates = $derived(templates.filter((t) => t.meta.systemId));
const genericTemplates = $derived(templates.filter((t) => !t.meta.systemId));

onMount(() => {
  if (!$isConnected || $selectedActorIds.size === 0) {
    goto('/');
  }
});

function handleTemplateClick(templateId: string) {
  selectedTemplate = templateId;
}

function handleContinue() {
  if (selectedTemplate) {
    goto(`/preview?template=${selectedTemplate}`);
  }
}

function handleBack() {
  goto('/select');
}

function formatIcon(template: {
  meta: { exports: string[]; systemId?: string };
}): string {
  if (template.meta.systemId) return '🎲';
  return template.meta.exports.includes('png') ? '🃏' : '📄';
}
</script>

<div class="page-header">
  <h1>Choose Format</h1>
  <p>Select an export format for your {$selectedActorIds.size} character(s)</p>
  {#if systemId}
    <p class="system-badge">{systemId}</p>
  {/if}
</div>

<div class="steps">
  <span class="step"></span>
  <span class="step"></span>
  <span class="step active"></span>
  <span class="step"></span>
</div>

{#if systemTemplates.length > 0}
  <h2 class="section-label">System-specific</h2>
  <div class="template-grid">
    {#each systemTemplates as template (template.meta.id)}
      <button
        class="template-card"
        class:selected={selectedTemplate === template.meta.id}
        onclick={() => handleTemplateClick(template.meta.id)}
      >
        <span class="template-icon">{formatIcon(template)}</span>
        <span class="template-name">{template.meta.name}</span>
        <span class="template-desc">{template.meta.description ?? ''}</span>
      </button>
    {/each}
  </div>
{/if}

{#if genericTemplates.length > 0}
  <h2 class="section-label">Generic formats</h2>
  <div class="template-grid">
    {#each genericTemplates as template (template.meta.id)}
      <button
        class="template-card"
        class:selected={selectedTemplate === template.meta.id}
        onclick={() => handleTemplateClick(template.meta.id)}
      >
        <span class="template-icon">{formatIcon(template)}</span>
        <span class="template-name">{template.meta.name}</span>
        <span class="template-desc">{template.meta.description ?? ''}</span>
      </button>
    {/each}
  </div>
{/if}

<div class="spacer"></div>

<div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
  <button class="btn btn-secondary" onclick={handleBack}>
    Back
  </button>
  <button
    class="btn btn-primary"
    style="flex: 1;"
    onclick={handleContinue}
    disabled={!selectedTemplate}
  >
    Preview
  </button>
</div>

<style>
  .system-badge {
    display: inline-block;
    font-size: 0.75rem;
    padding: 2px 8px;
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-full);
    color: var(--color-text-muted);
  }

  .section-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin: var(--space-lg) 0 var(--space-sm);
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-md);
  }

  .template-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-lg);
    background-color: var(--color-bg-secondary);
    border: 2px solid var(--color-border);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: center;
  }

  .template-card:hover {
    background-color: var(--color-bg-card);
  }

  .template-card.selected {
    border-color: var(--color-primary);
    background-color: var(--color-bg-card);
  }

  .template-icon {
    font-size: 2rem;
  }

  .template-name {
    font-weight: 600;
    color: var(--color-text);
  }

  .template-desc {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  @media (min-width: 768px) {
    .template-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
