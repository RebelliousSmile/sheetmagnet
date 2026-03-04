import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FoundryConnectionError, FoundryConnector } from './foundry';

// Helpers
function makeResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function encodeConfig(url: string, token: string): string {
  return btoa(JSON.stringify({ url, token }));
}

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
});

describe('FoundryConnector.fromManualInput', () => {
  it('returns a connector from valid url and token', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok123',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });

  it('throws FoundryConnectionError with MISSING_PARAMS when url is empty', () => {
    expect(() => FoundryConnector.fromManualInput('', 'tok')).toThrow(
      FoundryConnectionError,
    );
    try {
      FoundryConnector.fromManualInput('', 'tok');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('MISSING_PARAMS');
    }
  });

  it('throws FoundryConnectionError with MISSING_PARAMS when token is empty', () => {
    expect(() =>
      FoundryConnector.fromManualInput('http://localhost:30000', ''),
    ).toThrow(FoundryConnectionError);
    try {
      FoundryConnector.fromManualInput('http://localhost:30000', '');
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('MISSING_PARAMS');
    }
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

  it('does not double-append /api/sheet-magnet if already present', () => {
    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000/api/sheet-magnet',
      'tok',
    );
    expect(connector).toBeInstanceOf(FoundryConnector);
  });
});

describe('FoundryConnector.connect', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns server info on success', async () => {
    const serverInfo = {
      module: 'sheet-magnet',
      version: '1.0.0',
      foundry: '12.0.0',
      system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
      world: 'test-world',
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse(serverInfo)));

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    const result = await connector.connect();
    expect(result).toEqual(serverInfo);
    expect(connector.getServerInfo()).toEqual(serverInfo);
    expect(connector.getSystemInfo()).toEqual(serverInfo.system);
  });

  it('throws FoundryConnectionError when response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(makeResponse({}, false, 503)),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    await expect(connector.connect()).rejects.toThrow(FoundryConnectionError);
  });

  it('throws FoundryConnectionError on network failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    await expect(connector.connect()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.connect();
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('CONNECTION_FAILED');
    }
  });
});

describe('FoundryConnector.getActors', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns actor list on success', async () => {
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse(actorList)));

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    const result = await connector.getActors();
    expect(result).toEqual(actorList);
  });

  it('throws FoundryConnectionError with UNAUTHORIZED on 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      }),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'bad-tok',
    );
    await expect(connector.getActors()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.getActors();
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('UNAUTHORIZED');
      expect((e as FoundryConnectionError).status).toBe(401);
    }
  });

  it('throws FoundryConnectionError with NETWORK_ERROR on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    await expect(connector.getActors()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.getActors();
    } catch (e) {
      expect((e as FoundryConnectionError).code).toBe('NETWORK_ERROR');
    }
  });

  it('handles error response with no error field when json rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('bad json')),
      }),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    await expect(connector.getActors()).rejects.toThrow(FoundryConnectionError);
  });

  it('uses HTTP status fallback when error response body has no error field', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      }),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    await expect(connector.getActors()).rejects.toThrow(FoundryConnectionError);
    try {
      await connector.getActors();
    } catch (e) {
      expect((e as FoundryConnectionError).message).toBe('HTTP 503');
      expect((e as FoundryConnectionError).code).toBe('HTTP_ERROR');
    }
  });
});

describe('FoundryConnector.getActor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns actor data for a given id', async () => {
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
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeResponse(actorData)));

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    const result = await connector.getActor('abc');
    expect(result).toEqual(actorData);
  });
});

describe('FoundryConnector.getActorImageUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns absolute image url on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        makeResponse({
          url: 'img.png',
          absolute: 'http://localhost:30000/img.png',
        }),
      ),
    );

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
    const result = await connector.getActorImageUrl('abc');
    expect(result).toBe('http://localhost:30000/img.png');
  });

  it('returns null on fetch error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));

    const connector = FoundryConnector.fromManualInput(
      'http://localhost:30000',
      'tok',
    );
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
