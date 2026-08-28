// Password hashing using PBKDF2-SHA256 via Web Crypto.
// Works in both Bun (dev) and Cloudflare Workers (prod).
// Format: pbkdf2-sha256$<iterations>$<salt-b64url>$<hash-b64url>

const PREFIX = 'pbkdf2-sha256';
const DEFAULT_ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

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

export async function hashPassword(
	password: string,
	iterations = DEFAULT_ITERATIONS
): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const key = await deriveKey(password, salt, iterations);
	return `${PREFIX}$${iterations}$${toBase64Url(salt)}$${toBase64Url(key)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const parts = stored.split('$');
	if (parts.length !== 4 || parts[0] !== PREFIX) return false;
	const iterations = Number(parts[1]);
	if (!Number.isInteger(iterations) || iterations <= 0) return false;
	const salt = fromBase64Url(parts[2]);
	const expected = fromBase64Url(parts[3]);
	const actual = await deriveKey(password, salt, iterations);
	return timingSafeEqual(actual, expected);
}

async function deriveKey(
	password: string,
	salt: Uint8Array,
	iterations: number
): Promise<Uint8Array> {
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(password),
		'PBKDF2',
		false,
		['deriveBits']
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
		keyMaterial,
		KEY_LENGTH * 8
	);
	return new Uint8Array(bits);
}
