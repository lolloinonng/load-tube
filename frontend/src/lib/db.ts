import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

let db: ReturnType<typeof createClient> | null = null;

function getDb() {
  if (!db) {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;
    if (tursoUrl && authToken) {
      db = createClient({ url: tursoUrl, authToken });
    } else {
      db = createClient({ url: 'file:/tmp/dev.db' });
    }
  }
  return db;
}

export async function initDb() {
  const client = getDb();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      format TEXT NOT NULL,
      quality TEXT NOT NULL,
      file_size INTEGER,
      status TEXT DEFAULT 'completed',
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      google_id TEXT,
      role TEXT DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id TEXT PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT,
      ip TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const existing = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [adminEmail] });
    if (existing.rows.length === 0) {
      await client.execute({
        sql: 'INSERT INTO users (id, email, role) VALUES (?, ?, ?)',
        args: [uuidv4(), adminEmail, 'admin'],
      });
    }
  }
}

export function getClient() {
  return getDb();
}
