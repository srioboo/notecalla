# Sesión 01 — Resumen de trabajo (2026-06-28)

## Objetivo

Construcción desde cero de **Notecalla**, aplicación de aprendizaje de idiomas (japonés y coreano) con tarjetas de memoria y repetición espaciada SM-2.

---

## Tareas completadas

### Fase 0 — Scaffolding

- Proyecto SvelteKit 2 + Svelte 5 (runes mode global) inicializado con `bunx sv create`
- Tailwind CSS v4 (`@tailwindcss/vite`), ESLint, Prettier configurados
- `@sveltejs/adapter-vercel` instalado; `vite.config.ts` con `runtime: 'nodejs22.x'` para compatibilidad con Node 25 local
- `.env.example` con `DATABASE_URL` y `DATABASE_AUTH_TOKEN`
- `CLAUDE.md` documentando el stack completo

### Fase 1 — Base de datos

- Schema Drizzle en `src/lib/server/db/schema.ts`: 10 tablas (`languages`, `users`, `sessions`, `decks`, `deck_tags`, `cards`, `card_progress`, `study_sessions`, `session_entries`, `user_settings`)
- `drizzle.config.ts` con detección automática de dialecto: `file:` → sqlite, `libsql://` → turso
- Migraciones generadas en `drizzle/`
- Seed idempotente (`bun run db:seed`): 2 idiomas, 46 hiragana, 46 katakana, ~65 palabras JLPT N5, 19 consonantes jamo, 21 vocales jamo, ~50 palabras coreanas básicas

### Fase 2 — Autenticación

- Lucia v3 con adaptador personalizado (Drizzle queries directas; v3 no tiene adaptadores incluidos)
- `src/hooks.server.ts` valida cookie de sesión en cada request
- Rutas `(auth)`: `/register`, `/login`, `/logout`
- Protección de rutas en `(app)/+layout.server.ts`
- Contraseñas con bcryptjs cost 12; protección timing-attack en login

### Fase 3 — Algoritmo SM-2

- `src/lib/utils/sm2.ts`: escala interna 0–3 mapeada a SM-2 0–5
- 9 tests unitarios Vitest pasando

### Fase 4 — Gestión de mazos

- `/decks`: listar (sistema + propios), crear, clonar, eliminar
- `/decks/[deckId]`: CRUD de tarjetas, suspender/reactivar

### Fase 5 — Sesión de vocabulario

- `/study`: configuración (mazo, timer, dirección, romaji), persistencia en `user_settings`
- `/study/session`: cola de tarjetas con temporizador SVG, autoevaluación 4 niveles, parámetro `?limit=` (máx 100)
- `/study/summary`: resultados (precisión, tiempo medio, desglose por tarjeta)

### Fase 6 — Modo alfabeto

- `/alphabet`: selector de idioma (japonés / coreano)
- `/alphabet/ja`: hiragana y katakana, dirección configurable, timer, `limit=50`
- `/alphabet/ko`: consonantes y vocales jamo, `limit=30`
- Componentes extraídos: `FlashCard.svelte`, `TimerRing.svelte` (reutilizados en vocabulario y alfabeto)

### Fase 7 — Estadísticas

- `/stats`: racha diaria, distribución SM-2 (nueva/aprendiendo/consolidada/maestra), top tarjetas difíciles, historial de sesiones

### Fase 8 — Calidad

- CI en `.github/workflows/ci.yml`: 3 jobs (check+lint, unit tests, e2e tests)
- Tests e2e Playwright (`src/tests/`):
  - `auth.e2e.ts`: registro, login, logout, rutas protegidas
  - `vocabulary.e2e.ts`: flujo completo hasta resumen
  - `alphabet.e2e.ts`: navegación, sin tarjetas repetidas en hiragana, sesión jamo

---

## Stack final

| Capa | Tecnología |
|------|-----------|
| Framework | SvelteKit 2 + Svelte 5 runes |
| Package manager | Bun |
| Estilos | Tailwind CSS v4 |
| ORM | Drizzle ORM |
| Base de datos | Turso (libSQL) / `file:local.db` en dev |
| Auth | Lucia v3 (email/contraseña, adaptador manual) |
| Tests unitarios | Vitest — 9 tests |
| Tests e2e | Playwright — 7 tests |
| Adapter | @sveltejs/adapter-vercel (nodejs22.x) |
| Tipografía CJK | Noto Sans JP + Noto Sans KR (Google Fonts) |

---

## Commits de la sesión

```
62509f4  Initial commit
...      feat: scaffolding + schema + auth + SM-2 + seed
...      feat: mazos, tarjetas, sesión de estudio, resumen, estadísticas
...      feat: modo alfabeto con componentes FlashCard y TimerRing reutilizables
6faf6b7  feat: tests e2e con Playwright y workflow de CI en GitHub Actions
```

---

## Tareas pendientes antes de desplegar en Vercel

1. **Crear base de datos en Turso**
   - Ir a [turso.tech](https://turso.tech), crear una DB (free tier: 500 DBs, 9 GB, 1B lecturas/mes)
   - Obtener `DATABASE_URL` (formato `libsql://nombre-org.turso.io`) y `DATABASE_AUTH_TOKEN`

2. **Aplicar el schema en producción**
   ```bash
   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... bun run db:migrate
   ```

3. **Cargar datos semilla en producción**
   ```bash
   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... bun run db:seed
   ```

4. **Conectar repositorio GitHub a Vercel**
   - En el dashboard de Vercel: New Project → importar el repositorio
   - Framework preset: SvelteKit (detectado automáticamente)

5. **Añadir variables de entorno en Vercel**
   - `DATABASE_URL` → valor de Turso
   - `DATABASE_AUTH_TOKEN` → token de Turso

6. **Instalar Playwright localmente para e2e en local**
   ```bash
   bunx playwright install chromium
   ```
