import { createClient, type Client } from '@libsql/client';
import { drizzle as drizzleLibsql, type LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import * as schema from '../../../drizzle/schema';
import { config } from './config';

/**
 * Database client selection:
 * - Production (Cloudflare Workers): D1 binding from platform.env
 * - Local dev / tests: local SQLite file via @libsql/client (works in Node + Bun)
 *
 * `bun:sqlite` is intentionally NOT used here because Vite SSR runs on Node,
 * whose ESM loader rejects the `bun:` scheme.
 *
 * Both drivers implement the same Drizzle query-builder interface, so a single
 * `LibSQLDatabase<typeof schema>` type keeps all call sites type-safe.
 */
type Db = LibSQLDatabase<typeof schema>;

function createDb(): Db {
	const binding = config.dbBinding;
	if (binding) {
		return drizzleD1(binding, { schema }) as unknown as Db;
	}
	const client: Client = createClient({ url: config.databaseUrl });
	return drizzleLibsql(client, { schema });
}

export const db: Db = createDb();
