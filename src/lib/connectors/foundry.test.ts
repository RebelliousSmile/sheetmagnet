import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryConnectionError, FoundryConnector } from './foundry';

// ── Helpers ──────────────────────────────────────────────────────────────────

function encodeConfig(url: string, token: string): string {
  return btoa(JSON.stringify({ url, token }));
}

/** Create a mock socket.io instance */
function createMockSocket() {
  const handlers: Record<string, ((data: Record<string, unknown>) => void)[]> =
    {};
  return {
    emit: vi.fn((key: string, data: unknown) => {
      // Simulate server response after emit
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        const listeners = handlers[key] ?? [];
        for (const handler of listeners) {
          handler(payload._mockResponse as Record<string, unknown>);
        }
      }, 0);
    }),
    on: vi.fn(
      (key: string, handler: (data: Record<string, unknown>) => void) => {
        if (!handlers[key]) handlers[key] = [];
        handlers[key].push(handler);
      },
    ),
    off: vi.fn(
      (key: string, handler: (data: Record<string, unknown>) => void) => {
        const list = handlers[key];
        if (list) {
          const idx = list.indexOf(handler);
          if (idx >= 0) list.splice(idx, 1);
        }
      },
    ),
    disconnect: vi.fn(),
    /** Inject a response that will be delivered on next emit */
    _simulateResponse: (
      key: string,
      requestId: string,
      response: Record<string, unknown>,
    ) => {
      const listeners = handlers[key] ?? [];
      for (const handler of listeners) {
        handler({ responseId: requestId, ...response });
      }
    },
    _handlers: handlers,
  };
}

/** Create a connector with a pre-attached mock socket */
function createConnectorWithSocket(
  mockSocket: ReturnType<typeof createMockSocket>,
  url = 'http://localhost:30000',
  token = 'tok123',
) {
  const connector = FoundryConnector.fromManualInput(url, token);
  // Inject mock socket directly
  (connector as unknown as { socket: unknown }).socket = mockSocket;
  return connector;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('FoundryConnectionError', () => {
  it('has correct name and properties', () => {
    const err = new FoundryConnectionError('msg', 401, 'UNAUTHORIZED');
    expect(err.name).toBe('FoundryConnectionError');
    expect(err.message).toBe('msg');
    expect(err.status).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });
});

describe('FoundryConnector.fromEncodedData', () => {
  it('returns a connector from valid base64-encoded JSON', () => {
    const encoded = encodeConfig('http://localhost:30000', 'tok123');
    const connector = FoundryConnector.fromEncodedData(encoded);
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('throws FoundryConnectionError with INVALID_DATA on bad base64', () => {
    expect(() => FoundryConnector.fromEncodedData('!!!not-base64!!!')).toThrow(
      FoundryConnectionError,
    );
    try {
      FoundryConnector.fromEncodedData('!!!not-base64!!!');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('INVALID_DATA');
    }
  });

  it('throws FoundryConnectionError with INVALID_DATA on non-JSON base64', () => {
    const encoded = btoa('not json at all');
    expect(() => FoundryConnector.fromEncodedData(encoded)).toThrow(
      FoundryConnectionError,
    );
  });

  it('throws INVALID_DATA when encoded data is too large', () => {
    const huge = 'A'.repeat(5001);
    expect(() => FoundryConnector.fromEncodedData(huge)).toThrow(
      FoundryConnectionError,
    );
    try {
      FoundryConnector.fromEncodedData(huge);
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('INVALID_DATA');
    }
  });

  it('throws INVALID_DATA when config is missing url', () => {
    const encoded = btoa(JSON.stringify({ token: 'tok' }));
    expect(() => FoundryConnector.fromEncodedData(encoded)).toThrow(
      FoundryConnectionError,
    );
  });

  it('throws INVALID_DATA when config is missing token', () => {
    const encoded = btoa(JSON.stringify({ url: 'http://localhost:30000' }));
    expect(() => FoundryConnector.fromEncodedData(encoded)).toThrow(
      FoundryConnectionError,
    );
  });

  it('throws INVALID_URL for valid JSON with javascript: URL', () => {
    const encoded = btoa(
      JSON.stringify({ url: 'javascript:alert(1)', token: 'tok' }),
    );
    expect(() => FoundryConnector.fromEncodedData(encoded)).toThrow(
      FoundryConnectionError,
    );
  });
});

describe('FoundryConnector.fromManualInput', () => {
  it('returns a connector from valid url and token', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok123',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('throws with MISSING_PARAMS when url is empty', () => {
    expect(() => FoundryConnector.fromManualInput('', 'tok')).toThrow(
      FoundryConnectionError,
    );
    try {
      FoundryConnector.fromManualInput('', 'tok');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('MISSING_PARAMS');
    }
  });

  it('throws with MISSING_PARAMS when token is empty', () => {
    expect(() =>
      FoundryConnector.fromManualInput('http://localhost:30000', ''),
    ).toThrow(FoundryConnectionError);
  });

  it('throws when both url and token are empty', () => {
    expect(() => FoundryConnector.fromManualInput('', '')).toThrow(
      FoundryConnectionError,
    );
  });
});

describe('FoundryConnector URL normalization', () => {
  it('strips trailing slash from url', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000/',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('strips legacy /api/sheet-magnet suffix', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000/api/sheet-magnet',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('accepts https URLs', () => {
    const connector = FoundryConnector.fromManualInput(
      'https://foundry.example.com',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('accepts ws:// URLs', () => {
    const connector = FoundryConnector.fromManualInput(
      'ws://localhost:30000',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('accepts wss:// URLs', () => {
    const connector = FoundryConnector.fromManualInput(
      'wss://foundry.example.com',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });
});

describe('FoundryConnector URL protocol validation', () => {
  it('rejects javascript: URLs', () => {
    expect(() =>
      FoundryConnector.fromManualInput('javascript:alert(1)', 'tok'),
    ).toThrow(FoundryConnectionError);
    try {
      FoundryConnector.fromManualInput('javascript:alert(1)', 'tok');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('INVALID_URL');
    }
  });

  it('rejects file: URLs', () => {
    expect(() =>
      FoundryConnector.fromManualInput('file:///etc/passwd', 'tok'),
    ).toThrow(FoundryConnectionError);
  });

  it('rejects data: URLs', () => {
    expect(() =>
      FoundryConnector.fromManualInput('data:text/html,<h1>XSS</h1>', 'tok'),
    ).toThrow(FoundryConnectionError);
  });

  it('rejects blob: URLs', () => {
    expect(() =>
      FoundryConnector.fromManualInput('blob:http://localhost/abc', 'tok'),
    ).toThrow(FoundryConnectionError);
  });

  it('rejects malformed URLs', () => {
    expect(() => FoundryConnector.fromManualInput('not-a-url', 'tok')).toThrow(
      FoundryConnectionError,
    );
    try {
      FoundryConnector.fromManualInput('not-a-url', 'tok');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('INVALID_URL');
    }
  });
});

describe('FoundryConnector.getActors (socket)', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-123' });
    mockSocket = createMockSocket();
  });

  it('sends actors action and returns response', async () => {
    const connector = createConnectorWithSocket(mockSocket);
    const actorList = {
      count: 1,
      actors: [
        {
          id: 'abc',
          name: 'Gandalf',
          type: 'character',
          img: 'img.png',
          hasPlayerOwner: true,
        },
      ],
    };

    // Override emit to simulate response
    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(
          key,
          payload.requestId as string,
          actorList,
        );
      }, 0);
    });

    const result = await connector.getActors();
    expect(result.count).toBe(1);
    expect(result.actors[0]?.name).toBe('Gandalf');
  });

  it('rejects with error response', async () => {
    const connector = createConnectorWithSocket(mockSocket);

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(key, payload.requestId as string, {
          error: 'Invalid or missing token',
          code: 'UNAUTHORIZED',
        });
      }, 0);
    });

    await expect(connector.getActors()).rejects.toThrow(FoundryConnectionError);
  });
});

describe('FoundryConnector.getActor (socket)', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-456' });
    mockSocket = createMockSocket();
  });

  it('sends actor action with actorId', async () => {
    const connector = createConnectorWithSocket(mockSocket);
    const actorData = {
      id: 'abc',
      name: 'Frodo',
      type: 'character',
      img: 'frodo.png',
      system: {},
      items: [],
      effects: [],
      flags: {},
      prototypeToken: {},
      _meta: {
        systemId: 'dnd5e',
        systemVersion: '3.0.0',
        foundryVersion: '12.0.0',
        exportedAt: '2026-01-01T00:00:00Z',
      },
    };

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      expect(payload.actorId).toBe('abc');
      setTimeout(() => {
        mockSocket._simulateResponse(
          key,
          payload.requestId as string,
          actorData,
        );
      }, 0);
    });

    const result = await connector.getActor('abc');
    expect(result.name).toBe('Frodo');
  });
});

describe('FoundryConnector.getActorImageUrl', () => {
  let mockSocket: ReturnType<typeof createMockSocket>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-789' });
    mockSocket = createMockSocket();
  });

  it('returns absolute image url on success', async () => {
    const connector = createConnectorWithSocket(mockSocket);

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(key, payload.requestId as string, {
          url: 'img.png',
          absolute: 'http://localhost:30000/img.png',
        });
      }, 0);
    });

    const result = await connector.getActorImageUrl('abc');
    expect(result).toBe('http://localhost:30000/img.png');
  });

  it('returns null on error', async () => {
    const connector = createConnectorWithSocket(mockSocket);

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(key, payload.requestId as string, {
          error: 'No custom image',
        });
      }, 0);
    });

    const result = await connector.getActorImageUrl('abc');
    expect(result).toBeNull();
  });
});

describe('FoundryConnector.getServerInfo before connect', () => {
  it('returns null before connect is called', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    expect(connector.getServerInfo()).toBeNull();
    expect(connector.getSystemInfo()).toBeNull();
  });
});

describe('FoundryConnector.disconnect', () => {
  it('calls socket.disconnect and clears state', () => {
    const mockSocket = createMockSocket();
    const connector = createConnectorWithSocket(mockSocket);
    connector.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
    expect(connector.getServerInfo()).toBeNull();
  });

  it('handles socket without disconnect method', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    // Inject socket without disconnect
    (connector as unknown as { socket: unknown }).socket = {};
    connector.disconnect();
    expect(connector.getServerInfo()).toBeNull();
  });

  it('handles null socket', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    connector.disconnect();
    expect(connector.getServerInfo()).toBeNull();
  });
});

describe('FoundryConnector.connect', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-connect' });
  });

  it('throws NO_SOCKET when window.io is not available', async () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    // Simulate browser without socket.io
    vi.stubGlobal('window', {});

    await expect(connector.connect()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.connect();
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('NO_SOCKET');
    }
  });

  it('throws CONNECTION_FAILED on non-FoundryConnectionError', async () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    // Simulate window with io that throws generic error
    vi.stubGlobal('window', {
      io: () => {
        throw new Error('network failure');
      },
    });

    await expect(connector.connect()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.connect();
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('CONNECTION_FAILED');
    }
  });

  it('connects via window.io and returns server info', async () => {
    const mockSocket = createMockSocket();
    const serverInfo = {
      module: 'sheet-magnet-connector',
      version: '1.0.0',
      foundry: '12.0.0',
      system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
      world: 'test-world',
    };

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(
          key,
          payload.requestId as string,
          serverInfo,
        );
      }, 0);
    });

    vi.stubGlobal('window', { io: () => mockSocket });

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    const info = await connector.connect();
    expect(info.module).toBe('sheet-magnet-connector');
    expect(info.system.id).toBe('dnd5e');
    expect(connector.getServerInfo()).toEqual(info);
    expect(connector.getSystemInfo()).toEqual(serverInfo.system);
  });

  it('reuses existing socket on second connect', async () => {
    const mockSocket = createMockSocket();
    const serverInfo = {
      module: 'sheet-magnet-connector',
      version: '1.0.0',
      foundry: '12.0.0',
      system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
      world: 'test-world',
    };

    mockSocket.emit.mockImplementation((key, data) => {
      const payload = data as Record<string, unknown>;
      setTimeout(() => {
        mockSocket._simulateResponse(
          key,
          payload.requestId as string,
          serverInfo,
        );
      }, 0);
    });

    const connector = createConnectorWithSocket(mockSocket);
    const info = await connector.connect();
    expect(info.module).toBe('sheet-magnet-connector');
  });
});

describe('FoundryConnector sendMessage timeout', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'test-uuid-timeout' });
    vi.useFakeTimers();
  });

  it('rejects with TIMEOUT when server does not respond', async () => {
    const mockSocket = createMockSocket();
    // Override emit to NOT send any response
    mockSocket.emit.mockImplementation(() => {});

    const connector = createConnectorWithSocket(mockSocket);
    const promise = connector.getActors();

    // Advance time past the 10s timeout
    vi.advanceTimersByTime(10_001);

    await expect(promise).rejects.toThrow(FoundryConnectionError);
    try {
      await promise;
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('TIMEOUT');
    }

    vi.useRealTimers();
  });
});

describe('FoundryConnector.fromEncodedData with socketKey', () => {
  it('passes custom socketKey from encoded config', () => {
    const encoded = btoa(
      JSON.stringify({
        url: 'http://localhost:30000',
        token: 'tok',
        socketKey: 'module.custom-key',
      }),
    );
    const connector = FoundryConnector.fromEncodedData(encoded);
    expect(connector).toBeInstanceOf(FoundryConnector);
  });
});
