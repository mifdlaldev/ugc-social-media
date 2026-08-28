// Signed session cookie using HMAC-SHA256 via Web Crypto.
// Payload: base64url(JSON).signature base64url(HMAC(payload))
// Cookie: HttpOnly, SameSite=Lax, Path=/, Max-Age 7 days, Secure (prod only).

const SESSION_COOKIE = 'ugc_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = {
	sub: 'owner';
	iat: number;
	exp: number;
};

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
	const b64 =
		value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

async function hmac(secret: string, data: Uint8Array): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const sig = await crypto.subtle.sign('HMAC', key, data as BufferSource);
	return new Uint8Array(sig);
}

export async function createSession(
	secret: string
): Promise<{ token: string; cookie: string; expiresAt: Date }> {
	const now = Math.floor(Date.now() / 1000);
	const payload: SessionPayload = { sub: 'owner', iat: now, exp: now + SESSION_TTL_SECONDS };
	const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
	const sig = await hmac(secret, new TextEncoder().encode(body));
	const token = `${body}.${toBase64Url(sig)}`;
	const expiresAt = new Date(payload.exp * 1000);
	return { token, cookie: serializeCookie(token, expiresAt), expiresAt };
}

export async function verifySession(secret: string, token: string): Promise<SessionPayload | null> {
	const [body, sigPart] = token.split('.');
	if (!body || !sigPart) return null;
	const expected = await hmac(secret, new TextEncoder().encode(body));
	if (!timingSafeEqual(expected, fromBase64Url(sigPart))) return null;
	try {
		const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as SessionPayload;
		if (payload.sub !== 'owner') return null;
		if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000))
			return null;
		return payload;
	} catch {
		return null;
	}
}

export function readSessionCookie(header: string | null): string | null {
	if (!header) return null;
	for (const part of header.split(';')) {
		const [name, ...rest] = part.trim().split('=');
		if (name === SESSION_COOKIE) return rest.join('=');
	}
	return null;
}

export function clearSessionCookie(expiredAt = new Date(0)): string {
	return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${expiredAt.toUTCString()}`;
}

export function serializeCookie(token: string, expiresAt: Date): string {
	const isHttps = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
	return [
		`${SESSION_COOKIE}=${token}`,
		'Path=/',
		'HttpOnly',
		'SameSite=Lax',
		isHttps ? 'Secure' : null,
		`Expires=${expiresAt.toUTCString()}`,
		`Max-Age=${SESSION_TTL_SECONDS}`
	]
		.filter(Boolean)
		.join('; ');
}
