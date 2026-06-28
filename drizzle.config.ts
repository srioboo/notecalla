import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const isLocal = url.startsWith('file:');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: isLocal ? 'sqlite' : 'turso',
	dbCredentials: isLocal
		? { url }
		: { url, authToken: process.env.DATABASE_AUTH_TOKEN! },
	verbose: true,
	strict: true
});
