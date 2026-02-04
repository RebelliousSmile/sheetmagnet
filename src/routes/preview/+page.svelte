<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import { 
    isConnected, 
    selectedActorIds,
    selectedActors,
    fetchActorDetails
  } from '$lib/stores/session';
  import { getTemplate, resolve } from '$lib/templates';
  import { KonvaRenderer } from '$lib/export/konva-renderer';

  let templateId = $derived($page.url.searchParams.get('template') || 'pdf-a4');
  let isLoading = $state(true);
  let currentActorIndex = $state(0);
  let previewContainer: HTMLDivElement;
  let renderer: KonvaRenderer | null = null;

  onMount(async () => {
    // Redirect if not connected or no actors selected
    if (!$isConnected || $selectedActorIds.size === 0) {
      goto('/');
      return;
    }

    // Fetch full data for all selected actors
    const ids = Array.from($selectedActorIds);
    await Promise.all(ids.map(id => fetchActorDetails(id)));
    isLoading = false;
  });

  onDestroy(() => {
    if (renderer) {
      renderer.destroy();
    }
  });

  // Render preview when actor or template changes
  $effect(() => {
    if (!isLoading && currentActor && previewContainer) {
      renderPreview();
    }
  });

  async function renderPreview() {
    if (!currentActor || !previewContainer) return;

    // Clean up previous renderer
    if (renderer) {
      renderer.destroy();
      previewContainer.innerHTML = '';
    }

    const template = getTemplate(templateId);
    if (!template) {
      console.error('Template not found:', templateId);
      return;
    }

    try {
      const layout = resolve(template, { actor: currentActor });
      renderer = new KonvaRenderer(layout, 72); // 72 dpi for preview
      await renderer.render(previewContainer);
    } catch (e) {
      console.error('Preview render failed:', e);
    }
  }

  function handleBack() {
    goto('/template');
  }

  function handleExport() {
    goto(`/export?template=${templateId}`);
  }

  function prevActor() {
    if (currentActorIndex > 0) {
      currentActorIndex--;
    }
  }

  function nextActor() {
    if (currentActorIndex < $selectedActors.length - 1) {
      currentActorIndex++;
    }
  }

  let currentActor = $derived($selectedActors[currentActorIndex]);
</script>

<div class="page-header">
  <h1>Preview</h1>
  <p>{templateId.toUpperCase().replace('-', ' ')}</p>
</div>

<div class="steps">
  <span class="step"></span>
  <span class="step"></span>
  <span class="step"></span>
  <span class="step active"></span>
</div>

{#if isLoading}
  <div style="display: flex; justify-content: center; padding: var(--space-xl);">
    <span class="spinner"></span>
  </div>
{:else if currentActor}
  <!-- Actor navigation if multiple -->
  {#if $selectedActors.length > 1}
    <div class="actor-nav">
      <button 
        class="btn btn-secondary" 
        onclick={prevActor}
        disabled={currentActorIndex === 0}
      >
        ←
      </button>
      <span>{currentActor.name} ({currentActorIndex + 1}/{$selectedActors.length})</span>
      <button 
        class="btn btn-secondary" 
        onclick={nextActor}
        disabled={currentActorIndex === $selectedActors.length - 1}
      >
        →
      </button>
    </div>
  {/if}

  <!-- Preview canvas -->
  <div class="preview-container">
    <div class="preview-canvas" bind:this={previewContainer}>
      <!-- Konva renders here -->
    </div>
  </div>

  <div class="spacer"></div>

  <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
    <button class="btn btn-secondary" onclick={handleBack}>
      Back
    </button>
    <button 
      class="btn btn-primary" 
      style="flex: 1;"
      onclick={handleExport}
    >
      Export
    </button>
  </div>
{:else}
  <div class="card" style="text-align: center;">
    <p>No character data available</p>
  </div>
{/if}

<style>
  .actor-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
    padding: var(--space-sm);
    background-color: var(--color-bg-secondary);
    border-radius: var(--radius-md);
  }
  
  .preview-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: var(--space-md);
    overflow: auto;
  }
  
  .preview-canvas {
    background-color: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }
</style>
