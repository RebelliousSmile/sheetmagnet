/**
 * Sheet Magnet Relay Server
 *
 * Bridges the Sheet Magnet PWA and the Foundry VTT module via WebSocket.
 * Useful when direct socket.io access is blocked (e.g. Forge VTT).
 *
 * Protocol:
 *   ws://relay.sheet-magnet.app?session=<uuid>&role=pwa|foundry
 *
 * Two clients sharing the same session ID are paired.
 * Messages from one are forwarded to the other as-is (JSON strings).
 *
 * Sessions expire after IDLE_TIMEOUT_MS of inactivity.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';

const PORT = process.env.PORT || 3001;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// sessions: Map<sessionId, { pwa?: WebSocket, foundry?: WebSocket, timer: NodeJS.Timeout }>
const sessions = new Map();

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }));
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server: httpServer });

function resetTimer(session, sessionId) {
  clearTimeout(session.timer);
  session.timer = setTimeout(() => {
    console.log(`[relay] Session ${sessionId} expired`);
    session.pwa?.close(1000, 'Session expired');
    session.foundry?.close(1000, 'Session expired');
    sessions.delete(sessionId);
  }, IDLE_TIMEOUT_MS);
}

function forward(from, to, data) {
  if (to?.readyState === WebSocket.OPEN) {
    to.send(data);
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const sessionId = url.searchParams.get('session');
  const role = url.searchParams.get('role'); // 'pwa' or 'foundry'

  if (!sessionId || !['pwa', 'foundry'].includes(role)) {
    ws.close(1008, 'Missing or invalid session/role');
    return;
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, { pwa: null, foundry: null, timer: null });
  }

  const session = sessions.get(sessionId);

  if (session[role]?.readyState === WebSocket.OPEN) {
    ws.close(1008, `Role ${role} already connected for this session`);
    return;
  }

  session[role] = ws;
  resetTimer(session, sessionId);
  console.log(`[relay] ${role} joined session ${sessionId} (sessions: ${sessions.size})`);

  // Notify the other side that the peer connected
  const peer = role === 'pwa' ? session.foundry : session.pwa;
  forward(ws, peer, JSON.stringify({ type: 'peer_connected', role }));
  if (peer?.readyState === WebSocket.OPEN) {
    forward(peer, ws, JSON.stringify({ type: 'peer_connected', role: role === 'pwa' ? 'foundry' : 'pwa' }));
  }

  ws.on('message', (data) => {
    resetTimer(session, sessionId);
    const other = role === 'pwa' ? session.foundry : session.pwa;
    forward(ws, other, data);
  });

  ws.on('close', () => {
    session[role] = null;
    const other = role === 'pwa' ? session.foundry : session.pwa;
    forward(ws, other, JSON.stringify({ type: 'peer_disconnected', role }));
    console.log(`[relay] ${role} left session ${sessionId}`);

    // Clean up if both gone
    if (!session.pwa && !session.foundry) {
      clearTimeout(session.timer);
      sessions.delete(sessionId);
      console.log(`[relay] Session ${sessionId} removed`);
    }
  });

  ws.on('error', (err) => {
    console.error(`[relay] Error (${role}, ${sessionId}):`, err.message);
  });
});

httpServer.listen(PORT, () => {
  console.log(`[relay] Sheet Magnet relay listening on port ${PORT}`);
});
