<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import jsQR from 'jsqr';
  import Nav from '$lib/components/Nav.svelte';
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

<Nav />

<div id="top" class="landing">

  <!-- Hero -->
  <section class="hero">
    <h1>🧲 Sheet Magnet</h1>
    <p class="hero-subtitle">Export your TTRPG character sheets to anything — PDF, images, and more.</p>
    <a href="#connect" class="btn btn-primary">Get Started</a>
  </section>

  <!-- Features -->
  <section id="features" class="landing-section">
    <h2>Features</h2>
    <div class="features-grid">
      <div class="feature-card">
        <span class="feature-icon">📡</span>
        <h3>Easy Connection</h3>
        <p>Connect to your Foundry VTT server by entering the URL and access token, or simply scan a QR code.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📄</span>
        <h3>Multiple Formats</h3>
        <p>Export to PDF (A3, A4, A5, A6) or image formats like poker cards — choose what suits your game.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">🎲</span>
        <h3>Any Game System</h3>
        <p>Works with any Foundry VTT game system. Select one or more characters and export them in seconds.</p>
      </div>
      <div class="feature-card">
        <span class="feature-icon">📱</span>
        <h3>Mobile Friendly</h3>
        <p>Designed mobile-first so you can export character sheets directly from your phone or tablet.</p>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section id="faq" class="landing-section">
    <h2>FAQ</h2>
    <div class="faq-list">
      <details class="faq-item">
        <summary>What is Sheet Magnet?</summary>
        <p>Sheet Magnet is a companion web app for Foundry VTT that lets you export character sheets to PDF, images, and other formats directly from your browser or mobile device.</p>
      </details>
      <details class="faq-item">
        <summary>How do I connect to Foundry?</summary>
        <p>Open Foundry VTT and click the Sheet Magnet button. You will get a URL and an access token. Enter these below, or scan the QR code displayed in Foundry to connect automatically.</p>
      </details>
      <details class="faq-item">
        <summary>Which export formats are supported?</summary>
        <p>Sheet Magnet currently supports PDF (A3, A4, A5, A6) and PNG (poker card). More formats will be added in future updates.</p>
      </details>
      <details class="faq-item">
        <summary>Do I need to install anything?</summary>
        <p>You only need the Sheet Magnet Foundry module installed in your Foundry VTT server. The web app runs entirely in your browser with no installation required.</p>
      </details>
    </div>
  </section>

  <!-- Content / About -->
  <section id="content" class="landing-section">
    <h2>About Sheet Magnet</h2>
    <div class="card about-card">
      <p>Sheet Magnet bridges the gap between Foundry VTT and the physical table. Whether you want a printed PDF to hand out to your players, a card-sized character reference, or a digital image to share online, Sheet Magnet makes it effortless.</p>
      <p style="margin-top: var(--space-md);">Built with ❤️ for the tabletop RPG community. Sheet Magnet is open source and constantly improving thanks to community feedback.</p>
    </div>
  </section>

  <!-- Connect -->
  <section id="connect" class="landing-section">
    <h2>Connect to Foundry</h2>

    <div class="steps">
      <span class="step active"></span>
      <span class="step"></span>
      <span class="step"></span>
      <span class="step"></span>
    </div>

    <div class="card">
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
      <h3 style="margin-bottom: var(--space-md);">Scan QR Code</h3>
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

  /* Features */
  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .feature-card {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .feature-icon {
    font-size: 1.75rem;
  }

  .feature-card h3 {
    font-size: 1rem;
  }

  .feature-card p {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.5;
  }

  /* FAQ */
  .faq-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .faq-item {
    background-color: var(--color-bg-card);
    border-radius: var(--radius-md);
    padding: var(--space-md);
  }

  .faq-item summary {
    font-weight: 600;
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
  }

  .faq-item summary::after {
    content: '▸';
    font-size: 0.875rem;
    color: var(--color-text-muted);
    transition: transform 0.2s ease;
  }

  .faq-item[open] summary::after {
    transform: rotate(90deg);
  }

  .faq-item p {
    margin-top: var(--space-md);
    color: var(--color-text-muted);
    font-size: 0.9rem;
    line-height: 1.6;
  }

  /* About */
  .about-card p {
    color: var(--color-text-muted);
    line-height: 1.7;
  }

  @media (min-width: 640px) {
    .hero h1 {
      font-size: 2.5rem;
    }

    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .landing-section {
      padding: var(--space-xl);
    }
  }
</style>
