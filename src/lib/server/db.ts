import { resolve } from 'node:path';
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../../drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL ?? 'file:./data/local.db';
const rawPath = DATABASE_URL.replace(/^file:/, '');
const path = resolve(process.cwd(), rawPath);

const sqlite = new Database(path, { create: true });
export const db = drizzle(sqlite, { schema });
