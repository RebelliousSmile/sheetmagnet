/**
 * Sheet Magnet Connector — Foundry VTT Module
 *
 * Uses Foundry's native socket system (game.socket) for communication.
 * This is the only cross-version (v10-v13) stable API for modules.
 *
 * Protocol:
 *   PWA connects via WebSocket to Foundry's socket server.
 *   Messages use: game.socket.emit('module.sheet-magnet-connector', payload)
 *   Responses sent back via the same socket channel.
 *
 * For the PWA to connect, it needs the Foundry URL (to open a socket)
 * and a session token (generated here, shown via QR/dialog).
 */

const MODULE_ID = 'sheet-magnet-connector';
const SOCKET_KEY = `module.${MODULE_ID}`;

class SheetMagnetAPI {
  constructor() {
    this.token = this.generateToken();
  }

  generateToken() {
    return crypto.randomUUID();
  }

  refreshToken() {
    this.token = this.generateToken();
    ui.notifications.info('Sheet Magnet: New token generated');
    return this.token;
  }

  validateToken(token) {
    return typeof token === 'string' && token === this.token;
  }

  // ── Handlers ─────────────────────────────────────────────────────

  handleInfo() {
    return {
      module: MODULE_ID,
      version: game.modules.get(MODULE_ID)?.version ?? '1.0.0',
      foundry: game.version,
      system: {
        id: game.system.id,
        title: game.system.title,
        version: game.system.version,
      },
      world: game.world.id,
    };
  }

  handleActorsList() {
    const actors = game.actors.map((actor) => ({
      id: actor.id,
      name: actor.name,
      type: actor.type,
      img: actor.img,
      hasPlayerOwner: actor.hasPlayerOwner,
    }));
    return { count: actors.length, actors };
  }

  handleActorDetail(actorId) {
    const actor = game.actors.get(actorId);
    if (!actor) return { error: 'Actor not found' };

    const data = actor.toObject();
    return {
      id: actor.id,
      name: actor.name,
      type: actor.type,
      img: actor.img,
      system: data.system,
      items: data.items,
      effects: data.effects,
      flags: data.flags,
      prototypeToken: data.prototypeToken,
      _meta: {
        systemId: game.system.id,
        systemVersion: game.system.version,
        foundryVersion: game.version,
        exportedAt: new Date().toISOString(),
      },
    };
  }

  handleActorImage(actorId) {
    const actor = game.actors.get(actorId);
    if (!actor) return { error: 'Actor not found' };
    if (!actor.img || actor.img === 'icons/svg/mystery-man.svg') {
      return { error: 'No custom image' };
    }

    try {
      return {
        url: actor.img,
        absolute: new URL(actor.img, window.location.origin).href,
      };
    } catch {
      return { error: 'Invalid image URL' };
    }
  }

  // ── Socket router ────────────────────────────────────────────────

  handleSocketMessage(payload) {
    // Validate token (except for 'info' which is public)
    if (payload.action !== 'info' && !this.validateToken(payload.token)) {
      return { error: 'Invalid or missing token', code: 'UNAUTHORIZED' };
    }

    switch (payload.action) {
      case 'info':
        return this.handleInfo();
      case 'actors':
        return this.handleActorsList();
      case 'actor':
        return this.handleActorDetail(payload.actorId);
      case 'actorImage':
        return this.handleActorImage(payload.actorId);
      default:
        return { error: `Unknown action: ${payload.action}` };
    }
  }
}

// ── Module initialization ────────────────────────────────────────────────────

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing`);
});

Hooks.once('ready', () => {
  const api = new SheetMagnetAPI();
  game.modules.get(MODULE_ID).api = api;

  // Register socket listener — responds to PWA requests
  game.socket.on(SOCKET_KEY, (payload, senderId) => {
    // Only the GM processes requests (avoids duplicate responses)
    if (!game.user.isGM) return;

    const response = api.handleSocketMessage(payload);
    // Send response back via socket
    game.socket.emit(SOCKET_KEY, {
      responseId: payload.requestId,
      ...response,
    });
  });

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.hostname;
  const port = window.location.port;
  const connectionUrl = port ? `${protocol}//${host}:${port}` : `${protocol}//${host}`;

  console.log(`${MODULE_ID} | Socket: ${SOCKET_KEY}`);
  console.log(`${MODULE_ID} | Token: ${api.token}`);

  // Add button to Actors Directory (supports Foundry v10-v14)
  const injectButton = (html) => {
    const root = html instanceof HTMLElement ? html : html[0];
    if (!root) return;
    // Avoid duplicate buttons
    if (root.querySelector('.sheet-magnet-connect')) return;

    const button = document.createElement('button');
    button.className = 'sheet-magnet-connect';
    button.title = 'Sheet Magnet';
    button.innerHTML = '<i class="fas fa-qrcode"></i> Sheet Magnet';
    button.addEventListener('click', () => {
      new SheetMagnetConnectionDialog(api, connectionUrl).render(true);
    });

    // v14: header-actions, v10-v13: .directory-header .action-buttons
    const target =
      root.querySelector('.directory-header .action-buttons') ||
      root.querySelector('.header-actions') ||
      root.querySelector('.action-buttons') ||
      root.querySelector('header');

    if (target) {
      target.appendChild(button);
    } else {
      console.warn(`${MODULE_ID} | Could not find action-buttons container`);
    }
  };

  // Hook pour les re-renders futurs
  Hooks.on('renderActorDirectory', (app, html) => injectButton(html));

  // Injection immédiate si le panneau est déjà rendu (Foundry v14)
  if (ui.actors?.element) {
    injectButton(ui.actors.element);
  }
});

class SheetMagnetConnectionDialog extends Application {
  constructor(api, connectionUrl) {
    super();
    this.api = api;
    this.connectionUrl = connectionUrl;
  }

  static get defaultOptions() {
    return Object.assign({}, super.defaultOptions, {
      id: 'sheet-magnet-connection',
      title: 'Sheet Magnet Connection',
      template: `modules/${MODULE_ID}/templates/connection-dialog.html`,
      width: 400,
      height: 'auto',
    });
  }

  getData() {
    const connectData = {
      url: this.connectionUrl,
      token: this.api.token,
      socketKey: SOCKET_KEY,
    };
    const encoded = btoa(JSON.stringify(connectData));
    const deepLink = `https://sheet-magnet.app/connect?data=${encoded}`;

    return {
      connectionUrl: this.connectionUrl,
      token: this.api.token,
      deepLink,
      qrData: deepLink,
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.copy-token').on('click', async () => {
      await navigator.clipboard.writeText(this.api.token);
      ui.notifications.info('Token copied');
    });

    html.find('.refresh-token').on('click', () => {
      this.api.refreshToken();
      this.render(true);
    });

    html.find('.copy-url').on('click', async () => {
      await navigator.clipboard.writeText(this.connectionUrl);
      ui.notifications.info('URL copied');
    });
  }
}
