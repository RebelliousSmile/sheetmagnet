/**
 * Session Store - Memory only, zero persistence
 * Holds connection state and cached actor data for current session
 */

import { writable, derived, get } from 'svelte/store';
import type { 
  FoundryServerInfo, 
  ActorSummary, 
  ActorData 
} from '$lib/connectors/foundry';
import { FoundryConnector } from '$lib/connectors/foundry';

// Connection state
interface ConnectionState {
  connector: FoundryConnector | null;
  serverInfo: FoundryServerInfo | null;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: string | null;
}

const initialConnectionState: ConnectionState = {
  connector: null,
  serverInfo: null,
  status: 'disconnected',
  error: null
};

export const connection = writable<ConnectionState>(initialConnectionState);

// Actors list (fetched from Foundry)
export const actorsList = writable<ActorSummary[]>([]);

// Selected actors for export
export const selectedActorIds = writable<Set<string>>(new Set());

// Cached full actor data (fetched on demand)
const actorCache = writable<Map<string, ActorData>>(new Map());

// Derived: selected actors with full data
export const selectedActors = derived(
  [selectedActorIds, actorCache],
  ([$ids, $cache]) => {
    return Array.from($ids)
      .map(id => $cache.get(id))
      .filter((a): a is ActorData => a !== undefined);
  }
);

// Derived: is connected
export const isConnected = derived(
  connection,
  $conn => $conn.status === 'connected'
);

// Actions
export async function connect(url: string, token: string): Promise<boolean> {
  connection.update(s => ({ ...s, status: 'connecting', error: null }));
  
  try {
    const connector = FoundryConnector.fromManualInput(url, token);
    const serverInfo = await connector.connect();
    
    connection.set({
      connector,
      serverInfo,
      status: 'connected',
      error: null
    });
    
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    connection.set({
      connector: null,
      serverInfo: null,
      status: 'error',
      error: message
    });
    return false;
  }
}

export async function connectFromEncoded(encoded: string): Promise<boolean> {
  connection.update(s => ({ ...s, status: 'connecting', error: null }));
  
  try {
    const connector = FoundryConnector.fromEncodedData(encoded);
    const serverInfo = await connector.connect();
    
    connection.set({
      connector,
      serverInfo,
      status: 'connected',
      error: null
    });
    
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed';
    connection.set({
      connector: null,
      serverInfo: null,
      status: 'error',
      error: message
    });
    return false;
  }
}

export async function fetchActors(): Promise<void> {
  const conn = get(connection);
  if (!conn.connector) return;
  
  try {
    const result = await conn.connector.getActors();
    actorsList.set(result.actors);
  } catch (err) {
    console.error('Failed to fetch actors:', err);
    actorsList.set([]);
  }
}

export async function fetchActorDetails(actorId: string): Promise<ActorData | null> {
  const conn = get(connection);
  if (!conn.connector) return null;
  
  // Check cache first
  const cached = get(actorCache).get(actorId);
  if (cached) return cached;
  
  try {
    const actor = await conn.connector.getActor(actorId);
    actorCache.update(cache => {
      cache.set(actorId, actor);
      return cache;
    });
    return actor;
  } catch (err) {
    console.error('Failed to fetch actor:', err);
    return null;
  }
}

export function toggleActorSelection(actorId: string): void {
  selectedActorIds.update(ids => {
    const newIds = new Set(ids);
    if (newIds.has(actorId)) {
      newIds.delete(actorId);
    } else {
      newIds.add(actorId);
    }
    return newIds;
  });
}

export function selectActor(actorId: string): void {
  selectedActorIds.update(ids => new Set(ids).add(actorId));
}

export function deselectActor(actorId: string): void {
  selectedActorIds.update(ids => {
    const newIds = new Set(ids);
    newIds.delete(actorId);
    return newIds;
  });
}

export function clearSelection(): void {
  selectedActorIds.set(new Set());
}

export function disconnect(): void {
  connection.set(initialConnectionState);
  actorsList.set([]);
  selectedActorIds.set(new Set());
  actorCache.set(new Map());
}
