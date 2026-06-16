-- ============================================================
--  BosStore — Esquema completo de la base de datos (Supabase)
--
--  Pega TODO este archivo en:  Supabase → SQL Editor → Run
--  Es idempotente: puedes ejecutarlo varias veces sin romper nada.
--
--  Crea: games, orders, order_items, wishlists, reviews
--  + las políticas de seguridad (RLS) de cada tabla.
-- ============================================================


-- ── 1) CATÁLOGO DE JUEGOS ───────────────────────────────────
create table if not exists public.games (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10,2) not null default 0,
  cover_url        text,
  banner_url       text,
  genre            text,
  platform         text,
  stock            integer not null default 0,
  discount_percent integer not null default 0
                     check (discount_percent >= 0 and discount_percent <= 95),
  trailer_url      text,
  screenshots      text[] not null default '{}',
  release_date     date,
  developer        text,
  created_at       timestamptz not null default now()
);

-- Por si la tabla ya existía de una versión anterior sin estas columnas:
alter table public.games
  add column if not exists banner_url       text,
  add column if not exists discount_percent integer not null default 0,
  add column if not exists trailer_url      text,
  add column if not exists screenshots      text[] not null default '{}',
  add column if not exists release_date     date,
  add column if not exists developer        text;

alter table public.games enable row level security;

-- El catálogo es público: cualquiera puede ver los juegos.
drop policy if exists "Games are public" on public.games;
create policy "Games are public" on public.games
  for select using (true);
-- Las escrituras (crear/editar/borrar juegos) las hace el backend con el
-- SERVICE ROLE, que ignora RLS. Por eso NO hay políticas de insert/update/delete:
-- nadie puede modificar el catálogo desde el navegador.


-- ── 2) ÓRDENES (historial de compras) ──────────────────────
create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  user_email        text,
  stripe_session_id text unique,
  total             numeric(10,2) not null,
  currency          text not null default 'usd',
  status            text not null default 'paid',
  created_at        timestamptz not null default now()
);

create table if not exists public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders(id) on delete cascade,
  game_slug text not null,
  title     text not null,
  price     numeric(10,2) not null,
  quantity  integer not null default 1,
  cover_url text
);

create index if not exists orders_user_id_idx       on public.orders(user_id);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Cada usuario solo puede leer SUS propias órdenes...
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select using (auth.uid() = user_id);

-- ...y los ítems de sus propias órdenes.
drop policy if exists "Users read own order items" on public.order_items;
create policy "Users read own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid())
  );
-- Las compras las inserta el backend con el SERVICE ROLE (ignora RLS),
-- así nadie puede falsificar una compra desde el navegador.


-- ── 3) LISTA DE DESEOS (wishlist) ───────────────────────────
create table if not exists public.wishlists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  game_slug  text not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_slug)
);

create index if not exists wishlists_user_id_idx on public.wishlists(user_id);

alter table public.wishlists enable row level security;

drop policy if exists "Users select own wishlist" on public.wishlists;
create policy "Users select own wishlist" on public.wishlists
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own wishlist" on public.wishlists;
create policy "Users insert own wishlist" on public.wishlists
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own wishlist" on public.wishlists;
create policy "Users delete own wishlist" on public.wishlists
  for delete using (auth.uid() = user_id);


-- ── 4) RESEÑAS Y VALORACIONES ───────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  game_slug   text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  user_name   text,
  user_avatar text,
  rating      integer not null check (rating >= 1 and rating <= 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (game_slug, user_id)   -- una reseña por usuario y juego
);

create index if not exists reviews_game_slug_idx on public.reviews(game_slug);

alter table public.reviews enable row level security;

-- Las reseñas son públicas (todos pueden leerlas)...
drop policy if exists "Reviews are public" on public.reviews;
create policy "Reviews are public" on public.reviews
  for select using (true);

-- ...pero solo el autor crea / edita / borra la suya.
drop policy if exists "Users insert own review" on public.reviews;
create policy "Users insert own review" on public.reviews
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own review" on public.reviews;
create policy "Users update own review" on public.reviews
  for update using (auth.uid() = user_id);

drop policy if exists "Users delete own review" on public.reviews;
create policy "Users delete own review" on public.reviews
  for delete using (auth.uid() = user_id);


-- ============================================================
--  LISTO. Después de correr esto:
--   1. Crea un bucket de Storage llamado "game-images" (público).
--   2. Crea tu usuario admin con el script:
--        cd bozstore-api
--        npx tsx scripts/create-admin.ts tucorreo@ejemplo.com TuClave123
--  (Ver el README para los detalles.)
-- ============================================================
