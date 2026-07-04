# BosStore — Tienda de Videojuegos Digitales

Proyecto **full-stack** de una tienda de videojuegos digitales con panel de administración, carrito persistente, lista de deseos, reseñas, pagos con Stripe y autenticación con Google, Discord y correo con código OTP.

**Funcionalidades de tienda:** catálogo con búsqueda por texto (título, género, desarrollador), filtros por género/plataforma/ofertas, ordenamiento (precio, nombre, descuento, fecha) y paginación; página de **Ofertas** con la mejor oferta destacada y ahorro calculado; **Novedades** con el último lanzamiento en portada y línea de tiempo por año; historial de pedidos del usuario en su cuenta y gestión de pedidos con estadísticas de ingresos en el panel admin. Precios en **USD**, la misma moneda que procesa Stripe.

---

## Integrantes

- AGUIRRE SAAVEDRA, JUAN ALEXIS
- ALFONSO SOLORZANO, SAMIR HAZIEL
- BOZA NUÑEZ, JHON ANDHERSON
- GALVAN MORALES, LUIS ENRIQUE
- MAS PINTO, ROBERTO FERNANDO
- MONTOYA CUADROS, ALDY JENXY

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend** | Next.js (App Router) + Tailwind CSS | 15 |
| **Backend** | Express + TypeScript | 4 / 5 |
| **Base de datos** | Supabase (PostgreSQL) | — |
| **Auth** | Supabase Auth (OAuth + OTP email) | — |
| **Storage** | Supabase Storage | — |
| **Pagos** | Stripe Checkout | — |
| **Estado global** | Zustand (persistido en localStorage) | — |
| **Validación API** | Zod | — |
| **JWT** | jose (verificación vía JWKS) | — |
| **Email** | Nodemailer + Gmail SMTP | — |
| **Docs API** | Swagger UI (OpenAPI 3.0) | — |

---

## Arquitectura

```
Navegador
    │
    ▼
bozstore-web (Next.js 15)          bozstore-api (Express)
    │                                      │
    │  JWT en cookie HttpOnly              │  service_role key (secreta)
    │  anon key (pública)                  ▼
    └──────────────── Supabase ────────────┘
                  Postgres · Auth · Storage
                          │
                          ▼
                       Stripe
```

**Decisiones clave:**
- El frontend **nunca escribe datos sensibles directamente** en Supabase. Todas las mutaciones pasan por el API con la `service_role` key.
- El API verifica los JWT de Supabase usando el endpoint JWKS (`jose`), sin secreto compartido.
- El rol del usuario (`admin` / `cliente`) vive en `app_metadata` (Supabase), fuera del alcance del usuario.
- El webhook de Stripe recibe el **body crudo (Buffer)** — excluido del parser JSON — para poder verificar la firma.
- Las imágenes (portadas/banners) se envían como **base64** en el body JSON (límite 12 MB).
- El cliente de Supabase (`supabaseAdmin`) actúa como ORM: queries tipadas, sin necesidad de Prisma o Sequelize.

---

## Estructura del proyecto

```
BosStore/
├── bozstore-web/                   Frontend (Next.js)
│   └── src/
│       ├── app/
│       │   ├── (marketing)/        Landing page
│       │   ├── (shop)/             Catálogo, detalle, checkout, ofertas, novedades
│       │   ├── (auth)/             Login, registro OTP, recuperar contraseña
│       │   ├── (info)/             Términos, privacidad, soporte
│       │   ├── admin/              Panel de administración
│       │   ├── account/            Perfil del usuario
│       │   ├── sitemap.ts          Sitemap dinámico (catálogo de juegos)
│       │   └── robots.ts           Reglas para rastreadores
│       ├── components/             Navbar, Footer, GameGrid, Cart, Admin forms...
│       ├── lib/                    Supabase client/server, utilidades de precios
│       ├── store/                  Zustand: carrito y wishlist (localStorage)
│       └── middleware.ts           Protección de rutas /account y /admin
│
└── bozstore-api/                   Backend (Express)
    └── src/
        ├── config/                 env.ts, supabase.ts, stripe.ts, swagger.ts
        ├── middlewares/            auth (JWT), requireRole, validate (Zod), errorHandler
        ├── modules/
        │   ├── auth/               Registro con OTP por email (request + verify)
        │   ├── games/              CRUD de juegos (GET público con búsqueda/paginación, mutaciones solo admin)
        │   ├── orders/             Órdenes del usuario + listado global (admin)
        │   ├── payments/           Stripe Checkout, confirm, session, webhook
        │   └── uploads/            Subida de imágenes a Supabase Storage
        ├── routes/index.ts         Router principal + Swagger UI montado en /docs
        ├── lib/                    AppError, mailer (Nodemailer)
        ├── db/schema.sql           Esquema completo de la base de datos
        └── scripts/create-admin.ts Crear usuario administrador
```

---

## Instalación

### Requisitos
- Node.js 18 o superior
- Cuenta de [Supabase](https://supabase.com) (gratuita)
- Cuenta de [Stripe](https://stripe.com) — para pagos (opcional en desarrollo)
- Cuenta de Gmail con una **App Password** — para enviar OTP por correo (opcional)

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuanAguirre10/BosStore.git
cd BosStore
```

### 2. Configurar Supabase

1. Crear un nuevo proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutar todo el contenido de `bozstore-api/db/schema.sql`.
3. En **Storage → New bucket**: nombre `game-images`, marcar como **Public**.
4. Anotar desde **Project Settings → API**:
   - `Project URL`
   - `anon public` key (para el frontend)
   - `service_role` key (solo para el backend — nunca exponerla)

### 3. Configurar el backend

```bash
cd bozstore-api
npm install
copy .env.example .env      # Windows
# cp .env.example .env       # macOS/Linux
```

Editar `.env` con las claves de Supabase, Stripe y SMTP (ver `.env.example` para los nombres de cada variable).

Iniciar el servidor:

```bash
npm run dev       # http://localhost:4000
```

### 4. Configurar el frontend

```bash
cd bozstore-web
npm install
copy .env.example .env.local
```

Editar `.env.local` con la URL de Supabase, la `anon key` y la URL del API.

Iniciar el sitio:

```bash
npm run dev       # http://localhost:3000
```

### 5. Crear usuario administrador

Con el backend en ejecución:

```bash
cd bozstore-api
npx tsx scripts/create-admin.ts tucorreo@ejemplo.com TuClave123
```

Luego iniciar sesión en `/login` y acceder a `/admin`.

---

## API — documentación interactiva

Con el backend en ejecución, la documentación Swagger UI está disponible en:

```
http://localhost:4000/api/v1/docs
```

El spec en formato JSON:

```
http://localhost:4000/api/v1/docs.json
```

### Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/v1/health` | — | Estado del servidor |
| POST | `/api/v1/auth/register/request` | — | Enviar código OTP por email |
| POST | `/api/v1/auth/register/verify` | — | Verificar OTP y crear cuenta |
| GET | `/api/v1/games` | — | Listar catálogo — `?q=` busca en título/género/desarrollador; `?limit=&offset=` paginan (devuelve `meta.total`) |
| GET | `/api/v1/games/:slug` | — | Detalle de un juego |
| POST | `/api/v1/games` | Admin | Crear juego |
| PATCH | `/api/v1/games/:slug` | Admin | Actualizar juego |
| DELETE | `/api/v1/games/:slug` | Admin | Eliminar juego |
| GET | `/api/v1/orders` | Usuario | Listar órdenes del usuario (con ítems) |
| GET | `/api/v1/orders/:id` | Usuario | Detalle de una orden propia |
| GET | `/api/v1/orders/all` | Admin | Todas las órdenes de la tienda |
| POST | `/api/v1/payments/checkout` | Usuario | Crear sesión de Stripe Checkout |
| POST | `/api/v1/payments/confirm` | Usuario | Confirmar compra y registrar orden |
| GET | `/api/v1/payments/session/:id` | — | Datos de sesión completada |
| POST | `/api/v1/payments/webhook` | Stripe | Webhook (firma verificada) |
| POST | `/api/v1/uploads` | Admin | Subir imagen a Supabase Storage |

**Autenticación:** `Authorization: Bearer <supabase-jwt>`

---

## SEO

- `generateMetadata` dinámico en todas las páginas de juego (título, descripción, OpenGraph, Twitter Card con imagen de portada).
- Metadata estática en todas las rutas estáticas (catálogo, ofertas, novedades, auth, info).
- `title` template en el layout raíz: `%s | BosStore`.
- `sitemap.xml` dinámico generado en `/sitemap.xml` (rutas estáticas + todos los slugs de juegos).
- `robots.txt` en `/robots.txt` (bloquea `/admin`, `/account`, `/checkout`, `/api`).
- JSON-LD `VideoGame` schema en la página de detalle (precio, disponibilidad, desarrollador, plataforma).

---

## Seguridad

- `.env` y `.env.local` están en `.gitignore` — **nunca se suben al repositorio**.
- Solo los `.env.example` (sin claves) están versionados como plantilla.
- La `service_role` key de Supabase solo existe en el backend.
- El rol `admin` se almacena en `app_metadata` (no editable por el usuario).
- Helmet con CSP configurado; CORS restringido al dominio del frontend.

---

## Scripts

**`bozstore-api`**

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot-reload (`tsx watch`) |
| `npm run build` | Compila TypeScript → `dist/` |
| `npm run start` | Sirve la versión compilada |
| `npm run typecheck` | Verifica tipos sin compilar |
| `npx tsx scripts/create-admin.ts <email> <pass>` | Crea/promueve usuario admin |

**`bozstore-web`**

| Comando | Descripción |
|---|---|
| `npm run dev` | Sitio de desarrollo con Turbopack |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Verifica tipos sin compilar |
