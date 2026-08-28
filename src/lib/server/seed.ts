import { eq } from 'drizzle-orm';
import { db } from './db';
import { INITIAL_CATEGORIES } from './posts';
import { users, categories } from '../../../drizzle/schema';

/**
 * Idempotent seed for MVP baseline data:
 * - 6 approved categories
 *
 * Run manually via: bun run db:seed
 */
export async function seed() {
	for (const cat of INITIAL_CATEGORIES) {
		const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
		if (existing.length === 0) {
			await db.insert(categories).values(cat);
			console.log(`[seed] category: ${cat.name}`);
		}
	}

	const userCount = await db.select().from(users);
	if (userCount.length === 0) {
		console.warn(
			'[seed] NO owner user created: the owner is provisioned via ADMIN_PASSWORD_HASH env (single-creator MVP).'
		);
	}
	console.log('[seed] done.');
}

if (process.argv[1]?.endsWith('seed.ts')) {
	seed()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error(err);
			process.exit(1);
		});
}
