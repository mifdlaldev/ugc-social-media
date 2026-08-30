import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { posts, users } from '../../../drizzle/schema';

export async function getOwnerPostById(id: string) {
	const [row] = await db.select().from(posts).where(eq(posts.id, id));
	return row ?? null;
}

export async function listAllPosts() {
	return db.select().from(posts).orderBy(desc(posts.updated_at));
}

/** Resolves the single owner account id (single-creator MVP). */
export async function getOwnerId(): Promise<string> {
	const [row] = await db.select({ id: users.id }).from(users).limit(1);
	if (!row) throw new Error('OWNER_USER_NOT_SEEDED');
	return row.id;
}
