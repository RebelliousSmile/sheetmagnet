<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';
  import { 
    connection, 
    connect, 
    connectFromEncoded,
    isConnected 
  } from '$lib/stores/session';

  let url = $state('');
  let token = $state('');
  let isLoading = $state(false);
  let isScanning = $state(false);
  let scanError = $state('');

  let videoEl: HTMLVideoElement = $state()!;
  let canvasEl: HTMLCanvasElement = $state()!;
  let stream: MediaStream | null = null;
  let animationId: number | null = null;

  // Check for encoded data in URL (from QR code deep link)
  onMount(() => {
    const params = $page.url.searchParams;
    const encodedData = params.get('data');
    
    if (encodedData) {
      handleEncodedConnect(encodedData);
    }
  });

  onDestroy(() => {
    stopScanner();
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

  async function startScanner() {
    scanError = '';
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      isScanning = true;
      // Wait for the video element to be in the DOM
      await new Promise(resolve => setTimeout(resolve, 50));
      videoEl.srcObject = stream;
      await videoEl.play();
      scanFrame();
    } catch {
      scanError = 'Camera access denied or not available.';
    }
  }

  function stopScanner() {
    isScanning = false;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function scanFrame() {
    if (!isScanning || !videoEl || videoEl.readyState < videoEl.HAVE_ENOUGH_DATA) {
      animationId = requestAnimationFrame(scanFrame);
      return;
    }
    const ctx = canvasEl.getContext('2d')!;
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      handleQRResult(code.data);
      return;
    }
    animationId = requestAnimationFrame(scanFrame);
  }

  function handleQRResult(data: string) {
    stopScanner();
    try {
      const urlObj = new URL(data);
      const encoded = urlObj.searchParams.get('data');
      if (encoded) {
        handleEncodedConnect(encoded);
        return;
      }
    } catch {
      // not a URL
    }
    scanError = 'Invalid QR code. Please scan the Sheet Magnet QR code from Foundry.';
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

<div class="card" style="margin-top: var(--space-xl);">
  <h2 style="margin-bottom: var(--space-md);">Scan QR Code</h2>
  <p style="color: var(--color-text-muted); margin-bottom: var(--space-md);">
    Use your camera to scan the QR code displayed in Foundry to connect automatically.
  </p>

  {#if !isScanning}
    <button
      class="btn btn-secondary btn-block"
      onclick={startScanner}
      disabled={isLoading}
    >
      📷 Scan QR Code
    </button>
  {:else}
    <div style="position: relative; width: 100%; border-radius: var(--radius-md); overflow: hidden; background: #000;">
      <video
        bind:this={videoEl}
        playsinline
        muted
        style="width: 100%; display: block;"
      ></video>
      <canvas bind:this={canvasEl} style="display: none;"></canvas>
      <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
        <div style="width: 60%; aspect-ratio: 1; border: 3px solid var(--color-primary); border-radius: var(--radius-md); opacity: 0.8;"></div>
      </div>
    </div>
    <button
      class="btn btn-secondary btn-block"
      onclick={stopScanner}
      style="margin-top: var(--space-md);"
    >
      Cancel
    </button>
  {/if}

  {#if scanError}
    <div class="error" style="margin-top: var(--space-md);">
      {scanError}
    </div>
  {/if}
</div>
