/**
 * Sheet Magnet - Foundry VTT Connector
 * Handles connection and data fetching from Foundry instances
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
}

export class FoundryConnectionError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FoundryConnectionError';
  }
}

/**
 * Foundry VTT Connector
 * Zero persistence - all data kept in memory only
 */
export class FoundryConnector {
  private baseUrl: string;
  private token: string;
  private serverInfo: FoundryServerInfo | null = null;

  constructor(config: ConnectionConfig) {
    // Normalize URL (remove trailing slash, ensure /api/sheet-magnet)
    let url = config.url.replace(/\/$/, '');
    if (!url.includes('/api/sheet-magnet')) {
      url = `${url}/api/sheet-magnet`;
    }
    this.baseUrl = url;
    this.token = config.token;
  }

  /**
   * Create connector from encoded connection string (from QR code)
   */
  static fromEncodedData(encoded: string): FoundryConnector {
    try {
      const decoded = atob(encoded);
      const config: ConnectionConfig = JSON.parse(decoded);
      return new FoundryConnector(config);
    } catch {
      throw new FoundryConnectionError('Invalid connection data', undefined, 'INVALID_DATA');
    }
  }

  /**
   * Create connector from manual input
   */
  static fromManualInput(url: string, token: string): FoundryConnector {
    if (!url || !token) {
      throw new FoundryConnectionError('URL and token are required', undefined, 'MISSING_PARAMS');
    }
    return new FoundryConnector({ url, token });
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new FoundryConnectionError(
          error.error || `HTTP ${response.status}`,
          response.status,
          response.status === 401 ? 'UNAUTHORIZED' : 'HTTP_ERROR'
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof FoundryConnectionError) {
        throw error;
      }
      
      // Network error (CORS, offline, etc.)
      throw new FoundryConnectionError(
        'Cannot connect to Foundry. Make sure you are on the same network.',
        undefined,
        'NETWORK_ERROR'
      );
    }
  }

  /**
   * Test connection and get server info
   */
  async connect(): Promise<FoundryServerInfo> {
    const url = `${this.baseUrl}/info`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new FoundryConnectionError('Foundry server not responding', response.status);
      }
      this.serverInfo = await response.json();
      return this.serverInfo!;
    } catch (error) {
      if (error instanceof FoundryConnectionError) {
        throw error;
      }
      throw new FoundryConnectionError(
        'Cannot reach Foundry server. Check the URL and ensure Sheet Magnet module is installed.',
        undefined,
        'CONNECTION_FAILED'
      );
    }
  }

  /**
   * Get list of available actors
   */
  async getActors(): Promise<ActorListResponse> {
    return this.fetch<ActorListResponse>('/actors');
  }

  /**
   * Get full actor data
   */
  async getActor(actorId: string): Promise<ActorData> {
    return this.fetch<ActorData>(`/actors/${actorId}`);
  }

  /**
   * Get actor image URL
   */
  async getActorImageUrl(actorId: string): Promise<string | null> {
    try {
      const result = await this.fetch<{ url: string; absolute: string }>(`/actors/${actorId}/image`);
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
}
