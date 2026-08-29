// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: import('$lib/server/session').SessionPayload | null;
		}

		interface Platform {
			env: {
				DATABASE_URL: string;
				OPENROUTER_API_KEY: string;
				OPENROUTER_MODEL: string;
				SESSION_SECRET: string;
				ADMIN_PASSWORD_HASH: string;
				DB: D1Database;
			};
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf: CfProperties;
		}
	}
}

export {};
