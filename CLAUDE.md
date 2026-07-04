# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**notecalla** — aplicación de ayuda al aprendizaje de idiomas mediante tarjetas de memoria (vocabulario) y textos (gramática). MIT license.

## Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes mode), TypeScript estricto
- **Package manager**: Bun
- **Styling**: Tailwind CSS v4
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL (Docker local; cualquier servidor PG en producción)
- **Auth**: Lucia v3 (email/contraseña)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Deployment**: Node.js 22 (`@sveltejs/adapter-node`); contenerizable con Docker

## Commands

```bash
bun dev               # servidor de desarrollo en localhost:5173
bun build             # build de producción
bun preview           # previsualizar el build de producción
bun check             # svelte-check + tsc
bun lint              # prettier --check + eslint
bun format            # prettier --write
bun test:unit         # vitest (watch mode)
bun test              # vitest --run (una sola pasada)
bun test:e2e          # playwright test
bun run test:unit -- --run src/lib/utils/sm2.test.ts  # un test concreto

bun run db:generate   # generar migración desde schema
bun run db:migrate    # aplicar migraciones pendientes
bun run db:push       # push directo al schema (dev)
bun run db:studio     # Drizzle Studio UI
```

## Environment variables

```
DATABASE_URL   # postgresql://user:password@host:5432/db
```

Ver `.env.example` para la plantilla. En local usar Docker: `docker compose up postgres -d`.

## Architecture

### Routing (SvelteKit file-based)

```
src/routes/
  +layout.svelte            # layout raíz (tipografía CJK, navbar con LanguageSwitcher)
  +layout.server.ts         # carga idioma activo de cookie, expone en locals
  (auth)/                   # grupo sin layout protegido
    login/
    register/
    logout/                 # solo action POST
  (app)/                    # rutas protegidas
    +layout.server.ts       # redirige a /login si locals.user es null
    study/                  # configuración + sesión de vocabulario
      session/
      summary/
    alphabet/
      ja/                   # hiragana / katakana
      ko/                   # jamo coreano
    decks/
      [deckId]/
    stats/
```

### Data flow

- **Server data**: `+page.server.ts` / `+layout.server.ts` con `load()` — tipos exportados como `PageServerLoad` / `LayoutServerLoad`.
- **Mutations**: form actions en `+page.server.ts` (`actions: { default, create, … }`). Usar `use:enhance` en el cliente para progressive enhancement.
- **Client state**: sesión de estudio activa (cola de tarjetas, índice, calidades) en `src/lib/stores/session.ts`. No pasar como props encadenadas.
- **API routes**: `src/routes/api/` solo si se necesita JSON explícito.

### Domain modules (`src/lib/`)

- `src/lib/server/` — exclusivo de servidor (DB, auth). **No importar desde componentes cliente.**
- `src/lib/server/db/schema.ts` — fuente de verdad del modelo. Inferir tipos desde aquí, no duplicarlos.
- `src/lib/server/db/index.ts` — instancia `db` de Drizzle.
- `src/lib/server/auth.ts` — instancia de Lucia.
- `src/lib/utils/sm2.ts` — algoritmo SM-2 (función pura, sin dependencias de framework).
- `src/lib/stores/` — Svelte stores reutilizables.
- `src/lib/components/` — componentes UI (`FlashCard`, `Timer`, `LanguageSwitcher`…).

### Spaced repetition (SM-2)

`src/lib/utils/sm2.ts` expone `calculateNextReview(progress, quality: 0|1|2|3)`. Escala interna: 0→no lo sabía, 1→difícil, 2→fácil, 3→muy fácil, mapeados a calidad SM-2 0–5. Tests en `sm2.test.ts`.

### Auth (Lucia v3)

- `src/lib/server/auth.ts` — instancia Lucia con `DrizzleSQLiteAdapter`.
- `src/hooks.server.ts` — valida cookie de sesión en cada request, escribe `locals.user` y `locals.session`.
- La protección de rutas va solo en `src/routes/(app)/+layout.server.ts`; las rutas hijas no comprueban sesión de nuevo.

### Key conventions

- Los `load()` devuelven solo los datos que la vista necesita; no serializar filas enteras de BD.
- Usar `crypto.randomUUID()` para IDs (ya configurado como `$defaultFn` en el schema).
- El selector de idioma activo persiste en cookie (`lang`); `+layout.server.ts` lo lee y lo expone en `locals`.
- Svelte 5 runes mode está activo globalmente (configurado en `vite.config.ts`). Usar `$state`, `$derived`, `$effect` — no `writable`/`derived` de Svelte 4 en componentes.
