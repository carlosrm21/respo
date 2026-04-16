-- RestoPOS - Supabase SQL Schema
-- Paste this in Supabase Dashboard > SQL Editor and click Run

-- 1. mesas
CREATE TABLE IF NOT EXISTS public.mesas (
  id              BIGSERIAL PRIMARY KEY,
  numero          INTEGER NOT NULL,
  capacidad       INTEGER NOT NULL DEFAULT 4,
  estado          TEXT NOT NULL DEFAULT 'disponible',
  fecha_ocupacion TIMESTAMPTZ NULL
);

-- 2. categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id     BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL
);

-- 3. productos
CREATE TABLE IF NOT EXISTS public.productos (
  id           BIGSERIAL PRIMARY KEY,
  categoria_id BIGINT NULL REFERENCES public.categorias(id) ON DELETE SET NULL,
  nombre       TEXT NOT NULL,
  descripcion  TEXT NULL,
  precio       NUMERIC(12,2) NOT NULL DEFAULT 0,
  costo        NUMERIC(12,2) NOT NULL DEFAULT 0,
  disponible   INTEGER NOT NULL DEFAULT 1,
  imagen_url   TEXT NULL
);

-- 4. combos
CREATE TABLE IF NOT EXISTS public.combos (
  id              BIGSERIAL PRIMARY KEY,
  nombre          TEXT NOT NULL,
  descripcion     TEXT NULL,
  precio_especial NUMERIC(12,2) NULL,
  activo          INTEGER NOT NULL DEFAULT 1
);

-- 5. combo_items
CREATE TABLE IF NOT EXISTS public.combo_items (
  id          BIGSERIAL PRIMARY KEY,
  combo_id    BIGINT NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  cantidad    INTEGER NOT NULL DEFAULT 1
);

-- 6. pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id               BIGSERIAL PRIMARY KEY,
  mesa_id          BIGINT NULL REFERENCES public.mesas(id) ON DELETE SET NULL,
  mesero_id        BIGINT NULL REFERENCES public.meseros(id) ON DELETE SET NULL,
  estado           TEXT NOT NULL DEFAULT 'abierto',
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_servido    TIMESTAMPTZ NULL,
  minutos_servicio INTEGER NULL
);

-- 7. detalles_pedido
CREATE TABLE IF NOT EXISTS public.detalles_pedido (
  id              BIGSERIAL PRIMARY KEY,
  pedido_id       BIGINT NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  producto_id     BIGINT NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
  cantidad        INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  notas           TEXT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente'
);

-- 8. facturas
CREATE TABLE IF NOT EXISTS public.facturas (
  id             BIGSERIAL PRIMARY KEY,
  pedido_id      BIGINT NOT NULL REFERENCES public.pedidos(id) ON DELETE RESTRICT,
  numero_dian    TEXT NULL,
  total          NUMERIC(12,2) NOT NULL DEFAULT 0,
  metodo_pago    TEXT NOT NULL DEFAULT 'Efectivo',
  xml_dian       TEXT NULL,
  estado_dian    TEXT NULL DEFAULT 'enviado',
  cufe           TEXT NULL,
  fecha_emision  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  descuento      NUMERIC(12,2) NOT NULL DEFAULT 0,
  descuento_tipo TEXT NULL DEFAULT 'porcentaje',
  nota_descuento TEXT NULL
);

-- 9. caja
CREATE TABLE IF NOT EXISTS public.caja (
  id                 BIGSERIAL PRIMARY KEY,
  fecha_apertura     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  monto_apertura     NUMERIC(12,2) NOT NULL DEFAULT 0,
  mesero_id_apertura BIGINT NULL REFERENCES public.meseros(id) ON DELETE SET NULL,
  fecha_cierre       TIMESTAMPTZ NULL,
  monto_cierre       NUMERIC(12,2) NULL,
  ventas_esperadas   NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado             TEXT NOT NULL DEFAULT 'abierta'
);

-- 10. reservas
CREATE TABLE IF NOT EXISTS public.reservas (
  id             BIGSERIAL PRIMARY KEY,
  nombre         TEXT NOT NULL,
  telefono       TEXT NULL,
  fecha          DATE NOT NULL,
  hora           TEXT NOT NULL,
  personas       INTEGER NOT NULL DEFAULT 1,
  mesa_id        BIGINT NULL REFERENCES public.mesas(id) ON DELETE SET NULL,
  estado         TEXT NOT NULL DEFAULT 'pendiente',
  notas          TEXT NULL,
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. inventario
CREATE TABLE IF NOT EXISTS public.inventario (
  id                  BIGSERIAL PRIMARY KEY,
  nombre              TEXT NOT NULL,
  categoria           TEXT NULL,
  unidad              TEXT NULL,
  cantidad            NUMERIC(12,3) NOT NULL DEFAULT 0,
  cantidad_minima     NUMERIC(12,3) NOT NULL DEFAULT 0,
  costo_unitario      NUMERIC(12,2) NOT NULL DEFAULT 0,
  proveedor           TEXT NULL,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. pedidos_delivery
CREATE TABLE IF NOT EXISTS public.pedidos_delivery (
  id               BIGSERIAL PRIMARY KEY,
  plataforma       TEXT NOT NULL,
  external_id      TEXT NULL,
  cliente_nombre   TEXT NULL,
  cliente_direccion TEXT NULL,
  items_json       TEXT NULL,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado           TEXT NOT NULL DEFAULT 'nuevo',
  notas            TEXT NULL,
  fecha_creacion   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id      BIGSERIAL PRIMARY KEY,
  usuario TEXT NULL,
  accion  TEXT NOT NULL,
  entidad TEXT NULL,
  detalle TEXT NULL,
  fecha   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. turnos
CREATE TABLE IF NOT EXISTS public.turnos (
  id           BIGSERIAL PRIMARY KEY,
  mesero_id    BIGINT NULL REFERENCES public.meseros(id) ON DELETE SET NULL,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TEXT NULL,
  hora_salida  TEXT NULL,
  notas        TEXT NULL,
  estado       TEXT NOT NULL DEFAULT 'activo'
);

-- 15. configuracion_restaurante
CREATE TABLE IF NOT EXISTS public.configuracion_restaurante (
  id    BIGSERIAL PRIMARY KEY,
  clave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL
);

-- 16. licencia_estado
CREATE TABLE IF NOT EXISTS public.licencia_estado (
  id         BIGSERIAL PRIMARY KEY,
  estado     TEXT NOT NULL DEFAULT 'trial',
  plan       TEXT NOT NULL DEFAULT 'trial-7-days',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  trial_days INTEGER NOT NULL DEFAULT 7,
  payment_id TEXT NULL
);

-- Expose all tables to PostgREST (in case RLS is not needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
