// Servision Scout — backend
// Node.js + Express + better-sqlite3

const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'scout.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    neighborhood TEXT,
    type TEXT DEFAULT 'independent',
    address TEXT,
    status TEXT DEFAULT 'prospect',
    modern_score INTEGER DEFAULT 0,
    owner_name TEXT,
    contact TEXT,
    next_action TEXT,
    next_action_date TEXT,
    notes TEXT,
    lat REAL,
    lng REAL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    body TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE INDEX IF NOT EXISTS idx_interactions_client ON interactions(client_id);
`);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- helpers --------------------------------------------------------

const getInteractionsStmt = db.prepare(
  'SELECT id, kind, body, created_at FROM interactions WHERE client_id = ? ORDER BY created_at DESC, id DESC'
);

function attachInteractions(client) {
  if (!client) return client;
  client.interactions = getInteractionsStmt.all(client.id);
  return client;
}

const CLIENT_FIELDS = [
  'name', 'neighborhood', 'type', 'address', 'status', 'modern_score',
  'owner_name', 'contact', 'next_action', 'next_action_date', 'notes', 'lat', 'lng',
];

function normalizePayload(body) {
  const out = {};
  for (const f of CLIENT_FIELDS) {
    out[f] = body[f] === undefined ? null : body[f];
  }
  if (!out.type) out.type = 'independent';
  if (!out.status) out.status = 'prospect';
  out.modern_score = out.modern_score == null ? 0 : parseInt(out.modern_score, 10) || 0;
  out.lat = out.lat === '' || out.lat == null ? null : parseFloat(out.lat);
  out.lng = out.lng === '' || out.lng == null ? null : parseFloat(out.lng);
  return out;
}

// --- routes ----------------------------------------------------------

app.get('/api/clients', (req, res) => {
  const rows = db.prepare('SELECT * FROM clients ORDER BY created_at DESC').all();
  rows.forEach(attachInteractions);
  res.json(rows);
});

app.get('/api/clients/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(attachInteractions(row));
});

app.post('/api/clients', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name is required' });
  const p = normalizePayload(req.body);
  p.name = name;
  const stmt = db.prepare(`
    INSERT INTO clients
      (name, neighborhood, type, address, status, modern_score, owner_name, contact,
       next_action, next_action_date, notes, lat, lng)
    VALUES
      (@name, @neighborhood, @type, @address, @status, @modern_score, @owner_name, @contact,
       @next_action, @next_action_date, @notes, @lat, @lng)
  `);
  const info = stmt.run(p);
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(attachInteractions(row));
});

app.put('/api/clients/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'not found' });
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name is required' });
  const p = normalizePayload(req.body);
  p.name = name;
  p.id = req.params.id;
  db.prepare(`
    UPDATE clients SET
      name=@name, neighborhood=@neighborhood, type=@type, address=@address, status=@status,
      modern_score=@modern_score, owner_name=@owner_name, contact=@contact,
      next_action=@next_action, next_action_date=@next_action_date, notes=@notes,
      lat=@lat, lng=@lng, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
    WHERE id=@id
  `).run(p);
  const row = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  res.json(attachInteractions(row));
});

app.delete('/api/clients/:id', (req, res) => {
  const info = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

app.post('/api/clients/:id/interactions', (req, res) => {
  const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'not found' });
  const kind = (req.body.kind || 'note').trim();
  const bodyText = (req.body.body || '').trim();
  if (!bodyText) return res.status(400).json({ error: 'body is required' });
  const info = db.prepare(
    'INSERT INTO interactions (client_id, kind, body) VALUES (?, ?, ?)'
  ).run(req.params.id, kind, bodyText);
  const row = db.prepare('SELECT id, kind, body, created_at FROM interactions WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS n FROM clients').get().n;
  const byStatus = db.prepare(
    'SELECT status, COUNT(*) AS n FROM clients GROUP BY status'
  ).all();
  res.json({ total, byStatus });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servision Scout listening on port ${PORT} (DB: ${DB_PATH})`);
});
