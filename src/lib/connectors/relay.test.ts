import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryConnectionError } from './foundry';
import { RelayConnector } from './relay';

// Mock WebSocket
class MockWebSocket {
  static instances: MockWebSocket[] = [];
  url: string;
  onopen: (() => void) | null = null;
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = 0;
  sent: string[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
    this.onclose?.();
  }
  triggerOpen() {
    this.readyState = 1;
    this.onopen?.();
  }
  triggerMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
  triggerError() {
    this.onerror?.();
  }
  get lastSentMsg(): Record<string, unknown> {
    return JSON.parse(this.sent.at(-1) ?? '{}');
  }
}

vi.stubGlobal('WebSocket', MockWebSocket);

const mockServerInfo = {
  module: 'sheet-magnet',
  version: '1.0.0',
  foundry: '12.0.0',
  system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
  world: 'test-world',
};

/**
 * Helper to complete the connection handshake:
 * 1. Start connect()
 * 2. Trigger WebSocket open
 * 3. Trigger peer_connected message
 * 4. Let sendMessage('info') run
 * 5. Reply to info request
 * Returns the connect() promise
 */
async function connectHelper(
  connector: RelayConnector,
  info = mockServerInfo,
): Promise<typeof mockServerInfo> {
  const connectPromise = connector.connect();

  // Wait for WebSocket to be created
  await Promise.resolve();

  const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
  ws.triggerOpen();
  ws.triggerMessage({ type: 'peer_connected', role: 'foundry' });

  // Let sendMessage('info') execute and send
  await Promise.resolve();
  await Promise.resolve();

  // Get the requestId from the info message
  const infoMsg = ws.lastSentMsg;
  const requestId = infoMsg.requestId as string;

  // Reply with server info
  ws.triggerMessage({ responseId: requestId, ...info });

  return connectPromise as Promise<typeof mockServerInfo>;
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.useRealTimers();
});

describe('RelayConnector', () => {
  describe('session getter', () => {
    it('returns the sessionId', () => {
      const connector = new RelayConnector('my-session', 'my-token');
      expect(connector.session).toBe('my-session');
    });
  });

  describe('getServerInfo()', () => {
    it('returns null before connect', () => {
      const connector = new RelayConnector('sess', 'tok');
      expect(connector.getServerInfo()).toBeNull();
    });
  });

  describe('connect()', () => {
    it('connects successfully and returns serverInfo', async () => {
      const connector = new RelayConnector('sess1', 'tok1');
      const info = await connectHelper(connector);

      expect(info.module).toBe('sheet-magnet');
      expect(info.world).toBe('test-world');
      // getServerInfo contains the resolved response (may have extra responseId field)
      const serverInfo = connector.getServerInfo();
      expect(serverInfo).not.toBeNull();
      expect(serverInfo?.module).toBe('sheet-magnet');
      expect(serverInfo?.world).toBe('test-world');
    });

    it('includes session and role=pwa in WebSocket URL', async () => {
      const connector = new RelayConnector('my-session-id', 'tok');
      const connectPromise = connector.connect();
      await Promise.resolve();

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      expect(ws.url).toContain('session=my-session-id');
      expect(ws.url).toContain('role=pwa');

      // Cleanup — trigger error to reject the promise
      ws.triggerError();
      await connectPromise.catch(() => {});
    });

    it('rejects on WebSocket onerror', async () => {
      const connector = new RelayConnector('sess', 'tok');
      const connectPromise = connector.connect();
      await Promise.resolve();

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      ws.triggerError();

      await expect(connectPromise).rejects.toBeInstanceOf(
        FoundryConnectionError,
      );
    });

    it('rejects on connection timeout', async () => {
      vi.useFakeTimers();
      const connector = new RelayConnector('sess', 'tok');

      let caughtError: unknown = null;
      const connectPromise = connector.connect().catch((e) => {
        caughtError = e;
      });
      await Promise.resolve();

      await vi.advanceTimersByTimeAsync(16000);
      await connectPromise;

      expect(caughtError).toMatchObject({ code: 'RELAY_TIMEOUT' });
      vi.useRealTimers();
    });

    it('does not resolve when peer_connected role is not foundry', async () => {
      vi.useFakeTimers();
      const connector = new RelayConnector('sess', 'tok');
      const connectPromise = connector.connect();
      await Promise.resolve();

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      ws.triggerOpen();
      ws.triggerMessage({ type: 'peer_connected', role: 'other' });

      // Promise should still be pending — advance just a bit without triggering timeout
      let resolved = false;
      connectPromise
        .then(() => {
          resolved = true;
        })
        .catch(() => {});
      await vi.advanceTimersByTimeAsync(100);
      expect(resolved).toBe(false);

      // Cleanup
      ws.triggerError();
      await connectPromise.catch(() => {});
      vi.useRealTimers();
    });
  });

  describe('getActors()', () => {
    it('sends actors action and resolves with response', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const actorsPromise = connector.getActors();

      await Promise.resolve();

      const msg = ws.lastSentMsg;
      expect(msg.action).toBe('actors');
      const requestId = msg.requestId as string;

      const actorsResponse = {
        responseId: requestId,
        count: 1,
        actors: [
          {
            id: 'a1',
            name: 'Gandalf',
            type: 'character',
            img: '',
            hasPlayerOwner: true,
          },
        ],
      };
      ws.triggerMessage(actorsResponse);

      const result = await actorsPromise;
      expect(result.actors[0]?.name).toBe('Gandalf');
    });
  });

  describe('getActor()', () => {
    it('sends actor action with actorId param', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const actorPromise = connector.getActor('actor-123');

      await Promise.resolve();

      const msg = ws.lastSentMsg;
      expect(msg.action).toBe('actor');
      expect(msg.actorId).toBe('actor-123');
      const requestId = msg.requestId as string;

      ws.triggerMessage({
        responseId: requestId,
        id: 'actor-123',
        name: 'Aragorn',
      });

      const result = await actorPromise;
      expect((result as unknown as Record<string, unknown>).name).toBe(
        'Aragorn',
      );
    });
  });

  describe('getActorImageUrl()', () => {
    it('returns result.absolute on success', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const imagePromise = connector.getActorImageUrl('actor-123');

      await Promise.resolve();

      const msg = ws.lastSentMsg;
      const requestId = msg.requestId as string;
      ws.triggerMessage({
        responseId: requestId,
        url: '/img/actor.png',
        absolute: 'https://example.com/img/actor.png',
      });

      const result = await imagePromise;
      expect(result).toBe('https://example.com/img/actor.png');
    });

    it('returns null when response has error', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const imagePromise = connector.getActorImageUrl('actor-123');

      await Promise.resolve();

      const msg = ws.lastSentMsg;
      const requestId = msg.requestId as string;
      ws.triggerMessage({
        responseId: requestId,
        error: 'Not found',
        code: 'NOT_FOUND',
      });

      const result = await imagePromise;
      expect(result).toBeNull();
    });
  });

  describe('disconnect()', () => {
    it('closes the WebSocket and clears serverInfo', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      expect(connector.getServerInfo()).not.toBeNull();
      connector.disconnect();

      expect(connector.getServerInfo()).toBeNull();
    });
  });

  describe('pending rejected on WebSocket close', () => {
    it('rejects pending requests when WS closes', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const actorsPromise = connector.getActors();
      await Promise.resolve();

      // Close before response
      ws.onclose?.();

      await expect(actorsPromise).rejects.toMatchObject({
        code: 'RELAY_CLOSED',
      });
    });
  });

  describe('sendMessage timeout', () => {
    it('rejects with TIMEOUT code after 15s', async () => {
      vi.useFakeTimers();
      const connector = new RelayConnector('sess', 'tok');

      // Complete connection handshake using fake timers
      const connectPromise = connector.connect();
      await Promise.resolve();

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      ws.triggerOpen();
      ws.triggerMessage({ type: 'peer_connected', role: 'foundry' });

      await Promise.resolve();
      await Promise.resolve();

      // Reply to info request
      const infoMsg = ws.lastSentMsg;
      const infoRequestId = infoMsg.requestId as string;
      ws.triggerMessage({ responseId: infoRequestId, ...mockServerInfo });
      await connectPromise;

      let caughtError: unknown = null;
      const actorsPromise = connector.getActors().catch((e) => {
        caughtError = e;
      });
      await vi.advanceTimersByTimeAsync(16000);
      await actorsPromise;

      expect(caughtError).toMatchObject({ code: 'TIMEOUT' });
      vi.useRealTimers();
    });
  });

  describe('response with error', () => {
    it('uses msg.code when present', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const actorsPromise = connector.getActors();
      await Promise.resolve();

      const msg = ws.lastSentMsg;
      const requestId = msg.requestId as string;
      ws.triggerMessage({
        responseId: requestId,
        error: 'Forbidden',
        code: 'FORBIDDEN',
      });

      const err = await actorsPromise.catch((e) => e);
      expect(err).toBeInstanceOf(FoundryConnectionError);
      expect((err as FoundryConnectionError).code).toBe('FORBIDDEN');
    });

    it('falls back to RELAY_ERROR when code is missing', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      const actorsPromise = connector.getActors();
      await Promise.resolve();

      const msg = ws.lastSentMsg;
      const requestId = msg.requestId as string;
      // No code field
      ws.triggerMessage({ responseId: requestId, error: 'Unknown error' });

      const err = await actorsPromise.catch((e) => e);
      expect(err).toBeInstanceOf(FoundryConnectionError);
      expect((err as FoundryConnectionError).code).toBe('RELAY_ERROR');
    });
  });

  describe('non-parseable message', () => {
    it('does not throw on invalid JSON', async () => {
      const connector = new RelayConnector('sess', 'tok');
      await connectHelper(connector);

      const ws = MockWebSocket.instances.at(-1) as MockWebSocket;
      // Manually trigger a malformed message
      expect(() => {
        ws.onmessage?.({ data: '{not valid json' });
      }).not.toThrow();
    });
  });
});
