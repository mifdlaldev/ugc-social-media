import { eq } from 'drizzle-orm';
import { db } from './db';
import { INITIAL_CATEGORIES } from './posts';
import { INITIAL_PRESETS } from './presets';
import { users, categories, prompt_presets } from '../../../drizzle/schema';

/**
 * Idempotent seed for MVP baseline data:
 * - 6 approved categories
 * - 3 approved prompt presets
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

	for (const preset of INITIAL_PRESETS) {
		const existing = await db
			.select()
			.from(prompt_presets)
			.where(eq(prompt_presets.slug, preset.slug));
		if (existing.length === 0) {
			await db.insert(prompt_presets).values(preset);
			console.log(`[seed] preset: ${preset.name}`);
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
