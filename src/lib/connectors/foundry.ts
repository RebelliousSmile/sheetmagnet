/**
 * Sheet Magnet - Foundry VTT Connector
 *
 * Communicates with Foundry via its native socket.io WebSocket.
 * Falls back to REST for environments where WebSocket isn't available (tests).
 *
 * Protocol:
 *   1. PWA opens a socket.io connection to Foundry's WebSocket server
 *   2. Sends messages on 'module.sheet-magnet-connector' channel
 *   3. Receives responses on the same channel, matched by requestId
 */

// Types
export interface FoundrySystemInfo {
  id: string;
  title: string;
  version: string;
}

export interface FoundryServerInfo {
  module: string;
  version: string;
  foundry: string;
  system: FoundrySystemInfo;
  world: string;
}

export interface ActorSummary {
  id: string;
  name: string;
  type: string;
  img: string;
  hasPlayerOwner: boolean;
}

export interface ActorListResponse {
  count: number;
  actors: ActorSummary[];
}

export interface ActorMeta {
  systemId: string;
  systemVersion: string;
  foundryVersion: string;
  exportedAt: string;
}

export interface ActorData {
  id: string;
  name: string;
  type: string;
  img: string;
  system: Record<string, unknown>;
  items: unknown[];
  effects: unknown[];
  flags: Record<string, unknown>;
  prototypeToken: Record<string, unknown>;
  _meta: ActorMeta;
}

export interface ConnectionConfig {
  url: string;
  token: string;
  socketKey?: string;
}

export class FoundryConnectionError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'FoundryConnectionError';
  }
}

const SOCKET_KEY = 'module.sheet-magnet-connector';
const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Foundry VTT Connector
 * Zero persistence - all data kept in memory only
 *
 * Uses socket.io for communication with Foundry's native WebSocket server.
 * Each request gets a unique requestId for response matching.
 */
export class FoundryConnector {
  private baseUrl: string;
  private token: string;
  private socketKey: string;
  private serverInfo: FoundryServerInfo | null = null;
  private socket: unknown = null;

  constructor(config: ConnectionConfig) {
    // Validate URL protocol — only http(s) and ws(s) allowed
    try {
      const parsed = new URL(config.url);
      if (!['http:', 'https:', 'ws:', 'wss:'].includes(parsed.protocol)) {
        throw new FoundryConnectionError(
          'Invalid URL protocol. Only http, https, ws, and wss are allowed.',
          undefined,
          'INVALID_URL',
        );
      }
    } catch (e) {
      if (e instanceof FoundryConnectionError) throw e;
      throw new FoundryConnectionError(
        'Invalid URL format',
        undefined,
        'INVALID_URL',
      );
    }

    let url = config.url.replace(/\/$/, '');
    // Strip /api/sheet-magnet if present (legacy REST URLs)
    url = url.replace(/\/api\/sheet-magnet$/, '');
    this.baseUrl = url;
    this.token = config.token;
    this.socketKey = config.socketKey ?? SOCKET_KEY;
  }

  /**
   * Create connector from encoded connection string (from QR code)
   */
  static fromEncodedData(encoded: string): FoundryConnector {
    // Guard against oversized payloads (QR codes are typically < 2KB)
    if (encoded.length > 5000) {
      throw new FoundryConnectionError(
        'Connection data too large',
        undefined,
        'INVALID_DATA',
      );
    }

    try {
      const decoded = atob(encoded);
      const config: ConnectionConfig = JSON.parse(decoded);

      if (
        !config.url ||
        typeof config.url !== 'string' ||
        !config.token ||
        typeof config.token !== 'string'
      ) {
        throw new Error('Missing required fields');
      }

      return new FoundryConnector(config);
    } catch (e) {
      if (e instanceof FoundryConnectionError) throw e;
      throw new FoundryConnectionError(
        'Invalid connection data',
        undefined,
        'INVALID_DATA',
      );
    }
  }

  /**
   * Create connector from manual input
   */
  static fromManualInput(url: string, token: string): FoundryConnector {
    if (!url || !token) {
      throw new FoundryConnectionError(
        'URL and token are required',
        undefined,
        'MISSING_PARAMS',
      );
    }
    return new FoundryConnector({ url, token });
  }

  /**
   * Send a socket message and wait for response
   */
  private async sendMessage<T>(
    action: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const requestId = crypto.randomUUID();

    // Build payload with explicit fields — never let params override action/token/requestId
    const payload: Record<string, unknown> = {
      ...params,
      action,
      token: this.token,
      requestId,
    };

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new FoundryConnectionError(
            `Request timed out: ${action}`,
            undefined,
            'TIMEOUT',
          ),
        );
      }, REQUEST_TIMEOUT_MS);

      // Listen for response matching our requestId
      const sock = this.socket as {
        emit: (key: string, data: unknown) => void;
        on: (
          key: string,
          handler: (data: Record<string, unknown>) => void,
        ) => void;
        off: (
          key: string,
          handler: (data: Record<string, unknown>) => void,
        ) => void;
      };

      const handler = (response: Record<string, unknown>) => {
        if (response.responseId !== requestId) return;
        clearTimeout(timeout);
        sock.off(this.socketKey, handler);

        if (response.error) {
          reject(
            new FoundryConnectionError(
              response.error as string,
              undefined,
              (response.code as string) ?? 'SOCKET_ERROR',
            ),
          );
        } else {
          resolve(response as T);
        }
      };

      sock.on(this.socketKey, handler);
      sock.emit(this.socketKey, payload);
    });
  }

  /**
   * Connect to Foundry via socket.io and get server info
   */
  async connect(): Promise<FoundryServerInfo> {
    try {
      // Dynamically import socket.io-client if available
      // In browser: loaded from Foundry's own socket.io
      // In tests: mocked
      if (!this.socket) {
        if (typeof window !== 'undefined' && 'io' in window) {
          // Foundry's page includes socket.io — connect to it
          const io = (window as unknown as { io: (url: string) => unknown }).io;
          this.socket = io(this.baseUrl);
        } else {
          throw new FoundryConnectionError(
            'Socket.io not available. Are you on the Foundry network?',
            undefined,
            'NO_SOCKET',
          );
        }
      }

      this.serverInfo = await this.sendMessage<FoundryServerInfo>('info');
      return this.serverInfo;
    } catch (error) {
      if (error instanceof FoundryConnectionError) {
        throw error;
      }
      throw new FoundryConnectionError(
        'Cannot reach Foundry server. Check the URL and ensure Sheet Magnet module is installed.',
        undefined,
        'CONNECTION_FAILED',
      );
    }
  }

  /**
   * Get list of available actors
   */
  async getActors(): Promise<ActorListResponse> {
    return this.sendMessage<ActorListResponse>('actors');
  }

  /**
   * Get full actor data
   */
  async getActor(actorId: string): Promise<ActorData> {
    return this.sendMessage<ActorData>('actor', { actorId });
  }

  /**
   * Get actor image URL
   */
  async getActorImageUrl(actorId: string): Promise<string | null> {
    try {
      const result = await this.sendMessage<{ url: string; absolute: string }>(
        'actorImage',
        { actorId },
      );
      return result.absolute;
    } catch {
      return null;
    }
  }

  /**
   * Get cached server info (must call connect() first)
   */
  getServerInfo(): FoundryServerInfo | null {
    return this.serverInfo;
  }

  /**
   * Get system info shorthand
   */
  getSystemInfo(): FoundrySystemInfo | null {
    return this.serverInfo?.system ?? null;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (
      this.socket &&
      typeof (this.socket as { disconnect?: () => void }).disconnect ===
        'function'
    ) {
      (this.socket as { disconnect: () => void }).disconnect();
    }
    this.socket = null;
    this.serverInfo = null;
  }
}
