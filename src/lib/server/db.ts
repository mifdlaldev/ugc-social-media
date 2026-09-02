import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import * as schema from '../../../drizzle/schema';
import { config } from './config';

/**
 * Database client selection:
 * - Production (Cloudflare Workers): D1 binding from platform.env
 * - Local dev / tests: local SQLite file via @libsql/client (works in Node + Bun)
 *
 * @libsql/client + drizzle-orm/libsql are NEVER imported at module level because
 * they use native bindings that crash Cloudflare Workers (error 10021). Instead,
 * they are loaded dynamically only when the local dev path is needed.
 *
 * CRITICAL: `getDb()` is a function, not a module-level const, because
 * `config.dbBinding` is populated only AFTER `setPlatformEnv()` runs in
 * hooks.server.ts. A module-level const would evaluate before the env is set,
 * always picking the wrong driver on Workers.
 */
type Db = LibSQLDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
	if (_db) return _db;
	const binding = config.dbBinding;
	if (binding) {
		_db = drizzleD1(binding, { schema }) as unknown as Db;
		return _db;
	}
	throw new Error('No D1 binding. Use bun dev for local development (which uses @libsql/client via process.env).');
}

/**
 * Compatibility export so every existing `import { db }` keeps working.
 * Returns a Proxy whose property access resolves to `getDb()` lazily,
 * so the correct driver (D1 on Workers, libsql locally) is always used.
 */
export const db: Db = new Proxy({} as Db, {
	get: (_t, prop) => {
		const instance = getDb() as unknown as Record<PropertyKey, unknown>;
		return instance[prop];
	}
});