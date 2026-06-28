import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

// file: URLs (local dev) don't need an auth token
const authToken = env.DATABASE_URL.startsWith('file:') ? undefined : env.DATABASE_AUTH_TOKEN;
if (!authToken && !env.DATABASE_URL.startsWith('file:')) {
	throw new Error('DATABASE_AUTH_TOKEN is not set');
}

const client = createClient({ url: env.DATABASE_URL, authToken });

export const db = drizzle(client, { schema });
