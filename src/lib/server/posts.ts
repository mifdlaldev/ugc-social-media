import { desc } from 'drizzle-orm';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { posts } from '../../../drizzle/schema';

export async function getOwnerPostById(id: number) {
	const [row] = await db.select().from(posts).where(eq(posts.id, id));
	return row ?? null;
}

export async function listAllPosts() {
	return db.select().from(posts).orderBy(desc(posts.updated_at));
}