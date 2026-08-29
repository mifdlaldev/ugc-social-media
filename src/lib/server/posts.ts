import { desc, eq } from 'drizzle-orm';
import { db } from './db';
import { posts } from '../../../drizzle/schema';

export async function listPublishedPosts() {
	return db
		.select()
		.from(posts)
		.where(eq(posts.status, 'published'))
		.orderBy(desc(posts.published_at ?? posts.created_at));
}

export async function getPublishedPostById(id: number) {
	const [row] = await db.select().from(posts).where(eq(posts.id, id));
	if (!row || row.status !== 'published') return null;
	return row;
}

export async function getOwnerPostById(id: number) {
	const [row] = await db.select().from(posts).where(eq(posts.id, id));
	return row ?? null;
}

export async function listAllPosts() {
	return db.select().from(posts).orderBy(desc(posts.updated_at));
}
