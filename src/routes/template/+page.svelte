<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { isConnected, selectedActorIds } from '$lib/stores/session';

  // Template definitions - will be loaded from YAML later
  const templates = [
    { id: 'pdf-a4', name: 'PDF A4', description: 'Standard A4 portrait', icon: '📄', format: 'pdf' },
    { id: 'pdf-a5', name: 'PDF A5', description: 'Compact A5 booklet', icon: '📄', format: 'pdf' },
    { id: 'pdf-a6', name: 'PDF A6', description: 'Pocket size', icon: '📄', format: 'pdf' },
    { id: 'pdf-a3', name: 'PDF A3', description: 'Large poster format', icon: '📄', format: 'pdf' },
    { id: 'png-card', name: 'Poker Card', description: '63×88mm card format', icon: '🃏', format: 'png' },
  ];

  let selectedTemplate = $state<string | null>(null);

  onMount(() => {
    // Redirect if not connected or no actors selected
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
</script>

<div class="page-header">
  <h1>Choose Format</h1>
  <p>Select an export format for your {$selectedActorIds.size} character(s)</p>
</div>

<div class="steps">
  <span class="step"></span>
  <span class="step"></span>
  <span class="step active"></span>
  <span class="step"></span>
</div>

<div class="template-grid">
  {#each templates as template (template.id)}
    <button 
      class="template-card"
      class:selected={selectedTemplate === template.id}
      onclick={() => handleTemplateClick(template.id)}
    >
      <span class="template-icon">{template.icon}</span>
      <span class="template-name">{template.name}</span>
      <span class="template-desc">{template.description}</span>
    </button>
  {/each}
</div>

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
