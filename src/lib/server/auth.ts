import { config } from './config';
import { verifyPassword } from './password';
import { createSession, readSessionCookie, verifySession, type SessionPayload } from './session';

export async function loginOwner(
	password: string
): Promise<{ token: string; cookie: string; expiresAt: Date }> {
	const ok = await verifyPassword(password, config.adminPasswordHash);
	if (!ok) throw new Error('INVALID_CREDENTIALS');
	return createSession(config.sessionSecret);
}

export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
	const token = readSessionCookie(request.headers.get('cookie'));
	if (!token) return null;
	return verifySession(config.sessionSecret, token);
}

export async function requireOwner(request: Request): Promise<SessionPayload> {
	const session = await getSessionFromRequest(request);
	if (!session) throw new Error('UNAUTHORIZED');
	return session;
}

export function isUnauthorizedError(error: unknown): boolean {
	return (
		error instanceof Error &&
		(error.message === 'UNAUTHORIZED' || error.message === 'INVALID_CREDENTIALS')
	);
}
