/**
 * Sheet Magnet Connector - Foundry VTT Module
 */

const MODULE_ID = 'sheet-magnet-connector';
const API_PREFIX = '/api/sheet-magnet';

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

  validateToken(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return false;
    const [scheme, token] = authHeader.split(' ');
    return scheme === 'Bearer' && token === this.token;
  }

  corsHeaders() {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
      'Content-Type': 'application/json'
    };
  }

  jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: this.corsHeaders()
    });
  }

  errorResponse(message, status = 400) {
    return this.jsonResponse({ error: message }, status);
  }

  handleInfo() {
    return this.jsonResponse({
      module: MODULE_ID,
      version: game.modules.get(MODULE_ID)?.version ?? '1.0.0',
      foundry: game.version,
      system: {
        id: game.system.id,
        title: game.system.title,
        version: game.system.version
      },
      world: game.world.id
    });
  }

  handleActorsList(request) {
    if (!this.validateToken(request)) {
      return this.errorResponse('Invalid or missing token', 401);
    }

    const actors = game.actors.map(actor => ({
      id: actor.id,
      name: actor.name,
      type: actor.type,
      img: actor.img,
      hasPlayerOwner: actor.hasPlayerOwner
    }));

    return this.jsonResponse({ count: actors.length, actors });
  }

  handleActorDetail(request, actorId) {
    if (!this.validateToken(request)) {
      return this.errorResponse('Invalid or missing token', 401);
    }

    const actor = game.actors.get(actorId);
    if (!actor) {
      return this.errorResponse('Actor not found', 404);
    }

    const data = actor.toObject();

    return this.jsonResponse({
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
        exportedAt: new Date().toISOString()
      }
    });
  }

  async handleActorImage(request, actorId) {
    if (!this.validateToken(request)) {
      return this.errorResponse('Invalid or missing token', 401);
    }

    const actor = game.actors.get(actorId);
    if (!actor) return this.errorResponse('Actor not found', 404);
    if (!actor.img || actor.img === 'icons/svg/mystery-man.svg') {
      return this.errorResponse('No custom image', 404);
    }

    return this.jsonResponse({
      url: actor.img,
      absolute: new URL(actor.img, window.location.origin).href
    });
  }
}

Hooks.once('init', () => {
  console.log(`${MODULE_ID} | Initializing`);
});

Hooks.once('ready', () => {
  const api = new SheetMagnetAPI();
  game.modules.get(MODULE_ID).api = api;

  const host = window.location.hostname;
  const port = window.location.port || '30000';
  const connectionUrl = `http://${host}:${port}${API_PREFIX}`;
  
  console.log(`${MODULE_ID} | API: ${connectionUrl}`);
  console.log(`${MODULE_ID} | Token: ${api.token}`);

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
      height: 'auto'
    });
  }

  getData() {
    const connectData = { url: this.connectionUrl, token: this.api.token };
    const encoded = btoa(JSON.stringify(connectData));
    const deepLink = `https://sheet-magnet.app/connect?data=${encoded}`;

    return {
      connectionUrl: this.connectionUrl,
      token: this.api.token,
      deepLink,
      qrData: deepLink
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
