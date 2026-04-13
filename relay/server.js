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
import nodemailer from 'nodemailer';

const PORT = process.env.PORT || 3001;
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://sheetmag.net';
// Static token shared with the frontend — must match CONTACT_TOKEN env var on both sides.
// If not set, contact endpoint is disabled (fail-safe).
const CONTACT_TOKEN = process.env.CONTACT_TOKEN || '';

// ── SMTP (Alwaysdata) ───────────────────────────────────────────────────────
const smtpTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.alwaysdata.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER, // e.g. ecrire.a@scriptami.com
    pass: process.env.SMTP_PASS,
  },
});

// ── Rate limiting (per IP, in-memory) ─────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 3; // max 3 contact submissions per hour per IP
const rateLimitMap = new Map(); // ip → { count, resetAt }

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Cleanup rate limit map every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);

// ── Input validation ───────────────────────────────────────────────────────
const VALID_SUBJECTS = ['bug', 'feature', 'system', 'partnership', 'other'];

function sanitize(str) {
  return String(str)
    .replace(/<[^>]*>/g, '')       // strip HTML tags
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // control chars
    .trim();
}

function validateEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str);
}

function validateContact({ subject, name, email, message, honeypot }) {
  if (honeypot) return 'honeypot';
  if (!VALID_SUBJECTS.includes(subject)) return 'invalid_subject';
  if (!name || sanitize(name).length < 2 || sanitize(name).length > 100) return 'invalid_name';
  if (!validateEmail(String(email).trim())) return 'invalid_email';
  const msg = sanitize(message);
  if (msg.length < 20 || msg.length > 2000) return 'invalid_message';
  return null;
}

// sessions: Map<sessionId, { pwa?: WebSocket, foundry?: WebSocket, timer: NodeJS.Timeout }>
const sessions = new Map();

const httpServer = createServer((req, res) => {
  // CORS headers for all responses
  const origin = req.headers.origin || '';
  const allowedOrigin = origin === ALLOWED_ORIGIN ? origin : '';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Contact-Token');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }));
    return;
  }

  if (req.url === '/contact' && req.method === 'POST') {
    // Reject requests from unexpected origins (browser-level guard)
    if (!allowedOrigin) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden' }));
      return;
    }

    // Static token check — guards against non-browser bots that can forge Origin
    const providedToken = req.headers['x-contact-token'] || '';
    if (!CONTACT_TOKEN || providedToken !== CONTACT_TOKEN) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'forbidden' }));
      return;
    }

    // Use the LAST value in X-Forwarded-For (added by Railway's trusted proxy),
    // not the first (which is attacker-controlled). Fall back to socket address.
    const xForwardedFor = req.headers['x-forwarded-for'];
    const ip = xForwardedFor
      ? xForwardedFor.split(',').at(-1)?.trim() ?? 'unknown'
      : req.socket.remoteAddress || 'unknown';

    if (!checkRateLimit(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'rate_limited' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 8_000) { req.destroy(); } // guard oversized payloads
    });
    req.on('end', async () => {
      let data;
      try { data = JSON.parse(body); }
      catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'invalid_json' }));
        return;
      }

      const validationError = validateContact(data);
      if (validationError) {
        // honeypot: pretend success to not reveal detection
        if (validationError === 'honeypot') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: validationError }));
        return;
      }

      const cleanName    = sanitize(data.name);
      const cleanEmail   = String(data.email).trim();
      const cleanMessage = sanitize(data.message);
      const cleanSubject = data.subject;

      try {
        await smtpTransport.sendMail({
          from: `"sheetmag.net contact" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_TO || process.env.SMTP_USER,
          replyTo: cleanEmail,
          subject: `[sheetmag.net] ${cleanSubject} — ${cleanName}`,
          text: `Sujet : ${cleanSubject}\nNom : ${cleanName}\nEmail : ${cleanEmail}\n\n${cleanMessage}`,
          html: `<p><strong>Sujet :</strong> ${cleanSubject}</p>
<p><strong>Nom :</strong> ${cleanName}</p>
<p><strong>Email :</strong> <a href="mailto:${cleanEmail}">${cleanEmail}</a></p>
<hr>
<p style="white-space:pre-wrap">${cleanMessage}</p>`,
        });

        console.log(`[contact] Message from ${cleanEmail} (${cleanSubject}) — ip: ${ip}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('[contact] SMTP error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'smtp_error' }));
      }
    });
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
