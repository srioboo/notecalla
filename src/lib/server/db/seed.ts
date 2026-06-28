import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { languages, decks, cards, deckTags } from './schema';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL ?? 'file:local.db';
const authToken = url.startsWith('file:') ? undefined : process.env.DATABASE_AUTH_TOKEN;
const client = createClient({ url, authToken });
const db = drizzle(client, { schema });

// ── Hiragana ─────────────────────────────────────────────────────────────────
const HIRAGANA: Array<[string, string]> = [
	['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o'],
	['か', 'ka'], ['き', 'ki'], ['く', 'ku'], ['け', 'ke'], ['こ', 'ko'],
	['さ', 'sa'], ['し', 'shi'], ['す', 'su'], ['せ', 'se'], ['そ', 'so'],
	['た', 'ta'], ['ち', 'chi'], ['つ', 'tsu'], ['て', 'te'], ['と', 'to'],
	['な', 'na'], ['に', 'ni'], ['ぬ', 'nu'], ['ね', 'ne'], ['の', 'no'],
	['は', 'ha'], ['ひ', 'hi'], ['ふ', 'fu'], ['へ', 'he'], ['ほ', 'ho'],
	['ま', 'ma'], ['み', 'mi'], ['む', 'mu'], ['め', 'me'], ['も', 'mo'],
	['や', 'ya'], ['ゆ', 'yu'], ['よ', 'yo'],
	['ら', 'ra'], ['り', 'ri'], ['る', 'ru'], ['れ', 're'], ['ろ', 'ro'],
	['わ', 'wa'], ['を', 'wo'], ['ん', 'n']
];

// ── Katakana ──────────────────────────────────────────────────────────────────
const KATAKANA: Array<[string, string]> = [
	['ア', 'a'], ['イ', 'i'], ['ウ', 'u'], ['エ', 'e'], ['オ', 'o'],
	['カ', 'ka'], ['キ', 'ki'], ['ク', 'ku'], ['ケ', 'ke'], ['コ', 'ko'],
	['サ', 'sa'], ['シ', 'shi'], ['ス', 'su'], ['セ', 'se'], ['ソ', 'so'],
	['タ', 'ta'], ['チ', 'chi'], ['ツ', 'tsu'], ['テ', 'te'], ['ト', 'to'],
	['ナ', 'na'], ['ニ', 'ni'], ['ヌ', 'nu'], ['ネ', 'ne'], ['ノ', 'no'],
	['ハ', 'ha'], ['ヒ', 'hi'], ['フ', 'fu'], ['ヘ', 'he'], ['ホ', 'ho'],
	['マ', 'ma'], ['ミ', 'mi'], ['ム', 'mu'], ['メ', 'me'], ['モ', 'mo'],
	['ヤ', 'ya'], ['ユ', 'yu'], ['ヨ', 'yo'],
	['ラ', 'ra'], ['リ', 'ri'], ['ル', 'ru'], ['レ', 're'], ['ロ', 'ro'],
	['ワ', 'wa'], ['ヲ', 'wo'], ['ン', 'n']
];

// ── Japanese JLPT N5 vocabulary ───────────────────────────────────────────────
const JA_VOCAB: Array<{ native: string; reading: string; translation: string; theme: string; grammar: string; example?: string }> = [
	// Saludos
	{ native: 'こんにちは', reading: 'konnichiwa', translation: 'Hola (de día)', theme: 'greetings', grammar: 'expression', example: 'こんにちは、田中さん。' },
	{ native: 'おはようございます', reading: 'ohayou gozaimasu', translation: 'Buenos días', theme: 'greetings', grammar: 'expression' },
	{ native: 'こんばんは', reading: 'konbanwa', translation: 'Buenas noches', theme: 'greetings', grammar: 'expression' },
	{ native: 'ありがとうございます', reading: 'arigatou gozaimasu', translation: 'Muchas gracias', theme: 'greetings', grammar: 'expression' },
	{ native: 'すみません', reading: 'sumimasen', translation: 'Perdón / Disculpe', theme: 'greetings', grammar: 'expression' },
	{ native: 'はじめまして', reading: 'hajimemashite', translation: 'Encantado de conocerle', theme: 'greetings', grammar: 'expression' },
	// Números
	{ native: '一', reading: 'ichi', translation: 'Uno (1)', theme: 'numbers', grammar: 'noun' },
	{ native: '二', reading: 'ni', translation: 'Dos (2)', theme: 'numbers', grammar: 'noun' },
	{ native: '三', reading: 'san', translation: 'Tres (3)', theme: 'numbers', grammar: 'noun' },
	{ native: '四', reading: 'shi / yon', translation: 'Cuatro (4)', theme: 'numbers', grammar: 'noun' },
	{ native: '五', reading: 'go', translation: 'Cinco (5)', theme: 'numbers', grammar: 'noun' },
	{ native: '六', reading: 'roku', translation: 'Seis (6)', theme: 'numbers', grammar: 'noun' },
	{ native: '七', reading: 'nana / shichi', translation: 'Siete (7)', theme: 'numbers', grammar: 'noun' },
	{ native: '八', reading: 'hachi', translation: 'Ocho (8)', theme: 'numbers', grammar: 'noun' },
	{ native: '九', reading: 'ku / kyuu', translation: 'Nueve (9)', theme: 'numbers', grammar: 'noun' },
	{ native: '十', reading: 'juu', translation: 'Diez (10)', theme: 'numbers', grammar: 'noun' },
	// Personas / Familia
	{ native: '人', reading: 'hito', translation: 'Persona', theme: 'people', grammar: 'noun' },
	{ native: '父', reading: 'chichi', translation: 'Padre (propio)', theme: 'people', grammar: 'noun' },
	{ native: '母', reading: 'haha', translation: 'Madre (propia)', theme: 'people', grammar: 'noun' },
	{ native: '兄', reading: 'ani', translation: 'Hermano mayor (propio)', theme: 'people', grammar: 'noun' },
	{ native: '友達', reading: 'tomodachi', translation: 'Amigo/a', theme: 'people', grammar: 'noun' },
	{ native: '先生', reading: 'sensei', translation: 'Profesor/a', theme: 'people', grammar: 'noun' },
	// Lugares
	{ native: '学校', reading: 'gakkou', translation: 'Escuela / colegio', theme: 'places', grammar: 'noun', example: '学校に行きます。' },
	{ native: '駅', reading: 'eki', translation: 'Estación de tren', theme: 'places', grammar: 'noun' },
	{ native: '銀行', reading: 'ginkou', translation: 'Banco', theme: 'places', grammar: 'noun' },
	{ native: '病院', reading: 'byouin', translation: 'Hospital', theme: 'places', grammar: 'noun' },
	{ native: '図書館', reading: 'toshokan', translation: 'Biblioteca', theme: 'places', grammar: 'noun' },
	{ native: '店', reading: 'mise', translation: 'Tienda', theme: 'places', grammar: 'noun' },
	{ native: '家', reading: 'ie / uchi', translation: 'Casa', theme: 'places', grammar: 'noun' },
	// Comida
	{ native: '水', reading: 'mizu', translation: 'Agua', theme: 'food', grammar: 'noun' },
	{ native: 'ご飯', reading: 'gohan', translation: 'Arroz / comida', theme: 'food', grammar: 'noun' },
	{ native: '魚', reading: 'sakana', translation: 'Pescado', theme: 'food', grammar: 'noun' },
	{ native: '肉', reading: 'niku', translation: 'Carne', theme: 'food', grammar: 'noun' },
	{ native: '野菜', reading: 'yasai', translation: 'Verdura', theme: 'food', grammar: 'noun' },
	{ native: '果物', reading: 'kudamono', translation: 'Fruta', theme: 'food', grammar: 'noun' },
	// Verbos
	{ native: '食べる', reading: 'taberu', translation: 'Comer', theme: 'daily', grammar: 'verb', example: '朝ご飯を食べます。' },
	{ native: '飲む', reading: 'nomu', translation: 'Beber', theme: 'daily', grammar: 'verb' },
	{ native: '行く', reading: 'iku', translation: 'Ir', theme: 'daily', grammar: 'verb' },
	{ native: '来る', reading: 'kuru', translation: 'Venir', theme: 'daily', grammar: 'verb' },
	{ native: '見る', reading: 'miru', translation: 'Ver / mirar', theme: 'daily', grammar: 'verb' },
	{ native: '聞く', reading: 'kiku', translation: 'Escuchar / preguntar', theme: 'daily', grammar: 'verb' },
	{ native: '話す', reading: 'hanasu', translation: 'Hablar', theme: 'daily', grammar: 'verb' },
	{ native: '読む', reading: 'yomu', translation: 'Leer', theme: 'daily', grammar: 'verb' },
	{ native: '書く', reading: 'kaku', translation: 'Escribir', theme: 'daily', grammar: 'verb' },
	{ native: '買う', reading: 'kau', translation: 'Comprar', theme: 'daily', grammar: 'verb' },
	{ native: 'する', reading: 'suru', translation: 'Hacer', theme: 'daily', grammar: 'verb' },
	{ native: 'ある', reading: 'aru', translation: 'Haber / tener (cosas)', theme: 'daily', grammar: 'verb' },
	{ native: 'いる', reading: 'iru', translation: 'Estar / haber (personas/animales)', theme: 'daily', grammar: 'verb' },
	// Adjetivos
	{ native: '大きい', reading: 'ookii', translation: 'Grande', theme: 'adjectives', grammar: 'adjective' },
	{ native: '小さい', reading: 'chiisai', translation: 'Pequeño/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '新しい', reading: 'atarashii', translation: 'Nuevo/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '古い', reading: 'furui', translation: 'Viejo/a / antiguo/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '高い', reading: 'takai', translation: 'Alto/a / caro/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '安い', reading: 'yasui', translation: 'Barato/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: 'いい', reading: 'ii', translation: 'Bueno/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '悪い', reading: 'warui', translation: 'Malo/a', theme: 'adjectives', grammar: 'adjective' },
	// Transporte
	{ native: '電車', reading: 'densha', translation: 'Tren eléctrico', theme: 'transport', grammar: 'noun' },
	{ native: 'バス', reading: 'basu', translation: 'Autobús', theme: 'transport', grammar: 'noun' },
	{ native: 'タクシー', reading: 'takushii', translation: 'Taxi', theme: 'transport', grammar: 'noun' },
	{ native: '飛行機', reading: 'hikouki', translation: 'Avión', theme: 'transport', grammar: 'noun' },
	// Tiempo
	{ native: '今日', reading: 'kyou', translation: 'Hoy', theme: 'time', grammar: 'noun' },
	{ native: '明日', reading: 'ashita', translation: 'Mañana', theme: 'time', grammar: 'noun' },
	{ native: '昨日', reading: 'kinou', translation: 'Ayer', theme: 'time', grammar: 'noun' },
	{ native: '今', reading: 'ima', translation: 'Ahora', theme: 'time', grammar: 'adverb' },
];

// ── Korean jamo & vocabulary ──────────────────────────────────────────────────
const KO_CONSONANTS: Array<[string, string]> = [
	['ㄱ', 'g/k'], ['ㄴ', 'n'], ['ㄷ', 'd/t'], ['ㄹ', 'r/l'], ['ㅁ', 'm'],
	['ㅂ', 'b/p'], ['ㅅ', 's'], ['ㅇ', 'ng (silent at start)'], ['ㅈ', 'j'],
	['ㅊ', 'ch'], ['ㅋ', 'k'], ['ㅌ', 't'], ['ㅍ', 'p'], ['ㅎ', 'h'],
	['ㄲ', 'kk'], ['ㄸ', 'tt'], ['ㅃ', 'pp'], ['ㅆ', 'ss'], ['ㅉ', 'jj']
];

const KO_VOWELS: Array<[string, string]> = [
	['ㅏ', 'a'], ['ㅑ', 'ya'], ['ㅓ', 'eo'], ['ㅕ', 'yeo'], ['ㅗ', 'o'],
	['ㅛ', 'yo'], ['ㅜ', 'u'], ['ㅠ', 'yu'], ['ㅡ', 'eu'], ['ㅣ', 'i'],
	['ㅐ', 'ae'], ['ㅔ', 'e'], ['ㅒ', 'yae'], ['ㅖ', 'ye'],
	['ㅘ', 'wa'], ['ㅙ', 'wae'], ['ㅚ', 'oe'],
	['ㅝ', 'wo'], ['ㅞ', 'we'], ['ㅟ', 'wi'], ['ㅢ', 'ui']
];

const KO_VOCAB: Array<{ native: string; reading: string; translation: string; theme: string; grammar: string; example?: string }> = [
	// Saludos
	{ native: '안녕하세요', reading: 'annyeonghaseyo', translation: 'Hola (formal)', theme: 'greetings', grammar: 'expression' },
	{ native: '감사합니다', reading: 'gamsahamnida', translation: 'Gracias (formal)', theme: 'greetings', grammar: 'expression' },
	{ native: '죄송합니다', reading: 'joesonghamnida', translation: 'Lo siento (formal)', theme: 'greetings', grammar: 'expression' },
	{ native: '처음 뵙겠습니다', reading: 'cheoeum boepgesseumnida', translation: 'Encantado de conocerle', theme: 'greetings', grammar: 'expression' },
	{ native: '잘 부탁드립니다', reading: 'jal butakdeurimnida', translation: 'Me pongo en sus manos', theme: 'greetings', grammar: 'expression' },
	// Números
	{ native: '일', reading: 'il', translation: 'Uno (1) — sino-coreano', theme: 'numbers', grammar: 'noun' },
	{ native: '이', reading: 'i', translation: 'Dos (2) — sino-coreano', theme: 'numbers', grammar: 'noun' },
	{ native: '삼', reading: 'sam', translation: 'Tres (3) — sino-coreano', theme: 'numbers', grammar: 'noun' },
	{ native: '사', reading: 'sa', translation: 'Cuatro (4) — sino-coreano', theme: 'numbers', grammar: 'noun' },
	{ native: '오', reading: 'o', translation: 'Cinco (5) — sino-coreano', theme: 'numbers', grammar: 'noun' },
	{ native: '하나', reading: 'hana', translation: 'Uno (1) — coreano nativo', theme: 'numbers', grammar: 'noun' },
	{ native: '둘', reading: 'dul', translation: 'Dos (2) — coreano nativo', theme: 'numbers', grammar: 'noun' },
	{ native: '셋', reading: 'set', translation: 'Tres (3) — coreano nativo', theme: 'numbers', grammar: 'noun' },
	// Personas
	{ native: '사람', reading: 'saram', translation: 'Persona', theme: 'people', grammar: 'noun' },
	{ native: '아버지', reading: 'abeoji', translation: 'Padre', theme: 'people', grammar: 'noun' },
	{ native: '어머니', reading: 'eomeoni', translation: 'Madre', theme: 'people', grammar: 'noun' },
	{ native: '친구', reading: 'chingu', translation: 'Amigo/a', theme: 'people', grammar: 'noun' },
	{ native: '선생님', reading: 'seonsaengnim', translation: 'Profesor/a', theme: 'people', grammar: 'noun' },
	// Lugares
	{ native: '학교', reading: 'hakgyo', translation: 'Escuela', theme: 'places', grammar: 'noun' },
	{ native: '집', reading: 'jip', translation: 'Casa', theme: 'places', grammar: 'noun' },
	{ native: '병원', reading: 'byeongwon', translation: 'Hospital', theme: 'places', grammar: 'noun' },
	{ native: '은행', reading: 'eunhaeng', translation: 'Banco', theme: 'places', grammar: 'noun' },
	{ native: '식당', reading: 'sikdang', translation: 'Restaurante', theme: 'places', grammar: 'noun' },
	// Comida
	{ native: '물', reading: 'mul', translation: 'Agua', theme: 'food', grammar: 'noun' },
	{ native: '밥', reading: 'bap', translation: 'Arroz / comida', theme: 'food', grammar: 'noun' },
	{ native: '김치', reading: 'gimchi', translation: 'Kimchi', theme: 'food', grammar: 'noun' },
	{ native: '고기', reading: 'gogi', translation: 'Carne', theme: 'food', grammar: 'noun' },
	{ native: '야채', reading: 'yachae', translation: 'Verdura', theme: 'food', grammar: 'noun' },
	// Verbos
	{ native: '먹다', reading: 'meokda', translation: 'Comer', theme: 'daily', grammar: 'verb', example: '밥을 먹어요.' },
	{ native: '마시다', reading: 'masida', translation: 'Beber', theme: 'daily', grammar: 'verb' },
	{ native: '가다', reading: 'gada', translation: 'Ir', theme: 'daily', grammar: 'verb' },
	{ native: '오다', reading: 'oda', translation: 'Venir', theme: 'daily', grammar: 'verb' },
	{ native: '보다', reading: 'boda', translation: 'Ver / mirar', theme: 'daily', grammar: 'verb' },
	{ native: '듣다', reading: 'deutda', translation: 'Escuchar', theme: 'daily', grammar: 'verb' },
	{ native: '말하다', reading: 'malhada', translation: 'Hablar', theme: 'daily', grammar: 'verb' },
	{ native: '읽다', reading: 'ikda', translation: 'Leer', theme: 'daily', grammar: 'verb' },
	{ native: '쓰다', reading: 'sseuda', translation: 'Escribir / usar', theme: 'daily', grammar: 'verb' },
	{ native: '사다', reading: 'sada', translation: 'Comprar', theme: 'daily', grammar: 'verb' },
	{ native: '하다', reading: 'hada', translation: 'Hacer', theme: 'daily', grammar: 'verb' },
	{ native: '있다', reading: 'itda', translation: 'Haber / tener / estar', theme: 'daily', grammar: 'verb' },
	{ native: '없다', reading: 'eopda', translation: 'No haber / no tener', theme: 'daily', grammar: 'verb' },
	// Adjetivos
	{ native: '크다', reading: 'keuda', translation: 'Grande', theme: 'adjectives', grammar: 'adjective' },
	{ native: '작다', reading: 'jakda', translation: 'Pequeño/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '좋다', reading: 'jota', translation: 'Bueno/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '나쁘다', reading: 'nappeuda', translation: 'Malo/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '비싸다', reading: 'bissada', translation: 'Caro/a', theme: 'adjectives', grammar: 'adjective' },
	{ native: '싸다', reading: 'ssada', translation: 'Barato/a', theme: 'adjectives', grammar: 'adjective' },
	// Tiempo
	{ native: '오늘', reading: 'oneul', translation: 'Hoy', theme: 'time', grammar: 'noun' },
	{ native: '내일', reading: 'naeil', translation: 'Mañana', theme: 'time', grammar: 'noun' },
	{ native: '어제', reading: 'eoje', translation: 'Ayer', theme: 'time', grammar: 'noun' },
	{ native: '지금', reading: 'jigeum', translation: 'Ahora', theme: 'time', grammar: 'adverb' },
];

async function seed() {
	console.log('🌱 Seeding database…');

	// Languages
	const [ja, ko] = await db
		.insert(languages)
		.values([
			{ code: 'ja', name: 'Japonés' },
			{ code: 'ko', name: 'Coreano' }
		])
		.onConflictDoNothing()
		.returning();

	const jaId = ja?.id ?? (await db.query.languages.findFirst({ where: (l, { eq }) => eq(l.code, 'ja') }))!.id;
	const koId = ko?.id ?? (await db.query.languages.findFirst({ where: (l, { eq }) => eq(l.code, 'ko') }))!.id;

	// ── Japanese decks ─────────────────────────────────────────────────────────
	const [hiraganaDeck] = await db
		.insert(decks)
		.values({ languageId: jaId, name: 'Hiragana', description: 'Los 46 hiragana básicos', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (hiraganaDeck) {
		await db.insert(cards).values(
			HIRAGANA.map(([native, reading]) => ({ deckId: hiraganaDeck.id, native, reading, translation: `Romaji: ${reading}` }))
		);
	}

	const [katakanaDeck] = await db
		.insert(decks)
		.values({ languageId: jaId, name: 'Katakana', description: 'Los 46 katakana básicos', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (katakanaDeck) {
		await db.insert(cards).values(
			KATAKANA.map(([native, reading]) => ({ deckId: katakanaDeck.id, native, reading, translation: `Romaji: ${reading}` }))
		);
	}

	const [jlptDeck] = await db
		.insert(decks)
		.values({ languageId: jaId, name: 'Vocabulario JLPT N5', description: 'Vocabulario esencial nivel N5', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (jlptDeck) {
		await db.insert(cards).values(
			JA_VOCAB.map((w) => ({ deckId: jlptDeck.id, native: w.native, reading: w.reading, translation: w.translation, example: w.example ?? null }))
		);
		await db.insert(deckTags).values(
			[...new Set(JA_VOCAB.map((w) => w.theme))].map((tag) => ({ deckId: jlptDeck.id, tag, tagType: 'theme' as const }))
		);
		await db.insert(deckTags).values(
			[...new Set(JA_VOCAB.map((w) => w.grammar))].map((tag) => ({ deckId: jlptDeck.id, tag, tagType: 'grammar' as const }))
		);
	}

	// ── Korean decks ───────────────────────────────────────────────────────────
	const [consonantsDeck] = await db
		.insert(decks)
		.values({ languageId: koId, name: 'Consonantes (자음)', description: '19 consonantes del hangul', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (consonantsDeck) {
		await db.insert(cards).values(
			KO_CONSONANTS.map(([native, reading]) => ({ deckId: consonantsDeck.id, native, reading, translation: `Romanización: ${reading}` }))
		);
	}

	const [vowelsDeck] = await db
		.insert(decks)
		.values({ languageId: koId, name: 'Vocales (모음)', description: '21 vocales del hangul', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (vowelsDeck) {
		await db.insert(cards).values(
			KO_VOWELS.map(([native, reading]) => ({ deckId: vowelsDeck.id, native, reading, translation: `Romanización: ${reading}` }))
		);
	}

	const [koVocabDeck] = await db
		.insert(decks)
		.values({ languageId: koId, name: 'Vocabulario básico', description: 'Vocabulario esencial coreano', isSystem: true })
		.onConflictDoNothing()
		.returning();

	if (koVocabDeck) {
		await db.insert(cards).values(
			KO_VOCAB.map((w) => ({ deckId: koVocabDeck.id, native: w.native, reading: w.reading, translation: w.translation, example: w.example ?? null }))
		);
		await db.insert(deckTags).values(
			[...new Set(KO_VOCAB.map((w) => w.theme))].map((tag) => ({ deckId: koVocabDeck.id, tag, tagType: 'theme' as const }))
		);
	}

	console.log('✅ Seed completado.');
	client.close();
}

seed().catch((e) => { console.error(e); process.exit(1); });
