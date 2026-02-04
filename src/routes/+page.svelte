<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { 
    connection, 
    connect, 
    connectFromEncoded,
    isConnected 
  } from '$lib/stores/session';

  let url = $state('');
  let token = $state('');
  let isLoading = $state(false);

  // Check for encoded data in URL (from QR code deep link)
  onMount(() => {
    const params = $page.url.searchParams;
    const encodedData = params.get('data');
    
    if (encodedData) {
      handleEncodedConnect(encodedData);
    }
  });

  async function handleEncodedConnect(encoded: string) {
    isLoading = true;
    const success = await connectFromEncoded(encoded);
    isLoading = false;
    
    if (success) {
      goto('/select');
    }
  }

  async function handleManualConnect() {
    if (!url || !token) return;
    
    isLoading = true;
    const success = await connect(url, token);
    isLoading = false;
    
    if (success) {
      goto('/select');
    }
  }

  // Redirect if already connected
  $effect(() => {
    if ($isConnected) {
      goto('/select');
    }
  });
</script>

<div class="page-header">
  <h1>Sheet Magnet</h1>
  <p>Export your character sheets to anything</p>
</div>

<div class="steps">
  <span class="step active"></span>
  <span class="step"></span>
  <span class="step"></span>
  <span class="step"></span>
</div>

<div class="card">
  <h2>Connect to Foundry</h2>
  <p style="color: var(--color-text-muted); margin-bottom: var(--space-lg);">
    Open Foundry VTT and click the Sheet Magnet button to get your connection details.
  </p>

  <div class="form-group">
    <label for="url">Foundry URL</label>
    <input 
      id="url"
      type="url" 
      bind:value={url}
      placeholder="http://192.168.1.100:30000"
      disabled={isLoading}
    />
  </div>

  <div class="form-group">
    <label for="token">Access Token</label>
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
    <div class="error" style="margin-bottom: var(--space-md);">
      {$connection.error}
    </div>
  {/if}

  <button 
    class="btn btn-primary btn-block"
    onclick={handleManualConnect}
    disabled={isLoading || !url || !token}
  >
    {#if isLoading}
      <span class="spinner"></span>
      Connecting...
    {:else}
      Connect
    {/if}
  </button>
</div>

<div style="text-align: center; margin-top: var(--space-xl); color: var(--color-text-muted);">
  <p style="font-size: 0.875rem;">
    Scan the QR code in Foundry to connect automatically
  </p>
</div>
