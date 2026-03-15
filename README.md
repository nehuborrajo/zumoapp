# StudyBuddy

App EdTech tipo "Duolingo para estudiar cualquier materia" donde el usuario sube su propio contenido y la IA genera flashcards, quizzes, y modos de estudio, con gamificación social.

## Stack Tecnológico

- **Frontend:** Next.js 14+, TypeScript, Tailwind CSS, Framer Motion
- **State Management:** Zustand
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** Clerk
- **AI:** OpenAI (GPT-4o-mini / GPT-4o)
- **File Storage:** Cloudflare R2
- **OCR:** Google Cloud Vision

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/           # Páginas de autenticación
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/      # Páginas del dashboard (protegidas)
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── study/
│   │   ├── leaderboard/
│   │   ├── shop/
│   │   └── profile/
│   ├── api/              # API Routes
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Componentes UI reutilizables
│   └── layout/           # Componentes de layout
├── lib/
│   ├── prisma.ts         # Cliente de Prisma
│   └── utils.ts          # Utilidades
└── store/
    └── user-store.ts     # Zustand store
```

## Configuración

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Copiar `.env.example` a `.env` y configurar las variables:
   ```bash
   cp .env.example .env
   ```

4. Configurar las siguientes variables de entorno:
   - `DATABASE_URL` - URL de PostgreSQL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `OPENAI_API_KEY` - API key de OpenAI

5. Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

6. Ejecutar migraciones (cuando tengas la DB):
   ```bash
   npx prisma migrate dev
   ```

7. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Páginas Implementadas

- **/** - Landing page con información del producto
- **/sign-in** - Inicio de sesión con Clerk
- **/sign-up** - Registro con Clerk
- **/dashboard** - Dashboard principal con estadísticas y documentos recientes
- **/documents** - Gestión de documentos con upload
- **/study** - Modos de estudio (flashcards, quiz, V/F)
- **/leaderboard** - Ligas semanales y ranking de amigos
- **/shop** - Tienda de items para avatar y power-ups
- **/profile** - Perfil con logros, estadísticas y rachas

## Funcionalidades (MVP - Fase 1)

- [x] Landing page
- [x] Autenticación con Clerk
- [x] Dashboard con estadísticas
- [x] Gestión de documentos (UI)
- [x] Modos de estudio (UI con flashcards funcionales)
- [x] Sistema de gamificación (XP, niveles, rachas, monedas)
- [x] Ligas semanales (UI)
- [x] Tienda de items (UI)
- [x] Perfil con logros (UI)
- [ ] Upload real de documentos a R2
- [ ] Procesamiento con OCR (Google Vision)
- [ ] Generación de contenido con IA (OpenAI)
- [ ] API endpoints funcionales
- [ ] Persistencia en base de datos

## Próximos Pasos

1. Configurar Clerk en producción
2. Configurar PostgreSQL (Railway/Render)
3. Implementar API de upload de documentos
4. Integrar OpenAI para generación de contenido
5. Conectar el frontend con las APIs

## Desarrollo

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Lint
npm run lint

# Prisma Studio (para ver la DB)
npx prisma studio
```

## Licencia

Privado - Todos los derechos reservados
