const SUPPORTED = ['ja', 'ko'] as const;
export type Lang = (typeof SUPPORTED)[number];

export function getActiveLang(cookies: { get: (name: string) => string | undefined }): Lang {
	const raw = cookies.get('lang');
	return SUPPORTED.includes(raw as Lang) ? (raw as Lang) : 'ja';
}
