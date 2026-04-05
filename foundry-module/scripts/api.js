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
    if (typeof token !== 'string' || token.length !== this.token.length) {
      return false;
    }
    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ this.token.charCodeAt(i);
    }
    return result === 0;
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
      const parsed = new URL(actor.img, window.location.origin);
      // Only allow http(s) protocols — block javascript:, data:, file:, etc.
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { error: 'Invalid image URL protocol' };
      }
      return {
        url: actor.img,
        absolute: parsed.href,
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

  const host = window.location.hostname;
  const port = window.location.port || '30000';
  const connectionUrl = `ws://${host}:${port}`;

  console.log(`${MODULE_ID} | Socket: ${SOCKET_KEY}`);
  console.log(`${MODULE_ID} | Token: ${api.token}`);

  // Add button to Actors Directory
  Hooks.on('renderActorDirectory', (app, html) => {
    const button = $(`<button class="sheet-magnet-connect" title="Sheet Magnet">
      <i class="fas fa-qrcode"></i> Sheet Magnet
    </button>`);

    button.on('click', () => {
      new SheetMagnetConnectionDialog(api, connectionUrl).render(true);
    });

    html.find('.directory-header .action-buttons').append(button);
  });
});

class SheetMagnetConnectionDialog extends Application {
  constructor(api, connectionUrl) {
    super();
    this.api = api;
    this.connectionUrl = connectionUrl;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
