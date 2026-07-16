# SPEC 01 — MVP visual de Arcade Vault

> **Estado:** Implementado
> **Depende de:** —
> **Fecha:** 2026-07-16
> **Objetivo:** Portar las cinco pantallas del prototipo de `references/templates/` a Next.js 16 App Router con rutas reales, sin implementar ningún juego.

---

## Alcance

**Dentro:**

- Cinco rutas reales del App Router: `/` (biblioteca), `/juegos/[id]` (detalle), `/juegos/[id]/jugar` (reproductor), `/auth` y `/salon`.
- Layout raíz con el `Nav` (escritorio + panel móvil), el footer y los fondos `av-bg` / `av-noise`.
- Página `not-found.tsx` con estética arcade para IDs de juego inexistentes, invocada con `notFound()`.
- Portado de `styles.css` (950 líneas) casi literal a `app/globals.css`, conservando variables, animaciones CRT, scanlines y efecto neón.
- Fuentes Press Start 2P, Courier Prime y JetBrains Mono por `<link>` a Google Fonts en `app/layout.tsx`. Se elimina Geist del scaffold.
- Datos mock tipados: `lib/games.ts` (`Game`, `GAMES`, `CATS`) y `lib/scores.ts` (`ScoreRow`, `seededScores`).
- Componentes en `components/`, con `"use client"` solo donde hay interactividad.
- Sesión mock en `localStorage` (`av_user`), sin validar credenciales, más guardado de partidas en `av_scores`.
- Simulación visual del reproductor: puntuación que sube sola, vidas, nivel, pausa y modal de FIN DEL JUEGO.
- Búsqueda por nombre y filtro por categoría en la biblioteca, incluido el estado vacío "NO HAY RESULTADOS".
- Podio, tabla y pestañas por juego en el Salón de la Fama, con la fila "TU MEJOR MARCA" cuando hay sesión.
- Reemplazo de `app/page.tsx` (scaffold por defecto) y limpieza de los SVG del scaffold en `public/`.

**Fuera de alcance (para specs futuras):**

- Cualquier juego jugable. Ninguno de los ocho.
- Backend, base de datos y API. Todo son datos mock en el cliente.
- Autenticación real, OAuth con Google/GitHub (los botones existen pero no hacen nada), registro y recuperación de contraseña.
- Puntuaciones reales y persistidas por servidor. El Salón muestra números deterministas generados por semilla.
- Sistema de créditos. El `CRÉDITOS · 03` del Nav es texto fijo.
- Portadas reales. Se usan los degradados CSS del template (`cover-bricks`, `cover-tetro`, …).
- Tests. No hay runner configurado.
- SEO, `metadata` por juego, sitemap, Open Graph.
- Migrar los estilos a Tailwind v4.
- Internacionalización. Todo en español, `lang="es"`.

---

## Modelo de datos

Todo el estado vive en el cliente. No hay tablas ni API.

```ts
// lib/games.ts
export type GameCategory = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type GameColor = "cyan" | "magenta" | "green" | "yellow";

export type Game = {
  id: string;        // slug de la URL: /juegos/bloque-buster
  title: string;     // "BLOQUE BUSTER"
  short: string;     // una línea, para la tarjeta
  long: string;      // párrafo, para el detalle
  cat: GameCategory;
  cover: string;     // clase CSS del degradado: "cover-bricks"
  color: GameColor;  // tinte del botón JUGAR
  best: number;      // 28450
  plays: string;     // "12.4K" — ya viene formateado
};

export const GAMES: Game[] = [/* los 8 juegos de data.jsx, sin cambios */];
export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export function getGame(id: string): Game | undefined;
```

```ts
// lib/scores.ts
export type ScoreRow = {
  rank: number;
  name: string;   // "PX_KAI"
  score: number;
  date: string;   // "07/03/2026" — dd/mm/yyyy
};

export const PLAYERS: string[]; // los 18 nicks de data.jsx
export function seededScores(seed: number, count = 12): ScoreRow[];
```

```ts
// lib/session.ts
export type User = { name: string }; // "PX_KAI", mayúsculas, máx 10 chars

export type SavedScore = {
  game: string;   // Game["id"]
  score: number;
  name: string;
  at: number;     // Date.now()
};
```

**Claves de `localStorage`** — se conservan las del template, sin prefijo de versión:

| Clave | Contenido |
| --- | --- |
| `av_user` | `User` serializado, o ausente si no hay sesión. |
| `av_scores` | Array de `SavedScore`. Se escribe pero nadie lo lee todavía. |

**Convenciones:**

- `seededScores` es determinista: misma semilla, mismas filas. Las semillas salen del `id` del juego igual que en el template (`id.length * 17 + 3` en el detalle, `id.length * 23 + 7` en el Salón).
- Los números se formatean con `toLocaleString("es-ES")` en el punto de renderizado.
- Toda lectura de `localStorage` va envuelta en `try/catch`; si falla, se trata como "sin sesión".

Dos puntos de deuda deliberada. `av_scores` se escribe y nunca se lee: el template hace lo mismo, y conectarlo exigiría decidir cómo se mezclan las puntuaciones reales con las de semilla. Las claves no llevan prefijo de versión porque son datos mock desechables; cuando llegue el backend se borran, no se migran.

---

## Plan de implementación

Cada paso deja la app compilando y navegable. Antes de tocar código de Next, leer las guías de `node_modules/next/dist/docs/01-app/` — este proyecto va con Next 16.2.10 y las APIs recordadas de versiones anteriores no sirven.

1. **Base de estilos.** Copiar `references/templates/styles.css` a `app/globals.css`, conservando el `@import "tailwindcss"` arriba. Borrar el CSS del scaffold (`--background`, `--foreground`, `body { font-family: Arial }`). Verificación: `npm run dev` levanta sin errores de PostCSS.

2. **Layout raíz.** Reescribir `app/layout.tsx`: `lang="es"`, los `<link>` de Google Fonts (Press Start 2P, Courier Prime, JetBrains Mono), los `<div class="av-bg">` y `<div class="av-noise">`, el `<main className="av-main">` y el footer `© 2026 ARCADE VAULT · v2.6.0`. Quitar Geist. `metadata`: título "Arcade Vault · Portal Retro". Verificación: fondo oscuro con ruido y el footer en neón.

3. **Datos.** Crear `lib/games.ts` con el tipo `Game`, los 8 juegos, `CATS` y `getGame(id)`. Crear `lib/scores.ts` con `ScoreRow`, `PLAYERS` y `seededScores`. Portado directo de `data.jsx`, ahora tipado. Verificación: `npx tsc --noEmit` limpio.

4. **Sesión.** Crear `lib/session.ts` con los tipos `User` y `SavedScore`, y los helpers `readUser()`, `writeUser()`, `clearUser()`, `saveScore()`, todos con `try/catch`. Crear `components/session-provider.tsx`: Client Component con contexto que expone `{ user, login, signOut }`, hidratando desde `localStorage` en un `useEffect`. Montarlo en el layout. Verificación: el contexto se lee sin romper la hidratación.

5. **Nav.** Crear `components/nav.tsx` (Client Component). Logo, enlaces con `<Link>`, `usePathname()` para el estado activo, contador `CRÉDITOS · 03`, botón de sesión que consume el contexto y el panel móvil con hamburguesa. Montarlo en el layout. Verificación: el panel móvil abre y cierra; los enlaces navegan.

6. **Biblioteca — tarjeta.** Crear `components/game-card.tsx` (Client Component, por el tilt 3D en `onMouseMove`). Portada, etiqueta de categoría, título, descripción corta, mejor puntuación y botón JUGAR tintado por `game.color`. La tarjeta entera enlaza al detalle. Verificación: la tarjeta se inclina al pasar el ratón.

7. **Biblioteca — pantalla.** Crear `components/library.tsx` (Client Component: búsqueda y chips) y reemplazar `app/page.tsx` para que lo renderice. Héroe con el título parpadeante, buscador, chips de `CATS`, grilla filtrada y el estado vacío "NO HAY RESULTADOS". Verificación: buscar "cai" deja solo CAÍDA; el chip PUZZLE filtra; una búsqueda absurda muestra el estado vacío.

8. **Detalle.** Crear `app/juegos/[id]/page.tsx` como Server Component: `params` es una promesa en Next 16, hay que esperarla. Si `getGame(id)` no encuentra nada, `notFound()`. Portada, etiquetas, descripción larga, tira de estadísticas, botones de acción y la tabla lateral de mejores puntuaciones con `seededScores(id.length * 17 + 3, 10)`. Todo estático: ningún `"use client"` aquí. Verificación: `/juegos/caida` renderiza; `/juegos/xyz` da 404.

9. **404 arcade.** Crear `app/not-found.tsx` con estética arcade ("GAME OVER · 404") y un botón de vuelta a la biblioteca. Verificación: `/juegos/xyz` muestra esta página, no la de Next.

10. **Reproductor — chasis.** Crear `app/juegos/[id]/jugar/page.tsx` (Server Component: resuelve `params`, valida el juego con `notFound()`) que renderiza `components/game-player.tsx` (Client Component). En este paso solo el HUD y el CRT: jugador, puntuación, vidas, nivel, la arena decorativa y la barra `SEÑAL OK · CRT-83 · 60 HZ`. Verificación: `/juegos/caida/jugar` muestra el marco CRT con la puntuación en cero.

11. **Reproductor — simulación.** Añadir a `game-player.tsx` el `setInterval` de 220 ms que sube la puntuación, la subida de nivel cada 2500 puntos, el botón de PAUSA con su superposición y el botón FIN. Verificación: la puntuación sube sola; PAUSA la congela y muestra "EN PAUSA".

12. **Reproductor — modal de fin.** Añadir el modal FIN DEL JUEGO: puntuación final, campo de iniciales, botón que llama a `saveScore()`, el aviso "▸ PUNTUACIÓN GUARDADA_", y los botones de reiniciar y volver. Verificación: FIN abre el modal; guardar escribe en `av_scores` (visible en DevTools); reiniciar vuelve a cero.

13. **Auth.** Crear `app/auth/page.tsx` y `components/auth-form.tsx` (Client Component). Pestañas iniciar/crear, el campo de correo que aparece solo al crear cuenta, envío que llama a `login()` y redirige a `/` con `useRouter()`, botón de invitado y los botones sociales inertes. Verificación: enviar el formulario con "px_kai" deja "PX_KAI ▾" en el Nav; recargar mantiene la sesión.

14. **Salón de la Fama.** Crear `app/salon/page.tsx` y `components/hall-of-fame.tsx` (Client Component: pestañas y contexto de sesión). Cabecera, chips por juego, podio de tres, tabla de 12 con `seededScores(tab.length * 23 + 7, 12)` y la fila "TU MEJOR MARCA" cuando hay sesión. Verificación: cambiar de pestaña cambia las filas; sin sesión no aparece la fila amarilla.

15. **Limpieza.** Borrar los SVG del scaffold en `public/` (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`). Pasar `npm run lint` y `npm run build`. Verificación: build de producción sin errores ni avisos de ESLint.

Sobre el orden: el paso 4 va antes que el 5 porque el Nav ya necesita saber si hay sesión. El reproductor se parte en tres pasos (10, 11, 12) porque el componente completo pasa de 90 líneas.

---

## Criterios de aceptación

**Build y calidad**

- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` no reporta errores ni avisos.
- [ ] `npx tsc --noEmit` pasa en modo strict.
- [ ] La consola del navegador no muestra errores ni avisos de hidratación en ninguna de las cinco rutas.

**Layout y navegación**

- [ ] Las cinco rutas responden: `/`, `/juegos/caida`, `/juegos/caida/jugar`, `/auth`, `/salon`.
- [ ] `/juegos/no-existe` renderiza el 404 arcade propio, no el de Next.
- [ ] El `<html>` declara `lang="es"`.
- [ ] El Nav y el footer aparecen en las cinco rutas.
- [ ] Estando en `/salon`, el enlace "Salón de la Fama" del Nav se ve activo.
- [ ] Estando en `/juegos/caida`, el enlace activo del Nav es "Biblioteca".
- [ ] A 600 px de ancho aparece la hamburguesa; al pulsarla se abre el panel lateral, y pulsar el fondo lo cierra.
- [ ] El título de la pestaña del navegador es "Arcade Vault · Portal Retro".
- [ ] Ningún archivo importa Geist.

**Biblioteca**

- [ ] Se renderizan las 8 tarjetas de `GAMES`.
- [ ] Escribir "cai" en el buscador deja únicamente la tarjeta CAÍDA.
- [ ] Pulsar el chip PUZZLE deja únicamente CAÍDA; el chip TODOS restaura las 8.
- [ ] Buscar "zzzz" muestra el bloque "NO HAY RESULTADOS".
- [ ] Pasar el ratón sobre una tarjeta la inclina; al salir vuelve a su posición.
- [ ] Pulsar la tarjeta y pulsar su botón JUGAR llevan ambos a `/juegos/<id>`.

**Detalle**

- [ ] `/juegos/caida` muestra el título CAÍDA, su descripción larga y la etiqueta PUZZLE.
- [ ] La mejor puntuación se muestra como `184.220` (separador de miles español).
- [ ] La tabla lateral lista 10 filas, ordenadas de mayor a menor puntuación.
- [ ] Las tres primeras filas llevan el resaltado de oro, plata y bronce.
- [ ] Recargar `/juegos/caida` produce exactamente las mismas 10 filas.
- [ ] "▶ JUGAR AHORA" lleva a `/juegos/caida/jugar`.
- [ ] El HTML servido por `/juegos/caida` ya contiene la tabla de puntuaciones (es Server Component).

**Reproductor**

- [ ] La puntuación empieza en 0 y sube sola dentro del primer segundo.
- [ ] PAUSA congela la puntuación y muestra la superposición "EN PAUSA"; REANUDAR la reactiva.
- [ ] Se muestran 3 vidas como corazones y el nivel con dos dígitos (`01`).
- [ ] FIN abre el modal con la puntuación final formateada.
- [ ] Guardar en el modal añade una entrada a `av_scores` en `localStorage` y muestra "▸ PUNTUACIÓN GUARDADA_".
- [ ] El campo de iniciales fuerza mayúsculas y corta a 10 caracteres.
- [ ] "JUGAR DE NUEVO" cierra el modal y deja la puntuación en 0.
- [ ] Con sesión iniciada, el HUD muestra el nombre del usuario; sin sesión, "INVITADO".
- [ ] La arena no responde a ninguna tecla ni clic. No hay juego.

**Auth**

- [ ] La pestaña CREAR CUENTA añade el campo de correo; INICIAR SESIÓN lo quita.
- [ ] Enviar con usuario "px_kai" redirige a `/` y el Nav pasa a mostrar "PX_KAI ▾".
- [ ] Enviar con los campos vacíos entra igual, como "PLAYER1".
- [ ] Recargar la página mantiene la sesión.
- [ ] Pulsar "PX_KAI ▾" cierra la sesión y el Nav vuelve a "Iniciar Sesión".
- [ ] "JUGAR COMO INVITADO" lleva a `/` sin crear sesión.
- [ ] Los botones de Google y GitHub no hacen nada al pulsarlos.

**Salón de la Fama**

- [ ] Hay una pestaña por cada uno de los 8 juegos; cambiarla cambia las filas.
- [ ] El podio muestra los puestos 2, 1 y 3 en ese orden visual, con el campeón elevado.
- [ ] La tabla lista 12 filas con rango, jugador, puntuación y fecha.
- [ ] Sin sesión no aparece la fila "TU MEJOR MARCA".
- [ ] Con sesión aparece esa fila en amarillo con el nombre del usuario.

---

## Decisiones

**Arquitectura y rutas**

- **Sí:** rutas reales del App Router (`/juegos/[id]`, `/juegos/[id]/jugar`). Dan URLs compartibles, prefetch con `<Link>` y permiten que el detalle sea Server Component.
- **No:** portar el router por `location.hash` del template. Era la solución de un prototipo de un solo archivo HTML; en Next desperdicia el framework.
- **Sí:** `"use client"` granular, solo en lo interactivo (Nav, biblioteca, tarjeta, reproductor, auth, salón). Deja el detalle como Server Component y sirve de base correcta cuando lleguen datos reales.
- **No:** marcar toda la app como cliente. Habría sido más rápido y habría que deshacerlo en la primera spec de backend.
- **Sí:** `notFound()` con `app/not-found.tsx` propio. Con URLs reales la gente escribe rutas malas; el `return null` del template dejaría una página en blanco.

**Estilos y fuentes**

- **Sí:** portar `styles.css` casi literal a `app/globals.css`. El CSS ya existe y funciona; reescribirlo arriesga el look neón sin ganar nada visible.
- **No:** reescribir las 950 líneas a utilidades Tailwind. Semanas de trabajo para llegar, en el mejor caso, al mismo píxel.
- **No:** el híbrido CSS temático + Tailwind para layout. Dos sistemas de layout conviviendo confunden más de lo que ahorran.
- **Sí:** Tailwind v4 se queda instalado y con su `@import` en `globals.css`, aunque casi no se use. Sacarlo del build es otra decisión y no urge.
- **Sí:** `<link>` a Google Fonts, decisión del usuario. Mantiene el prototipo y el proyecto idénticos.
- **No:** `next/font/google`. Autoalojaría las fuentes y evitaría el salto de tipografía, pero el usuario prefiere el `<link>`. Reversible en una línea si el CLS molesta.
- **Sí:** eliminar Geist. El scaffold lo carga y ya no lo usa nadie.

**Datos y sesión**

- **Sí:** dividir `data.jsx` en `lib/games.ts` y `lib/scores.ts`. Los juegos son un catálogo; las puntuaciones son un generador. Cambian por razones distintas.
- **No:** un único `lib/data.ts`. Mezclaría catálogo y generador en el archivo que más va a crecer.
- **Sí:** conservar `seededScores` determinista con las mismas semillas del template. Sin aleatoriedad, un Server Component puede generar las filas sin desincronizarse con el cliente al hidratar.
- **Sí:** contexto de React para la sesión mock. El Nav, el reproductor y el Salón necesitan el mismo `user`; pasarlo por props desde el layout no llega a un Server Component intermedio.
- **Sí:** claves `av_user` y `av_scores` sin prefijo de versión. Datos mock desechables; cuando llegue el backend se borran, no se migran.
- **No:** `av_scores:v1`. Versionar algo que nadie lee todavía es ceremonia.
- **Sí:** `av_scores` se escribe y no se lee, igual que el template. Mezclar puntuaciones guardadas con las de semilla exige decidir el orden y el empate, y eso es otra spec.
- **Sí:** aceptar el parpadeo de "TU MEJOR MARCA" al hidratar. Es mock y desaparece cuando haya sesión de servidor.

**Producto**

- **Sí:** portar la simulación completa del reproductor (puntuación falsa, vidas, nivel, pausa, modal). Es lo único que hace visibles todos los estados de esa pantalla.
- **No:** un CRT estático sin contador. Más honesto, pero deja la mitad de la interfaz sin poder verse.
- **Sí:** mantener los adornos inertes del template: `CRÉDITOS · 03`, los botones de Google y GitHub, `v2.6.0` en el footer. Son parte del look; conectarlos es otra spec.
- **Sí:** el credo de esta spec es que ningún juego es jugable. Cualquier tentación de "ya que estoy, implemento Serpentina" va a su propia spec.

---

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El *preflight* de Tailwind v4 pisa reglas de `styles.css` (márgenes, `button`, `input`). El template nunca convivió con un reset. | `@import "tailwindcss"` va **antes** del CSS portado, para que el CSS del template gane por orden de cascada. Revisar botones, campos y títulos en las cinco pantallas antes de dar el paso 1 por cerrado. |
| Desajuste de hidratación en el Nav y el Salón: el servidor no ve `localStorage`, así que renderiza "Iniciar Sesión" y el cliente puede querer pintar "PX_KAI ▾". | El contexto arranca en `null` y solo lee `localStorage` dentro de `useEffect`. El primer render del cliente coincide con el del servidor; la sesión aparece después. Es la causa del parpadeo ya aceptado. |
| En Next 16 `params` es una promesa. El código recordado de Next 14 (`params.id` directo) compila mal o rompe en runtime. | Leer `node_modules/next/dist/docs/01-app/` antes del paso 8, tal como exige `AGENTS.md`. Los pasos 8 y 10 son los expuestos. |
| El `<link>` a Google Fonts bloquea el render; Press Start 2P es la fuente de todos los titulares. Si tarda, se ve un salto de tipografía. | Asumido: es la opción elegida. Se conservan los `preconnect` del template. Si molesta, se cambia a `next/font/google` en un commit. |
| Deriva de alcance: ocho juegos con nombre, portada y HUD son una invitación permanente a implementar uno. | El criterio "la arena no responde a ninguna tecla ni clic" lo bloquea de forma verificable. Un juego jugable hace fallar la aceptación de esta spec. |
| El tilt 3D de las tarjetas escribe `style.transform` en cada `mousemove`. Con 8 tarjetas puede ir a tirones en equipos modestos. | Portado tal cual del template, que ya se comporta bien. Si aparece jank, se mide antes de tocar nada. |

---

## Lo que **no** entra en esta spec

- Ningún juego jugable. Ninguno de los ocho.
- Backend, base de datos, API y puntuaciones reales.
- Autenticación real y OAuth funcional.
- Sistema de créditos.
- Tests, SEO e internacionalización.
- Migración de los estilos a Tailwind.

Cada una de esas cosas, si llega, va en su propia spec.
