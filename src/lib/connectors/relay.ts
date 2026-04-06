/**
 * Sheet Magnet Relay Connector
 *
 * Same interface as FoundryConnector, but communicates via the
 * Sheet Magnet WebSocket relay server instead of direct socket.io.
 *
 * Used when direct socket.io access is blocked (e.g. Forge VTT).
 *
 * Protocol:
 *   PWA connects as role=pwa, Foundry module as role=foundry.
 *   Both share the same sessionId.
 *   Messages are relayed transparently using the same action/response format.
 */

import type {
  ActorData,
  ActorListResponse,
  FoundryServerInfo,
} from './foundry';
import { FoundryConnectionError } from './foundry';

export const RELAY_URL = 'wss://sheetmagnet-production.up.railway.app';
const REQUEST_TIMEOUT_MS = 15_000;

export class RelayConnector {
  private sessionId: string;
  private token: string;
  private ws: WebSocket | null = null;
  private serverInfo: FoundryServerInfo | null = null;
  private pending = new Map<
    string,
    {
      resolve: (v: unknown) => void;
      reject: (e: unknown) => void;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();

  constructor(sessionId: string, token: string) {
    this.sessionId = sessionId;
    this.token = token;
  }

  get session(): string {
    return this.sessionId;
  }

  private async openSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `${RELAY_URL}?session=${this.sessionId}&role=pwa`;
      this.ws = new WebSocket(url);

      const timeout = setTimeout(() => {
        reject(
          new FoundryConnectionError(
            'Relay connection timed out',
            undefined,
            'RELAY_TIMEOUT',
          ),
        );
      }, REQUEST_TIMEOUT_MS);

      this.ws.onopen = () => {
        clearTimeout(timeout);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as Record<
            string,
            unknown
          >;

          // Relay system messages
          if (msg.type === 'peer_connected' && msg.role === 'foundry') {
            resolve();
            return;
          }

          // Response to a pending request
          if (msg.responseId) {
            const pending = this.pending.get(msg.responseId as string);
            if (pending) {
              clearTimeout(pending.timeout);
              this.pending.delete(msg.responseId as string);
              if (msg.error) {
                pending.reject(
                  new FoundryConnectionError(
                    msg.error as string,
                    undefined,
                    (msg.code as string) ?? 'RELAY_ERROR',
                  ),
                );
              } else {
                pending.resolve(msg);
              }
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(
          new FoundryConnectionError(
            'Relay WebSocket error',
            undefined,
            'RELAY_ERROR',
          ),
        );
      };

      this.ws.onclose = () => {
        // Reject all pending requests
        for (const [id, p] of this.pending) {
          clearTimeout(p.timeout);
          p.reject(
            new FoundryConnectionError(
              'Relay disconnected',
              undefined,
              'RELAY_CLOSED',
            ),
          );
          this.pending.delete(id);
        }
      };
    });
  }

  private sendMessage<T>(
    action: string,
    params: Record<string, unknown> = {},
  ): Promise<T> {
    const requestId = crypto.randomUUID();

    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(requestId);
        reject(
          new FoundryConnectionError(
            `Request timed out: ${action}`,
            undefined,
            'TIMEOUT',
          ),
        );
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(requestId, {
        resolve: resolve as (v: unknown) => void,
        reject,
        timeout,
      });

      this.ws?.send(
        JSON.stringify({ action, token: this.token, requestId, ...params }),
      );
    });
  }

  async connect(): Promise<FoundryServerInfo> {
    await this.openSocket();
    this.serverInfo = await this.sendMessage<FoundryServerInfo>('info');
    return this.serverInfo;
  }

  async getActors(): Promise<ActorListResponse> {
    return this.sendMessage<ActorListResponse>('actors');
  }

  async getActor(actorId: string): Promise<ActorData> {
    return this.sendMessage<ActorData>('actor', { actorId });
  }

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

  getServerInfo(): FoundryServerInfo | null {
    return this.serverInfo;
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
    this.serverInfo = null;
  }
}
