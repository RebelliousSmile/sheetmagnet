import { get } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock FoundryConnector before importing session store
vi.mock('$lib/connectors/foundry', () => {
  class MockFoundryConnectionError extends Error {
    status?: number;
    code?: string;
    constructor(message: string, status?: number, code?: string) {
      super(message);
      this.name = 'FoundryConnectionError';
      this.status = status;
      this.code = code;
    }
  }

  class MockFoundryConnector {
    private token: string;
    private serverInfo: Record<string, unknown> | null = null;

    constructor(config: { url: string; token: string }) {
      this.token = config.token;
    }

    static fromManualInput(url: string, token: string) {
      if (!url || !token) {
        throw new MockFoundryConnectionError(
          'URL and token are required',
          undefined,
          'MISSING_PARAMS',
        );
      }
      return new MockFoundryConnector({ url, token });
    }

    static fromEncodedData(encoded: string) {
      try {
        const decoded = atob(encoded);
        const config = JSON.parse(decoded);
        return new MockFoundryConnector(config);
      } catch {
        throw new MockFoundryConnectionError(
          'Invalid connection data',
          undefined,
          'INVALID_DATA',
        );
      }
    }

    async connect() {
      const info = {
        module: 'sheet-magnet',
        version: '1.0.0',
        foundry: '12.0.0',
        system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
        world: 'test-world',
      };
      this.serverInfo = info;
      return info;
    }

    async getActors() {
      return {
        count: 2,
        actors: [
          {
            id: 'a1',
            name: 'Gandalf',
            type: 'character',
            img: 'gandalf.png',
            hasPlayerOwner: true,
          },
          {
            id: 'a2',
            name: 'Frodo',
            type: 'character',
            img: 'frodo.png',
            hasPlayerOwner: true,
          },
        ],
      };
    }

    async getActor(id: string) {
      return {
        id,
        name: id === 'a1' ? 'Gandalf' : 'Frodo',
        type: 'character',
        img: `${id}.png`,
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
    }

    getServerInfo() {
      return this.serverInfo;
    }
    getSystemInfo() {
      return (this.serverInfo as Record<string, unknown>)?.system ?? null;
    }
  }

  return {
    FoundryConnector: MockFoundryConnector,
    FoundryConnectionError: MockFoundryConnectionError,
  };
});

// Mock RelayConnector
let relayShouldFail = false;

vi.mock('$lib/connectors/relay', () => ({
  RelayConnector: class {
    private _sessionId: string;
    private _serverInfo: Record<string, unknown> | null = null;
    constructor(sessionId: string, _token: string) {
      this._sessionId = sessionId;
    }
    get session() {
      return this._sessionId;
    }
    async connect() {
      if (relayShouldFail) throw new Error('Relay connection failed');
      const info = {
        module: 'sheet-magnet',
        version: '1.0.0',
        foundry: '12.0.0',
        system: { id: 'dnd5e', title: 'D&D 5e', version: '3.0.0' },
        world: 'relay-world',
      };
      this._serverInfo = info;
      return info;
    }
    getServerInfo() {
      return this._serverInfo;
    }
    disconnect() {}
  },
}));

// Import after mock is set up
import {
  actorsList,
  clearSelection,
  connect,
  connectFromEncoded,
  connection,
  connectViaRelay,
  deselectActor,
  disconnect,
  fetchActorDetails,
  fetchActors,
  importActorJson,
  isConnected,
  selectActor,
  selectedActorIds,
  selectedActors,
  toggleActorSelection,
} from './session';

// Reset stores between tests
function resetStores() {
  disconnect();
}

describe('session store — initial state', () => {
  beforeEach(() => resetStores());

  it('starts disconnected', () => {
    const conn = get(connection);
    expect(conn.status).toBe('disconnected');
    expect(conn.connector).toBeNull();
    expect(conn.serverInfo).toBeNull();
    expect(conn.error).toBeNull();
  });

  it('isConnected is false', () => {
    expect(get(isConnected)).toBe(false);
  });

  it('actorsList is empty', () => {
    expect(get(actorsList)).toEqual([]);
  });

  it('selectedActorIds is empty', () => {
    expect(get(selectedActorIds).size).toBe(0);
  });

  it('selectedActors is empty', () => {
    expect(get(selectedActors)).toEqual([]);
  });
});

describe('connect()', () => {
  beforeEach(() => resetStores());

  it('connects successfully and updates state', async () => {
    const result = await connect('http://localhost:30000', 'tok123');
    expect(result).toBe(true);

    const conn = get(connection);
    expect(conn.status).toBe('connected');
    expect(conn.connector).not.toBeNull();
    expect(conn.serverInfo).not.toBeNull();
    expect(conn.serverInfo?.module).toBe('sheet-magnet');
    expect(conn.error).toBeNull();
  });

  it('sets isConnected to true after connect', async () => {
    await connect('http://localhost:30000', 'tok123');
    expect(get(isConnected)).toBe(true);
  });

  it('fails with empty URL and sets error state', async () => {
    const result = await connect('', 'tok123');
    expect(result).toBe(false);

    const conn = get(connection);
    expect(conn.status).toBe('error');
    expect(conn.error).toBe('URL and token are required');
    expect(conn.connector).toBeNull();
  });

  it('fails with empty token and sets error state', async () => {
    const result = await connect('http://localhost:30000', '');
    expect(result).toBe(false);

    const conn = get(connection);
    expect(conn.status).toBe('error');
  });
});

describe('connectFromEncoded()', () => {
  beforeEach(() => resetStores());

  it('connects from valid encoded data', async () => {
    const encoded = btoa(
      JSON.stringify({ url: 'http://localhost:30000', token: 'tok123' }),
    );
    const result = await connectFromEncoded(encoded);
    expect(result).toBe(true);
    expect(get(isConnected)).toBe(true);
  });

  it('fails with invalid encoded data', async () => {
    const result = await connectFromEncoded('not-valid-base64!!!');
    expect(result).toBe(false);

    const conn = get(connection);
    expect(conn.status).toBe('error');
    expect(conn.error).toBeTruthy();
  });
});

describe('fetchActors()', () => {
  beforeEach(() => resetStores());

  it('fetches actors after connecting', async () => {
    await connect('http://localhost:30000', 'tok123');
    await fetchActors();

    const actors = get(actorsList);
    expect(actors).toHaveLength(2);
    expect(actors[0]?.name).toBe('Gandalf');
    expect(actors[1]?.name).toBe('Frodo');
  });

  it('does nothing when not connected', async () => {
    await fetchActors();
    expect(get(actorsList)).toEqual([]);
  });
});

describe('fetchActorDetails()', () => {
  beforeEach(() => resetStores());

  it('fetches and caches actor details', async () => {
    await connect('http://localhost:30000', 'tok123');
    const actor = await fetchActorDetails('a1');

    expect(actor).not.toBeNull();
    expect(actor?.name).toBe('Gandalf');
    expect(actor?.id).toBe('a1');
  });

  it('returns cached data on second call', async () => {
    await connect('http://localhost:30000', 'tok123');
    const first = await fetchActorDetails('a1');
    const second = await fetchActorDetails('a1');

    expect(first).toEqual(second);
  });

  it('returns null when not connected', async () => {
    const result = await fetchActorDetails('a1');
    expect(result).toBeNull();
  });
});

describe('actor selection', () => {
  beforeEach(() => resetStores());

  it('selectActor adds actor to selection', () => {
    selectActor('a1');
    expect(get(selectedActorIds).has('a1')).toBe(true);
  });

  it('deselectActor removes actor from selection', () => {
    selectActor('a1');
    deselectActor('a1');
    expect(get(selectedActorIds).has('a1')).toBe(false);
  });

  it('toggleActorSelection adds then removes', () => {
    toggleActorSelection('a1');
    expect(get(selectedActorIds).has('a1')).toBe(true);

    toggleActorSelection('a1');
    expect(get(selectedActorIds).has('a1')).toBe(false);
  });

  it('clearSelection empties the set', () => {
    selectActor('a1');
    selectActor('a2');
    clearSelection();
    expect(get(selectedActorIds).size).toBe(0);
  });

  it('multiple actors can be selected', () => {
    selectActor('a1');
    selectActor('a2');
    expect(get(selectedActorIds).size).toBe(2);
  });

  it('deselectActor on non-selected actor is a no-op', () => {
    deselectActor('nonexistent');
    expect(get(selectedActorIds).size).toBe(0);
  });
});

describe('selectedActors derived store', () => {
  beforeEach(() => resetStores());

  it('returns full actor data for selected IDs', async () => {
    await connect('http://localhost:30000', 'tok123');
    await fetchActorDetails('a1');
    selectActor('a1');

    const actors = get(selectedActors);
    expect(actors).toHaveLength(1);
    expect(actors[0]?.name).toBe('Gandalf');
  });

  it('returns empty when selected IDs have no cached data', () => {
    selectActor('a1');
    // No fetchActorDetails called, so cache is empty
    expect(get(selectedActors)).toEqual([]);
  });

  it('filters out uncached actors from selection', async () => {
    await connect('http://localhost:30000', 'tok123');
    await fetchActorDetails('a1');
    selectActor('a1');
    selectActor('a2'); // a2 not fetched

    const actors = get(selectedActors);
    expect(actors).toHaveLength(1);
    expect(actors[0]?.id).toBe('a1');
  });
});

describe('disconnect()', () => {
  it('resets all state', async () => {
    await connect('http://localhost:30000', 'tok123');
    await fetchActors();
    selectActor('a1');

    disconnect();

    expect(get(isConnected)).toBe(false);
    expect(get(connection).status).toBe('disconnected');
    expect(get(actorsList)).toEqual([]);
    expect(get(selectedActorIds).size).toBe(0);
    expect(get(selectedActors)).toEqual([]);
  });
});

describe('importActorJson()', () => {
  beforeEach(() => resetStores());

  it('imports a valid actor JSON and updates stores', () => {
    const actor = {
      id: 'imported-1',
      name: 'Bilbo Baggins',
      type: 'character',
      img: 'bilbo.png',
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

    const result = importActorJson(JSON.stringify(actor));
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Bilbo Baggins');

    const actors = get(actorsList);
    expect(actors.some((a) => a.id === 'imported-1')).toBe(true);

    expect(get(selectedActorIds).has('imported-1')).toBe(true);

    const conn = get(connection);
    expect(conn.status).toBe('connected');
    expect(conn.serverInfo?.module).toBe('import');
  });

  it('returns null for invalid JSON', () => {
    const result = importActorJson('{invalid}');
    expect(result).toBeNull();
  });

  it('returns null when id is missing', () => {
    const actor = { name: 'No ID', type: 'character' };
    const result = importActorJson(JSON.stringify(actor));
    expect(result).toBeNull();
  });

  it('returns null when name is missing', () => {
    const actor = { id: 'some-id', type: 'character' };
    const result = importActorJson(JSON.stringify(actor));
    expect(result).toBeNull();
  });

  it('does not duplicate actors already in the list', () => {
    const actor = {
      id: 'dup-1',
      name: 'Dup Actor',
      type: 'character',
      img: '',
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
    const json = JSON.stringify(actor);
    importActorJson(json);
    importActorJson(json);

    const actors = get(actorsList);
    expect(actors.filter((a) => a.id === 'dup-1')).toHaveLength(1);
  });

  it('uses actor._meta.systemId in serverInfo', () => {
    const actor = {
      id: 'sys-1',
      name: 'System Actor',
      type: 'character',
      img: '',
      system: {},
      items: [],
      effects: [],
      flags: {},
      prototypeToken: {},
      _meta: {
        systemId: 'pf2e',
        systemVersion: '5.0.0',
        foundryVersion: '12.0.0',
        exportedAt: '2026-01-01T00:00:00Z',
      },
    };
    importActorJson(JSON.stringify(actor));
    const conn = get(connection);
    expect(conn.serverInfo?.system.id).toBe('pf2e');
  });

  it('uses unknown as fallback system id when _meta is absent', () => {
    const actor = {
      id: 'no-meta-1',
      name: 'No Meta',
      type: 'character',
      img: '',
      system: {},
      items: [],
      effects: [],
      flags: {},
      prototypeToken: {},
    };
    importActorJson(JSON.stringify(actor));
    const conn = get(connection);
    expect(conn.serverInfo?.system.id).toBe('unknown');
  });
});

describe('connectViaRelay()', () => {
  beforeEach(() => {
    resetStores();
    relayShouldFail = false;
  });

  it('connects successfully via relay and sets status to connected', async () => {
    const result = await connectViaRelay('relay-session', 'relay-token');
    expect(result).toBe(true);

    const conn = get(connection);
    expect(conn.status).toBe('connected');
    expect(conn.serverInfo?.world).toBe('relay-world');
    expect(conn.error).toBeNull();
  });

  it('sets status to error when relay connection fails', async () => {
    relayShouldFail = true;
    const result = await connectViaRelay('relay-session', 'relay-token');
    expect(result).toBe(false);

    const conn = get(connection);
    expect(conn.status).toBe('error');
    expect(conn.error).toBeTruthy();
    relayShouldFail = false;
  });
});

describe('fetchActors() error path', () => {
  beforeEach(() => resetStores());

  it('sets actorsList to empty array when connector throws', async () => {
    connection.set({
      connector: {
        getActors: vi.fn().mockRejectedValue(new Error('fail')),
        getActor: vi.fn().mockRejectedValue(new Error('fail')),
      } as unknown as never,
      serverInfo: null,
      status: 'connected',
      error: null,
    });

    await fetchActors();
    expect(get(actorsList)).toEqual([]);
  });
});

describe('fetchActorDetails() error path', () => {
  beforeEach(() => resetStores());

  it('returns null when connector throws', async () => {
    connection.set({
      connector: {
        getActors: vi.fn().mockRejectedValue(new Error('fail')),
        getActor: vi.fn().mockRejectedValue(new Error('fail')),
      } as unknown as never,
      serverInfo: null,
      status: 'connected',
      error: null,
    });

    const result = await fetchActorDetails('some-id');
    expect(result).toBeNull();
  });
});
