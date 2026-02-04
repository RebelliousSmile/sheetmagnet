<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { 
    connection,
    isConnected,
    actorsList,
    selectedActorIds,
    fetchActors,
    toggleActorSelection,
    disconnect
  } from '$lib/stores/session';

  let isLoading = $state(true);

  onMount(async () => {
    // Redirect if not connected
    if (!$isConnected) {
      goto('/');
      return;
    }
    
    await fetchActors();
    isLoading = false;
  });

  function handleActorClick(actorId: string) {
    toggleActorSelection(actorId);
  }

  function handleContinue() {
    if ($selectedActorIds.size > 0) {
      goto('/template');
    }
  }

  function handleDisconnect() {
    disconnect();
    goto('/');
  }

  function isSelected(actorId: string): boolean {
    return $selectedActorIds.has(actorId);
  }
</script>

<div class="page-header">
  <h1>Select Characters</h1>
  {#if $connection.serverInfo}
    <p>
      <span class="status status-success">
        <span class="status-dot"></span>
        {$connection.serverInfo.system.title}
      </span>
    </p>
  {/if}
</div>

<div class="steps">
  <span class="step"></span>
  <span class="step active"></span>
  <span class="step"></span>
  <span class="step"></span>
</div>

{#if isLoading}
  <div style="display: flex; justify-content: center; padding: var(--space-xl);">
    <span class="spinner"></span>
  </div>
{:else if $actorsList.length === 0}
  <div class="card" style="text-align: center;">
    <p>No characters found in this world.</p>
    <button class="btn btn-secondary" onclick={handleDisconnect} style="margin-top: var(--space-md);">
      Disconnect
    </button>
  </div>
{:else}
  <ul class="list">
    {#each $actorsList as actor (actor.id)}
      <li 
        class="list-item"
        class:selected={isSelected(actor.id)}
        onclick={() => handleActorClick(actor.id)}
        role="button"
        tabindex="0"
        onkeypress={(e) => e.key === 'Enter' && handleActorClick(actor.id)}
      >
        <img 
          class="avatar" 
          src={actor.img || '/placeholder-avatar.png'} 
          alt={actor.name}
          onerror={(e) => (e.currentTarget.src = '/placeholder-avatar.png')}
        />
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {actor.name}
          </div>
          <div style="font-size: 0.875rem; color: var(--color-text-muted);">
            {actor.type}
          </div>
        </div>
        <div class="checkbox" class:checked={isSelected(actor.id)}>
          {#if isSelected(actor.id)}
            ✓
          {/if}
        </div>
      </li>
    {/each}
  </ul>

  <div class="spacer"></div>

  <div style="display: flex; gap: var(--space-md); margin-top: var(--space-lg);">
    <button class="btn btn-secondary" onclick={handleDisconnect}>
      Disconnect
    </button>
    <button 
      class="btn btn-primary" 
      style="flex: 1;"
      onclick={handleContinue}
      disabled={$selectedActorIds.size === 0}
    >
      Continue ({$selectedActorIds.size})
    </button>
  </div>
{/if}

<style>
  .checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-border);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    color: var(--color-primary);
    transition: all 0.15s ease;
  }
  
  .checkbox.checked {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
  }
</style>
