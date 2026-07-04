# Notecalla

Aplicación web de aprendizaje de idiomas mediante tarjetas de memoria (flashcards) con repaso espaciado (SM-2). Soporta japonés y coreano. Multiusuario, autosuficiente, sin dependencias de servicios externos.

## Stack

- **Framework**: SvelteKit 2 + Svelte 5 (runes mode), TypeScript estricto
- **Styling**: Tailwind CSS v4
- **ORM**: Drizzle ORM
- **Base de datos**: PostgreSQL (Docker en local, cualquier servidor PG en producción)
- **Auth**: Lucia v3 (email/contraseña)
- **Testing**: Vitest (unit) + Playwright (e2e)
- **Runtime**: Node.js 22 (`adapter-node`)
- **Package manager**: Bun

## Requisitos

- [Bun](https://bun.sh) ≥ 1.0
- [Docker](https://www.docker.com) (para PostgreSQL local)

## Configuración local

```bash
# 1. Instalar dependencias
bun install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar PostgreSQL
docker compose up postgres -d

# 4. Aplicar schema
bun run db:migrate

# 5. Poblar datos iniciales (mazos de hiragana, katakana, jamo...)
bun run db:seed

# 6. Servidor de desarrollo
bun dev
```

La app queda disponible en `http://localhost:5173`.

## Variables de entorno

```
DATABASE_URL   # postgresql://user:password@host:5432/db
```

Ver `.env.example` para la plantilla.

## Comandos

```bash
bun dev               # servidor de desarrollo (localhost:5173)
bun build             # build de producción
bun preview           # previsualizar el build de producción
bun check             # svelte-check + tsc
bun lint              # prettier --check + eslint
bun format            # prettier --write
bun test              # vitest --run (una sola pasada)
bun test:unit         # vitest (watch mode)
bun test:e2e          # playwright test

bun run db:generate   # generar migración desde schema
bun run db:migrate    # aplicar migraciones pendientes
bun run db:push       # push directo al schema (dev)
bun run db:studio     # Drizzle Studio UI
```

## Docker

```bash
# Solo base de datos (para desarrollo local)
docker compose up postgres -d

# App completa (build + PostgreSQL)
docker compose up --build
```

La app completa queda en `http://localhost:3000`.

## Despliegue en producción

La app genera un servidor Node.js estándar en `build/`. Cualquier plataforma que soporte contenedores Docker o procesos Node.js es compatible: Fly.io, Railway, VPS, etc.

Requisito: proporcionar `DATABASE_URL` apuntando a un servidor PostgreSQL accesible.

## Licencia

MIT
