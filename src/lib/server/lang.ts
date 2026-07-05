import { db } from '$lib/server/db/index';
import { languages } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const SUPPORTED = ['ja', 'ko'] as const;
export type Lang = (typeof SUPPORTED)[number];

export function getActiveLang(cookies: { get: (name: string) => string | undefined }): Lang {
	const raw = cookies.get('lang');
	return SUPPORTED.includes(raw as Lang) ? (raw as Lang) : 'ja';
}

export async function getLangId(code: Lang): Promise<string> {
	const lang = await db.query.languages.findFirst({ where: eq(languages.code, code) });
	if (!lang) throw new Error(`Language not found: ${code}`);
	return lang.id;
}
