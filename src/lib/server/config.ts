// Central runtime configuration accessor.
// Reads from Cloudflare platform env (production/wrangler) with process.env fallback (Bun dev).

type AppEnv = {
	DATABASE_URL?: string;
	OPENROUTER_API_KEY?: string;
	OPENROUTER_MODEL?: string;
	SESSION_SECRET?: string;
	ADMIN_PASSWORD_HASH?: string;
	ALLOWED_ORIGINS?: string;
	DB?: D1Database;
};

let platformEnv: Partial<AppEnv> | null = null;

export function setPlatformEnv(env: Partial<AppEnv> | null | undefined) {
	platformEnv = env ?? null;
}

function value(key: keyof AppEnv): string | undefined {
	const fromPlatform = platformEnv?.[key];
	if (typeof fromPlatform === 'string' && fromPlatform.length > 0) return fromPlatform;
	const fromProcess = process.env[key];
	return fromProcess && fromProcess.length > 0 ? fromProcess : undefined;
}

export const config = {
	get sessionSecret(): string {
		const v = value('SESSION_SECRET');
		if (!v) throw new Error('SESSION_SECRET is not configured');
		return v;
	},
	get adminPasswordHash(): string {
		const v = value('ADMIN_PASSWORD_HASH');
		if (!v) throw new Error('ADMIN_PASSWORD_HASH is not configured');
		return v;
	},
	get openRouterApiKey(): string {
		const v = value('OPENROUTER_API_KEY');
		if (!v) throw new Error('OPENROUTER_API_KEY is not configured');
		return v;
	},
	get openRouterModel(): string {
		return value('OPENROUTER_MODEL') ?? 'openrouter/auto';
	},
	get databaseUrl(): string {
		return value('DATABASE_URL') ?? 'file:./data/local.db';
	},
	get dbBinding(): D1Database | undefined {
		return platformEnv?.DB;
	}
};
