<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';
  import Nav from '$lib/components/Nav.svelte';
  import { lang } from '$lib/stores/lang';
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

  const t = $derived($lang === 'fr' ? {
    heroSubtitle: 'Exportez vos feuilles de personnage TTRPG vers n\'importe quoi — PDF, images et plus encore.',
    getStarted: 'Commencer',
    connectTitle: 'Connexion à Foundry',
    connectHint: 'Ouvrez Foundry VTT et cliquez sur le bouton Sheet Magnet pour obtenir vos identifiants de connexion.',
    foundryUrl: 'URL Foundry',
    accessToken: 'Jeton d\'accès',
    connect: 'Connecter',
    connecting: 'Connexion…',
    scanTitle: 'Scanner le QR Code',
    scanHint: 'Utilisez votre caméra pour scanner le QR code affiché dans Foundry et vous connecter automatiquement.',
    scan: '📷 Scanner le QR Code',
    cancel: 'Annuler',
    invalidQr: 'QR code invalide. Veuillez scanner le QR code Sheet Magnet depuis Foundry.',
    cameraError: 'Accès à la caméra refusé ou non disponible.'
  } : {
    heroSubtitle: 'Export your TTRPG character sheets to anything — PDF, images, and more.',
    getStarted: 'Get Started',
    connectTitle: 'Connect to Foundry',
    connectHint: 'Open Foundry VTT and click the Sheet Magnet button to get your connection details.',
    foundryUrl: 'Foundry URL',
    accessToken: 'Access Token',
    connect: 'Connect',
    connecting: 'Connecting…',
    scanTitle: 'Scan QR Code',
    scanHint: 'Use your camera to scan the QR code displayed in Foundry to connect automatically.',
    scan: '📷 Scan QR Code',
    cancel: 'Cancel',
    invalidQr: 'Invalid QR code. Please scan the Sheet Magnet QR code from Foundry.',
    cameraError: 'Camera access denied or not available.'
  });

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
      scanError = t.cameraError;
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
    scanError = t.invalidQr;
  }

  // Redirect if already connected
  $effect(() => {
    if ($isConnected) {
      goto('/select');
    }
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

    <div class="steps">
      <span class="step active"></span>
      <span class="step"></span>
      <span class="step"></span>
      <span class="step"></span>
    </div>

    <div class="card">
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-lg);">
        {t.connectHint}
      </p>

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
          {t.connecting}
        {:else}
          {t.connect}
        {/if}
      </button>
    </div>

    <div class="card" style="margin-top: var(--space-xl);">
      <h3 style="margin-bottom: var(--space-md);">{t.scanTitle}</h3>
      <p style="color: var(--color-text-muted); margin-bottom: var(--space-md);">
        {t.scanHint}
      </p>

      {#if !isScanning}
        <button
          class="btn btn-secondary btn-block"
          onclick={startScanner}
          disabled={isLoading}
        >
          {t.scan}
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
          {t.cancel}
        </button>
      {/if}

      {#if scanError}
        <div class="error" style="margin-top: var(--space-md);">
          {scanError}
        </div>
      {/if}
    </div>
  </section>

</div>

<style>
  .landing {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Hero */
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

  /* Sections */
  .landing-section {
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--color-border);
  }

  .landing-section h2 {
    margin-bottom: var(--space-lg);
  }

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .landing-section {
      padding: var(--space-xl);
    }
  }
</style>
