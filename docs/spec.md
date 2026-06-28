# Notecalla — Especificación funcional

## 1. Visión general

Notecalla es una aplicación web de asistencia al aprendizaje de idiomas. Su mecánica principal son las tarjetas de memoria (flashcards): el usuario ve una palabra o símbolo en el idioma objetivo, dispone de un tiempo configurable para intentar recordar su significado o lectura, y a continuación revela la respuesta y valora su dominio. Los resultados alimentan un algoritmo de repaso espaciado (SM-2) que prioriza las tarjetas menos consolidadas.

La aplicación arranca con soporte para **japonés** y **coreano**, con la posibilidad de añadir más idiomas en el futuro.

---

## 2. Idiomas soportados

| Idioma   | Escrituras incluidas                          |
|----------|-----------------------------------------------|
| Japonés  | Hiragana, Katakana, Kanji (JLPT N5–N1), Romaji |
| Coreano  | Hangul (jamo y sílabas completas), Romanización RR |

Todas las vistas de la aplicación deben renderizar correctamente caracteres CJK y coreanos junto a texto latino, sin sustituciones ni cajas vacías. La fuente tipográfica debe garantizar cobertura completa de estos rangos Unicode.

---

## 3. Modos de estudio

### 3.1 Modo vocabulario

El flujo básico de una sesión:

1. El usuario selecciona idioma, mazo o temática, y número de tarjetas.
2. Se muestra la tarjeta frontal (palabra en el idioma objetivo o en el idioma nativo, configurable).
3. Corre un temporizador visible. Cuando se agota, la tarjeta se marca automáticamente como no recordada.
4. El usuario puede revelar la respuesta antes de que el tiempo expire.
5. Tras revelar, el usuario autoevalúa con una escala de 4 niveles:
   - **Muy fácil** — lo sabía al instante
   - **Fácil** — lo recordé con algo de esfuerzo
   - **Difícil** — necesité ayuda o tardé demasiado
   - **No lo sabía**
6. El algoritmo SM-2 calcula el próximo intervalo de repaso para esa tarjeta.
7. Al terminar la sesión se muestra un resumen: aciertos, fallos, racha y tarjetas a repasar.

### 3.2 Modo alfabeto

Orientado a aprender los sistemas de escritura antes de abordar el vocabulario general.

- **Japonés**: sesiones de hiragana, de katakana, o combinadas. Una tarjeta puede mostrar el símbolo y pedir su lectura en romaji, o al revés.
- **Coreano**: sesiones de jamo individuales (consonantes y vocales) y de sílabas completas formadas por combinaciones de jamo.
- El modo alfabeto se puede activar como prerequisito antes de desbloquear los mazos de vocabulario general.

### 3.3 Selección de temáticas

Los mazos de vocabulario se organizan en dos ejes:

**Por categoría gramatical**
- Sustantivos, verbos, adjetivos, adverbios, partículas, expresiones

**Por tema semántico**
- Saludos y presentaciones
- Números y fechas
- Colores y formas
- Direcciones y lugares
- Transporte y viajes
- Comida y bebida
- Familia y personas
- Trabajo y estudios
- Aficiones y tiempo libre
- Naturaleza y clima
- Salud y cuerpo
- Compras y dinero

El usuario puede combinar categoría gramatical y tema semántico para crear sesiones personalizadas (ej. "verbos de movimiento" o "adjetivos de comida").

---

## 4. Configuración de sesión

Antes de iniciar cada sesión el usuario puede ajustar:

| Parámetro | Opciones | Por defecto |
|-----------|----------|-------------|
| Tiempo por tarjeta | 5 s / 10 s / 15 s / 20 s / sin límite | 10 s |
| Número de tarjetas | 10 / 20 / 50 / todas las pendientes | 20 |
| Dirección de la tarjeta | Idioma objetivo → nativo / Nativo → objetivo / Aleatoria | Aleatoria |
| Incluir romaji/romanización | Sí / No | Sí (configurable por idioma) |
| Orden | Según SM-2 (pendientes primero) / Aleatorio | SM-2 |

---

## 5. Gestión de mazos

- El usuario puede crear mazos personalizados añadiendo palabras manualmente.
- Cada entrada de mazo contiene: palabra en idioma objetivo, lectura (romaji / romanización), traducción(es) al idioma nativo, ejemplo de uso (opcional), notas (opcional).
- Los mazos predefinidos por temática son de solo lectura, pero el usuario puede clonarlos y editarlos.
- Se puede marcar una tarjeta como "suspendida" para excluirla temporalmente de las sesiones sin borrarla.

---

## 6. Cambio de idioma

- La interfaz permite cambiar el idioma de estudio activo desde cualquier pantalla mediante un selector persistente en la barra de navegación.
- El historial de progreso (intervalos SM-2, estadísticas) es independiente por idioma.
- La interfaz de la aplicación (textos de menú, botones, etc.) se muestra en el idioma nativo del usuario, independientemente del idioma que esté estudiando.

---

## 7. Progreso y estadísticas

Por idioma y globales:

- Tarjetas totales estudiadas, aciertos y tasa de acierto
- Racha diaria (días consecutivos con al menos una sesión completada)
- Distribución de tarjetas por nivel SM-2 (nuevas / aprendiendo / consolidadas / maestras)
- Historial de sesiones (fecha, temática, puntuación)
- Palabras con mayor tasa de error (para repaso focalizado)

---

## 8. Soporte de caracteres y tipografía

- La base de datos de vocabulario almacena: forma nativa (con caracteres propios del idioma), lectura fonética, traducción.
- Para japonés: campo separado para la forma en kana (lectura) y la forma en kanji cuando aplique.
- Para coreano: la sílaba hangul y su romanización RR.
- El motor de renderizado debe soportar los rangos Unicode:
  - Hiragana: U+3040–U+309F
  - Katakana: U+30A0–U+30FF
  - CJK Unified Ideographs: U+4E00–U+9FFF (y extensiones)
  - Hangul Syllables: U+AC00–U+D7A3
  - Hangul Jamo: U+1100–U+11FF

---

## 9. Casos de uso fuera de alcance (v1)

Los siguientes elementos se dejan explícitamente fuera de la primera versión:

- Reconocimiento de voz o pronunciación
- Modo multijugador o social
- Importación/exportación de mazos en formato Anki (.apkg)
- Lecciones de gramática estructuradas (no solo vocabulario)
- Aplicaciones móviles nativas (la web responsive cubre móvil en v1)
- Soporte de idiomas adicionales al japonés y coreano

---

## 10. Modelo de datos (borrador)

```
Language        id, code ("ja" | "ko"), name, scripts[]
Deck            id, languageId, name, description, isSystem, themeTag[], grammarTag[]
Card            id, deckId, native, reading, translation, exampleSentence, notes, suspended
CardProgress    id, cardId, userId, easeFactor, interval, nextReview, repetitions
Session         id, userId, languageId, deckId, startedAt, completedAt, totalCards, correctCards
SessionEntry    id, sessionId, cardId, quality (0-3), responseTimeMs, reviewedAt
User            id, email, nativeLanguage, createdAt
UserSettings    userId, timerSeconds, cardDirection, showRomaji (per language)
```

---

## 11. Criterios de aceptación clave

- Una sesión de vocabulario completa (selección → tarjetas → resumen) funciona sin errores en los dos idiomas.
- El temporizador se detiene al revelar la tarjeta y no provoca marcado automático si el usuario ya reveló.
- Los caracteres japoneses y coreanos se muestran sin cajas vacías en los navegadores modernos (Chrome, Firefox, Safari).
- Cambiar de idioma activo no mezcla el progreso de SM-2 entre idiomas.
- Una sesión de modo alfabeto cubre los 46 hiragana básicos o los 40 jamo coreanos completos sin repetir tarjetas en la misma ronda.
