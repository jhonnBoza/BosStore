# 🎮 BosStore

**Tienda de videojuegos digitales** con tema oscuro, panel de administración completo,
carrito, lista de deseos, reseñas, pagos con Stripe y autenticación con Google, Discord
y correo (código de verificación).

Proyecto **full-stack** dividido en dos partes:

| Carpeta | Qué es | Tecnología |
|---|---|---|
| [`bozstore-web`](./bozstore-web) | El sitio web (lo que ve el usuario) | **Next.js 15** (App Router) + Tailwind CSS |
| [`bozstore-api`](./bozstore-api) | El servidor / API (la lógica y la base de datos) | **Express** + TypeScript |

La base de datos, los usuarios y el almacenamiento de imágenes están en **Supabase**.

---

## ✨ Características

- 🛒 **Tienda completa**: catálogo, búsqueda, ofertas, novedades, ficha de cada juego (con galería y tráiler de YouTube).
- 🛍️ **Carrito** persistente (se guarda en el navegador) y **checkout** con Stripe.
- ❤️ **Lista de deseos** y ⭐ **reseñas** por usuario.
- 🔐 **Autenticación**: Google, Discord y registro por **correo con código de verificación (OTP)**.
- 🛠️ **Panel de administración**: dashboard con estadísticas, gestión de juegos (crear/editar/borrar), subida de imágenes desde el ordenador o por URL, y vista de pedidos.
- 🌑 **Tema oscuro** en todo el sitio.

---

## 🧠 ¿Cómo funciona? (arquitectura)

```
   Navegador
      │
      ▼
  bozstore-web  (Next.js)  ──── pide datos ────►  bozstore-api  (Express)
      │                                                   │
      │  guarda la sesión (JWT)                           │  usa la SERVICE ROLE KEY
      │                                                   ▼
      └──────────────  Supabase  ◄──────────────────────┘
                 (Postgres · Auth · Storage)
                          │
                          ▼
                       Stripe   (pagos)
```

- El **web** nunca toca la base de datos directamente para cosas sensibles: le pide todo a la **API**.
- La **API** habla con Supabase usando la *Service Role Key* (clave secreta de administrador), que solo vive en el servidor.
- Cuando un usuario inicia sesión, el web recibe un **token (JWT)** de Supabase y se lo manda a la API en cada petición. La API **verifica** el token y el **rol** (`admin` o `cliente`) antes de dejar hacer cosas.
- Las **imágenes** de los juegos se suben a través de la API al *Storage* de Supabase.
- Los **pagos** los crea la API en Stripe y el web redirige a la pasarela segura de Stripe.

---

## 📁 Estructura del proyecto

```
BosStore/
├── bozstore-web/                  # FRONTEND (Next.js)
│   ├── src/
│   │   ├── app/                   # Páginas (App Router) agrupadas por sección:
│   │   │   ├── (marketing)/       #   landing / inicio
│   │   │   ├── (shop)/            #   catálogo, juego, carrito, checkout, ofertas...
│   │   │   ├── (auth)/            #   login, registro, recuperar contraseña
│   │   │   ├── (info)/            #   términos, privacidad, soporte
│   │   │   ├── admin/             #   panel de administración
│   │   │   └── account/           #   cuenta del usuario
│   │   ├── components/            # Componentes React (auth, cart, shop, admin, layout...)
│   │   ├── lib/                   # Utilidades (cliente de Supabase, precios...)
│   │   ├── store/                 # Estado global con Zustand (carrito, wishlist)
│   │   └── types/                 # Tipos de TypeScript
│   ├── .env.example              # Plantilla de variables de entorno
│   └── package.json
│
├── bozstore-api/                  # BACKEND (Express)
│   ├── src/
│   │   ├── config/               # Configuración (variables, Supabase, Stripe)
│   │   ├── middlewares/          # auth (verifica JWT), requireRole, validate, errores
│   │   ├── modules/              # Un módulo por recurso:
│   │   │   ├── auth/             #   registro con código OTP por correo
│   │   │   ├── games/            #   catálogo (CRUD)
│   │   │   ├── orders/           #   pedidos
│   │   │   ├── payments/         #   Stripe Checkout
│   │   │   └── uploads/          #   subida de imágenes al Storage
│   │   ├── lib/                  # errores y envío de correos (mailer)
│   │   └── routes/               # Router principal (/api/v1/...)
│   ├── db/
│   │   └── schema.sql            # ⭐ Esquema completo de la base de datos
│   ├── scripts/
│   │   └── create-admin.ts       # Script para crear un usuario administrador
│   ├── .env.example              # Plantilla de variables de entorno
│   └── package.json
│
└── README.md                      # (este archivo)
```

---

## 🚀 Instalación paso a paso

### Requisitos previos
- [Node.js](https://nodejs.org) 18 o superior
- Una cuenta gratis de [Supabase](https://supabase.com)
- *(Opcional)* Una cuenta de [Stripe](https://stripe.com) para pagos
- *(Opcional)* Una cuenta de Gmail para enviar los correos de verificación

---

### 1) Clonar el repositorio

```bash
git clone https://github.com/jhonnBoza/BosStore.git
cd BosStore
```

---

### 2) Configurar Supabase (la base de datos)

1. Entra a [supabase.com](https://supabase.com) y crea un **nuevo proyecto** (es gratis).
2. Ve a **SQL Editor** → pega TODO el contenido de
   [`bozstore-api/db/schema.sql`](./bozstore-api/db/schema.sql) → **Run**.
   (Esto crea todas las tablas y reglas de seguridad.)
3. Ve a **Storage** → **New bucket** → nombre: **`game-images`**, marca **Public** → crear.
   (Aquí se guardan las portadas y banners que subas desde el ordenador.)
4. Apunta tus claves desde **Project Settings → API**:
   - `Project URL`
   - `anon public` key (pública)
   - `service_role` key (**SECRETA**, solo para el backend)

---

### 3) Levantar el backend (API)

```bash
cd bozstore-api
npm install
cp .env.example .env        # En Windows (PowerShell): copy .env.example .env
```

Abre el archivo `.env` y rellena tus claves de Supabase:

```env
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_JWKS_URL=https://TU-PROYECTO.supabase.co/auth/v1/.well-known/jwks.json
```

> Stripe y SMTP (correos) son **opcionales**: el servidor arranca sin ellos.
> Si quieres pagos o correos de verificación, rellena también esas variables.

Arranca el servidor:

```bash
npm run dev          # queda escuchando en http://localhost:4000
```

---

### 4) Levantar el frontend (Web)

En **otra terminal**:

```bash
cd bozstore-web
npm install
cp .env.example .env.local   # En Windows (PowerShell): copy .env.example .env.local
```

Rellena `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Arranca el sitio:

```bash
npm run dev          # abre http://localhost:3000
```

---

### 5) Crear tu usuario administrador

Para entrar al panel de administración necesitas un usuario con rol `admin`.
Con la API ya configurada, ejecuta:

```bash
cd bozstore-api
npx tsx scripts/create-admin.ts tucorreo@ejemplo.com TuClave123
```

Luego inicia sesión en `http://localhost:3000/login` con ese correo y contraseña,
y entra a `http://localhost:3000/admin`. ✅

---

## 📜 Scripts disponibles

**En `bozstore-web`:**
| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca el sitio en modo desarrollo |
| `npm run build` | Compila para producción |
| `npm run start` | Sirve la versión compilada |

**En `bozstore-api`:**
| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la API (se recarga sola al guardar) |
| `npm run build` | Compila TypeScript a JavaScript (carpeta `dist`) |
| `npm run start` | Ejecuta la versión compilada |
| `npx tsx scripts/create-admin.ts <correo> <clave>` | Crea/promueve un usuario admin |

---

## 🔒 Seguridad — importante

- Los archivos **`.env` y `.env.local` NUNCA se suben** a GitHub (están en `.gitignore`).
  Solo se comparten los `.env.example`, que son plantillas **sin** claves.
- La `service_role` key de Supabase es **secreta** y solo vive en el backend.
- Las escrituras importantes (crear juegos, registrar compras) las hace el backend
  con esa clave, así nadie puede falsificarlas desde el navegador.

---

Hecho con 🎮 por **jhonnBoza**.
