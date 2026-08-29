import { db } from './db';
import { users } from '../../../drizzle/schema';

export async function seed() {
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
