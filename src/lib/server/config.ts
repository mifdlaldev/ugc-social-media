// Central runtime configuration accessor.
// Reads from Cloudflare platform env (production/wrangler) with process.env fallback (Bun dev).

type AppEnv = {
	DATABASE_URL?: string;
	LLM_BASE_URL?: string;
	LLM_API_KEY?: string;
	LLM_MODEL?: string;
	SESSION_SECRET?: string;
	ADMIN_PASSWORD_HASH?: string;
	YOU_API_KEY?: string;
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
	get llmBaseUrl(): string {
		return (value('LLM_BASE_URL') ?? 'https://thefreelance.duckdns.org/v1').replace(/\/+$/, '');
	},
	get llmApiKey(): string {
		const v = value('LLM_API_KEY');
		if (!v) throw new Error('LLM_API_KEY is not configured');
		return v;
	},
	get llmModel(): string {
		const v = value('LLM_MODEL');
		if (!v) throw new Error('LLM_MODEL is not configured');
		return v;
	},
	get youApiKey(): string {
		const v = value('YOU_API_KEY');
		if (!v) throw new Error('YOU_API_KEY is not configured');
		return v;
	},
	get databaseUrl(): string {
		return value('DATABASE_URL') ?? 'file:./data/local.db';
	},
	get dbBinding(): D1Database | undefined {
		return platformEnv?.DB;
	}
};
