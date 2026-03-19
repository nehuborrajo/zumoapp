# StudyBuddy - Documentación para Claude

## Descripción del Proyecto

StudyBuddy es una aplicación EdTech tipo "Duolingo para estudiar cualquier materia". Los usuarios suben su propio contenido (PDFs, texto) y la IA genera automáticamente flashcards y preguntas para estudiar, con gamificación social (XP, niveles, rachas, logros, ligas).

**Modelo de negocio:** Freemium con suscripción mensual/anual.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16+ (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| Base de datos | PostgreSQL (Supabase) |
| ORM | Prisma 7 con adapter `@prisma/adapter-pg` |
| Autenticación | Supabase Auth |
| IA | OpenAI API (gpt-4o-mini para free, gpt-4o para premium) |
| Storage | Cloudflare R2 (pendiente) |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/              # Páginas de autenticación
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/         # Páginas protegidas (layout con sidebar)
│   │   ├── containers/      # Gestión de cursos
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── documents/       # Lista de documentos
│   │   ├── leaderboard/     # Tabla de clasificación
│   │   ├── profile/         # Perfil de usuario
│   │   ├── shop/            # Tienda de items
│   │   └── study/           # Página de estudio (minijuegos)
│   ├── api/                 # API Routes
│   │   ├── achievements/
│   │   ├── courses/
│   │   ├── documents/
│   │   ├── study-sessions/
│   │   ├── subjects/
│   │   └── users/
│   └── auth/callback/       # Callback de Supabase Auth
├── components/
│   └── ui/                  # Componentes reutilizables (Button, Card, Badge, etc.)
├── hooks/                   # Custom hooks
│   ├── useCourses.ts
│   ├── useDocuments.ts
│   └── useFlashcards.ts
└── lib/
    ├── api.ts               # Cliente API (fetch wrappers + tipos)
    ├── auth.ts              # getCurrentUser() helper
    ├── openai.ts            # Integración OpenAI
    ├── prisma.ts            # Cliente Prisma con adapter
    ├── supabase/            # Clientes Supabase (client/server)
    └── utils.ts             # Utilidades varias
```

---

## Modelo de Datos (Jerarquía)

```
User
└── Container (Curso)
    └── Subject (Materia)
        └── Document (Documento con texto)
            ├── Flashcard (tarjeta de estudio)
            └── Question (pregunta de quiz/V-F)

User también tiene:
├── StudySession (sesiones completadas)
├── UserAchievement (logros desbloqueados)
├── UserInventory (items comprados)
└── LeagueParticipant (participación en ligas)
```

### Campos importantes de User:
- `level`, `totalXp`, `coins` - Gamificación
- `currentStreak`, `longestStreak`, `lastStudyDate` - Rachas
- `currentLeague` - Liga actual (BRONZE → RUBY)
- `isPremium`, `premiumUntil` - Estado premium

---

## APIs Implementadas

### Cursos y Contenido
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/courses` | GET, POST | Listar/crear cursos |
| `/api/courses/[courseId]` | GET, PATCH, DELETE | CRUD de curso |
| `/api/courses/[courseId]/subjects` | GET, POST | Materias de un curso |
| `/api/subjects/[subjectId]` | GET, PATCH, DELETE | CRUD de materia |
| `/api/subjects/[subjectId]/documents` | GET, POST | Documentos de una materia |
| `/api/subjects/[subjectId]/flashcards` | GET | Flashcards de toda la materia |
| `/api/subjects/[subjectId]/questions` | GET | Questions de toda la materia |
| `/api/documents/[documentId]` | GET, PATCH, DELETE | CRUD de documento |
| `/api/documents/[documentId]/generate` | POST | Generar flashcards/questions con IA |
| `/api/documents/[documentId]/flashcards` | GET | Flashcards del documento |
| `/api/documents/[documentId]/questions` | GET | Questions del documento |
| `/api/flashcards/[flashcardId]` | GET, PATCH | Flashcard individual (PATCH actualiza SM-2) |
| `/api/flashcards/due` | GET | Flashcards pendientes de repaso (SM-2) |

### Gamificación
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/study-sessions` | GET, POST | Sesiones de estudio (actualiza weeklyXp en liga) |
| `/api/achievements` | GET | Lista de logros con estado |
| `/api/users/me` | GET, PATCH | Datos del usuario actual |

### Ligas
| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/leagues/current` | GET | Liga actual del usuario (auto-asigna si no tiene) |
| `/api/cron/process-leagues` | POST | Job semanal para promociones/descensos (Vercel Cron) |

---

## Modos de Estudio

La página `/study` tiene 3 modos implementados:

1. **Flashcards** (10 XP/correcta)
   - Voltear tarjeta para ver respuesta
   - Botones: "No lo sabía", "Más o menos", "¡Lo sabía!"
   - **Repaso inteligente (SM-2):** Opción para estudiar solo tarjetas pendientes de repaso

2. **Quiz** (15 XP/correcta)
   - Preguntas de opción múltiple (MULTIPLE_CHOICE)
   - Feedback visual al seleccionar
   - Muestra explicación si existe

3. **Verdadero/Falso** (5 XP/correcta)
   - Preguntas TRUE_FALSE
   - Avance automático tras 1.8s
   - Muestra respuesta correcta si falla

4. **Tutor IA** (Premium, pendiente)

---

## Spaced Repetition (SM-2)

El algoritmo SM-2 optimiza cuándo repasar cada flashcard basándose en la calidad de respuesta.

### Implementación
- **Algoritmo:** `src/lib/sm2.ts`
- **API PATCH:** `/api/flashcards/[flashcardId]` - actualiza SM-2 tras respuesta
- **API GET:** `/api/flashcards/due` - obtiene flashcards pendientes de repaso

### Mapeo de botones a calidad SM-2
| Botón | Calidad | Resultado |
|-------|---------|-----------|
| "No lo sabía" | 1 | Incorrecto - reinicia repeticiones, interval=1 |
| "Más o menos" | 3 | Correcto difícil - incrementa interval |
| "¡Lo sabía!" | 5 | Perfecto - incrementa interval exponencialmente |

### Campos de Flashcard (Prisma)
- `easeFactor`: Factor de facilidad (default 2.5, mín 1.3)
- `interval`: Días hasta próximo repaso
- `repetitions`: Repeticiones correctas consecutivas
- `nextReviewAt`: Fecha del próximo repaso

---

## Sistema de Gamificación

### XP y Niveles
- XP se gana por respuestas correctas
- Fórmula de nivel: XP acumulado progresivo
- Al subir de nivel se muestra notificación

### Rachas
- Se incrementa si estudias en días consecutivos
- Se resetea a 1 si pierdes un día
- `streakFreezes` permiten pausar la racha (pendiente implementar uso)

### Logros (13 iniciales)
- **Sesiones:** Primer Paso (1), Estudiante Dedicado (10), Máquina de Aprender (50), Maestro del Estudio (100)
- **Rachas:** En Racha (3), Semana Perfecta (7), Hábito Formado (30), Leyenda de la Constancia (100)
- **XP:** Aprendiz (500), Estudiante Avanzado (2500), Erudito (10000), Sabio Legendario (50000)
- **Precisión:** Perfeccionista (100% en una sesión)

### Monedas
- Se ganan por bonus de precisión (70%+, 80%+, 90%+, 100%)
- Se usan en la tienda para comprar items

### Tienda (Shop)
- **Consumibles:** Streak Freeze, XP Boost (x2, x3), Coin Multiplier
- **Temas:** Dark Pure, Ocean, Forest, Sunset, Neon, Gold
- **Powerups:** Weekly Freeze, etc.
- Items tienen propiedades dinámicas en JSON (`properties`)
- API: `/api/shop` (GET items), `/api/shop/buy` (POST), `/api/shop/inventory` (GET), `/api/shop/use` (POST), `/api/shop/equip` (POST)

### Ligas Semanales
- **Máximo 30 usuarios** por liga
- **6 tiers:** BRONZE → SILVER → GOLD → PLATINUM → DIAMOND → RUBY
- **Ciclo semanal:** Lunes 00:00 UTC a Domingo 23:59 UTC
- **Zonas:** Top 3 ascienden, últimos 3 descienden (ajustable para ligas pequeñas)
- **Recompensas por posición:**
  - 1º: 100 coins + 500 XP
  - 2º: 75 coins + 350 XP
  - 3º: 50 coins + 200 XP
  - 4º-5º: 25/20 coins + 100/75 XP
  - Resto: 10 coins + 25 XP
- **Asignación lazy:** Usuario se une a liga al visitar `/leaderboard`
- **weeklyXp:** Se actualiza automáticamente al completar sesiones de estudio
- **Vercel Cron:** Procesa ligas cada lunes (requiere `CRON_SECRET` en env)

---

## Generación con IA

El endpoint `/api/documents/[documentId]/generate` usa OpenAI para:

1. **Flashcards:** Extrae conceptos clave del texto
2. **Questions:** Genera MULTIPLE_CHOICE y TRUE_FALSE

Modelos:
- FREE users: `gpt-4o-mini`
- PREMIUM users: `gpt-4o`

La función `getOpenAIClient()` en `lib/openai.ts` usa lazy initialization para evitar errores en build.

---

## Autenticación

- Supabase Auth con email/password
- `getCurrentUser()` en `lib/auth.ts` obtiene el usuario de la sesión
- El usuario de Supabase se sincroniza con la tabla `User` de Prisma
- Middleware protege rutas del dashboard

---

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Prisma
npx prisma generate          # Regenerar cliente
npx prisma db push           # Push schema a DB
npx prisma studio            # UI para ver datos

# Seed de logros
npx tsx prisma/seed-achievements.ts
```

---

## Variables de Entorno (.env)

```
DATABASE_URL=postgresql://...          # Supabase connection string
DIRECT_URL=postgresql://...            # Direct connection (opcional)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=sk-...
```

---

## Estado Actual del Proyecto

### Completado ✅
- [x] Setup Next.js + TypeScript + Tailwind
- [x] Autenticación con Supabase
- [x] Modelo de datos completo (Prisma)
- [x] CRUD de Cursos/Materias/Documentos
- [x] Generación de flashcards/questions con OpenAI
- [x] 3 modos de estudio (Flashcards, Quiz, V/F)
- [x] Sistema de XP, niveles, rachas
- [x] Sistema de logros (13 logros)
- [x] Página de perfil con stats reales
- [x] Guardar sesiones de estudio en DB
- [x] Upload de archivos PDF (Supabase Storage)
- [x] OCR para PDFs escaneados (Tesseract.js)
- [x] Edición de contenido de documentos de texto
- [x] Tienda con items comprables (consumibles, temas, powerups)
- [x] Ligas semanales funcionales (30 usuarios/liga, promoción/descenso, recompensas)
- [x] Spaced repetition (SM-2) para flashcards

### Pendiente 📋
- [ ] Mascota/Avatar de la app (estilo Duo de Duolingo)
- [ ] Avatar personalizable de usuarios
- [ ] Sistema de amigos
- [ ] Tutor IA conversacional (Premium)
- [ ] Pagos con Stripe
- [ ] Ads para usuarios free

---

## Preferencias de UI/UX

- **Tarjetas de tienda:** Altura fija `h-56`, padding `p-4`, iconos `h-14 w-14` - compactas y uniformes
- **Estilo general:** Limpio, moderno, con animaciones sutiles (Framer Motion)

---

## Notas Técnicas

### Prisma 7 con Supabase
Usa `@prisma/adapter-pg` para conexión. Ver `lib/prisma.ts`.

### UserContext (Estado Global del Usuario)
El estado del usuario (XP, nivel, monedas, racha) se maneja con React Context en `contexts/UserContext.tsx`.
- `UserProvider` envuelve el layout del dashboard
- `useUser()` hook retorna: `user`, `loading`, `refetch`, `updateUser`, y valores de XP calculados
- Después de ganar XP (completar sesión de estudio), se llama `refetch()` para actualizar sidebar/header

### Dropdowns en contenedores con overflow
Los menús contextuales usan React Portal para escapar de `overflow-hidden`. Ver componente `DropdownMenu` en `containers/[containerId]/page.tsx`.

### Build Errors Comunes
- **OpenAI API key missing:** La inicialización es lazy en `lib/openai.ts`
- **Prisma client options:** El adapter requiere opciones específicas

---

## Flujo de Usuario Típico

1. **Registro/Login** → Dashboard
2. **Crear Curso** → Crear Materia → Crear Documento (pegar texto)
3. **Generar contenido** → Click en "Generar Flashcards"
4. **Estudiar** → Seleccionar curso/materia/modo → Completar sesión
5. **Ver progreso** → Perfil con XP, nivel, racha, logros

---

## Contacto del Proyecto

Proyecto personal de EdTech gamificada. El plan completo está en:
`C:\Users\I759578\.claude\plans\soft-percolating-mccarthy.md`
