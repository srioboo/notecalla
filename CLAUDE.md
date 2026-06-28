## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: none

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**notecalla** — aplicación de ayuda al aprendizaje de idiomas mediante tarjetas de memoria (vocabulario) y textos (gramática). MIT license.

## Stack

- **Framework**: SvelteKit (file-based routing, SSR/SSG, server actions via form actions y `+page.server.ts`)
- **Language**: TypeScript estricto
- **Styling**: Tailwind CSS
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Package manager**: pnpm

## Commands

```bash
pnpm dev          # servidor de desarrollo en localhost:5173
pnpm build        # build de producción
pnpm preview      # previsualizar el build de producción
pnpm check        # svelte-check + tsc (errores de tipos y plantillas)
pnpm lint         # eslint + prettier --check
pnpm format       # prettier --write
pnpm test         # vitest (unit tests)
pnpm test:e2e     # playwright (tests end-to-end)
pnpm test -- --run src/lib/utils/cards.test.ts  # ejecutar un test concreto
```

## Architecture

### Routing (SvelteKit file-based)

```
src/routes/
  +layout.svelte          # layout raíz (nav, providers de contexto global)
  +layout.server.ts       # carga de sesión/usuario en cada ruta
  (auth)/                 # grupo de rutas sin layout principal
    login/
    register/
  (app)/                  # rutas protegidas (requieren sesión)
    deck/[deckId]/        # detalle y sesión de estudio de un mazo
    review/               # sesión de repaso espaciado
    texts/[textId]/       # lectura de texto con anotaciones
```

### Data flow

- **Server data**: `+page.server.ts` / `+layout.server.ts` cargan datos en el servidor y los exponen vía `load()`. El tipo se exporta como `PageServerLoad`.
- **Form actions**: mutaciones (crear baraja, marcar tarjeta) van por form actions (`+page.server.ts` → `actions`) en lugar de endpoints REST cuando sea posible.
- **Client stores**: estado efímero de la sesión de estudio (progreso de la ronda actual) vive en stores de Svelte en `src/lib/stores/`.
- **API routes**: `src/routes/api/` solo para peticiones que necesiten JSON explícito (e.g., sincronización offline).

### Domain modules (`src/lib/`)

- `src/lib/server/` — código exclusivo de servidor (DB, auth). **Nunca importar desde componentes cliente.**
- `src/lib/stores/` — Svelte stores reutilizables.
- `src/lib/utils/` — funciones puras sin dependencias de framework (algoritmo SM-2 de repaso espaciado, parsers de texto, etc.).
- `src/lib/components/` — componentes UI reutilizables. Cada componente en su propia carpeta si necesita sub-componentes o tipos propios.

### Spaced repetition

El núcleo del dominio es el algoritmo SM-2 que vive en `src/lib/utils/sm2.ts`. Calcula el intervalo de siguiente revisión a partir de la calidad de la respuesta (0-5). Los tests de esta lógica son los más críticos del proyecto.

## Key conventions

- Inferir tipos desde `$lib/server/db/schema.ts` (la fuente de verdad del modelo de datos) en lugar de duplicar tipos manualmente.
- Los `load()` de servidor devuelven solo los datos que la página necesita; no serializar objetos enteros de BD.
- Las rutas protegidas comprueban la sesión en el `+layout.server.ts` del grupo `(app)` y redirigen a `/login` si no hay sesión — no repetir esta comprobación en cada ruta hija.
- Prefer `<form>` + progressive enhancement (`use:enhance`) sobre fetch manual para mutaciones.
- Los componentes de tarjeta y sesión de estudio son los más interactivos; mantener el estado de la sesión en un store dedicado, no en props encadenadas.
