import { Database } from 'bun:sqlite';
const db = new Database('data/local.db');
const cols = db.query('PRAGMA table_info(posts)').all().map((c) => c.name);
console.log('style_lock_enabled ada:', cols.includes('style_lock_enabled'));
const migs = db.query('SELECT tag FROM __drizzle_migrations').all();
console.log('migrasi tercatat:', migs.map((m) => m.tag).join(', '));
