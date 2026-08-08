import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'agent.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS kv_state (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    createdAt TEXT,
    topic TEXT,
    text TEXT,
    text_hi TEXT,
    rationale TEXT,
    rationale_hi TEXT,
    sources TEXT,
    paper TEXT,
    confidenceScore REAL,
    threadedToId TEXT,
    structuredEntities TEXT,
    beliefImpact TEXT,
    contradiction INTEGER,
    auditTrail TEXT
  );

  CREATE TABLE IF NOT EXISTS rejections (
    id TEXT PRIMARY KEY,
    createdAt TEXT,
    status TEXT,
    topic TEXT,
    reason TEXT,
    auditTrail TEXT,
    scoreBreakdown TEXT
  );

  CREATE TABLE IF NOT EXISTS beliefs (
    id TEXT PRIMARY KEY,
    statement TEXT,
    strength INTEGER
  );

  CREATE TABLE IF NOT EXISTS timeline (
    id INTEGER PRIMARY KEY,
    status TEXT,
    topic TEXT,
    reason TEXT
  );

  CREATE TABLE IF NOT EXISTS history (
    paperKey TEXT PRIMARY KEY,
    hitCount INTEGER,
    lastEvaluated INTEGER,
    lastPostId TEXT
  );
`);

// Helper to initialize default beliefs if empty
const countBeliefs = db.prepare('SELECT COUNT(*) as count FROM beliefs').get();
if (countBeliefs.count === 0) {
  const insertBelief = db.prepare('INSERT INTO beliefs (id, statement, strength) VALUES (?, ?, ?)');
  insertBelief.run('b1', 'Open source models face higher poisoning risk', 75);
  insertBelief.run('b2', 'API-only access is sufficient defense', 30);
  insertBelief.run('b3', 'RAG creates critical authorization bypasses', 80);
}

export default db;
