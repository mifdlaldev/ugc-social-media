import { db } from './db';
import { users } from '../../../drizzle/schema';

export async function seed() {
	const existing = await db.select().from(users);
	if (existing.length === 0) {
		const [created] = await db
			.insert(users)
			.values({
				email: 'owner@localhost',
				password_hash: 'placeholder',
				role: 'owner'
			})
			.returning();
		console.log(`[seed] owner user created (id=${created?.id})`);
	} else {
		console.log(`[seed] ${existing.length} user(s) already exist, skipping`);
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
