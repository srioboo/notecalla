# Tareas pendientes — Notecalla

Formato de estado: `[ ]` pendiente · `[~]` en progreso · `[x]` completado

---

## Despliegue inicial en Vercel

- [ ] Crear base de datos en Turso (free tier) y obtener `DATABASE_URL` + `DATABASE_AUTH_TOKEN`
- [ ] Aplicar migraciones en producción: `DATABASE_URL=... DATABASE_AUTH_TOKEN=... bun run db:migrate`
- [ ] Cargar datos semilla en producción: `DATABASE_URL=... DATABASE_AUTH_TOKEN=... bun run db:seed`
- [ ] Conectar repositorio GitHub a Vercel (New Project → importar repo)
- [ ] Añadir `DATABASE_URL` y `DATABASE_AUTH_TOKEN` como variables de entorno en Vercel
- [ ] Verificar despliegue automático en `main` y URL de producción

---

## Calidad y pruebas

- [ ] Instalar Playwright localmente (`bunx playwright install chromium`) y ejecutar `bun run test:e2e` en local con DB seeded
- [ ] Revisar cobertura de tests e2e: añadir caso de error en registro (email duplicado, contraseñas no coinciden)
- [ ] Añadir test e2e del flujo de mazos: crear mazo → añadir tarjeta → clonar → eliminar
- [ ] Añadir test e2e de estadísticas: tras una sesión, verificar que racha y distribución SM-2 se actualizan

---

## Mejoras de UI / UX

- [ ] Verificar touch targets ≥ 44px en móvil para botones de autoevaluación
- [ ] Añadir animación de volteo en `FlashCard` (CSS 3D transform) al revelar
- [ ] Página de error 404 y 500 personalizadas (`+error.svelte`)
- [ ] Indicador visual de carga (`skeleton`) en las páginas con `load()` lento
- [ ] Mejorar página `/stats`: añadir gráfico de barras de distribución SM-2 y gráfico de racha semanal
- [ ] Soporte offline básico (Service Worker) para repasar tarjetas sin conexión

---

## Funcionalidad adicional

- [ ] Edición de tarjetas existentes en `/decks/[deckId]` (actualmente solo add/delete/suspend)
- [ ] Importar/exportar mazos en formato CSV o Anki `.apkg`
- [ ] Modo de estudio aleatorio combinando múltiples mazos o temáticas
- [ ] Notificaciones push para recordar sesión diaria (Web Push API)
- [ ] Soporte para más idiomas: chino (汉字), francés, alemán (sin scripts especiales)
- [ ] Modo oscuro (toggle en navbar, persiste en cookie)

---

## Infraestructura

- [ ] Renovación automática del token de Turso (o usar token sin expiración)
- [ ] Configurar dominio personalizado en Vercel
- [ ] Añadir Sentry (o similar) para monitorización de errores en producción
- [ ] Rate limiting en rutas de auth (`/login`, `/register`) para prevenir fuerza bruta

---

## Historial de tareas completadas

- [x] Scaffolding: SvelteKit 2 + Svelte 5 + Tailwind v4 + Bun
- [x] Schema Drizzle (10 tablas) + migraciones + seed
- [x] Autenticación Lucia v3 (registro, login, logout, protección de rutas)
- [x] Algoritmo SM-2 con tests unitarios (9 tests)
- [x] Gestión de mazos y tarjetas (CRUD, clonar, suspender)
- [x] Sesión de vocabulario con timer, autoevaluación y resumen
- [x] Modo alfabeto: hiragana, katakana, jamo coreano
- [x] Componentes reutilizables: `FlashCard`, `TimerRing`
- [x] Página de estadísticas (racha, distribución SM-2, historial)
- [x] CI en GitHub Actions (check, lint, unit tests, e2e)
- [x] Tests e2e Playwright: auth, vocabulario, alfabeto
