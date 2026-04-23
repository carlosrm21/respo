-- Tablas faltantes: inventario, reservas, turnos, audit_log, pedidos_delivery

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

CREATE TABLE IF NOT EXISTS public.audit_log (
  id      BIGSERIAL PRIMARY KEY,
  usuario TEXT NULL,
  accion  TEXT NOT NULL,
  entidad TEXT NULL,
  detalle TEXT NULL,
  fecha   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.turnos (
  id           BIGSERIAL PRIMARY KEY,
  mesero_id    BIGINT NULL REFERENCES public.meseros(id) ON DELETE SET NULL,
  fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TEXT NULL,
  hora_salida  TEXT NULL,
  notas        TEXT NULL,
  estado       TEXT NOT NULL DEFAULT 'activo'
);

CREATE TABLE IF NOT EXISTS public.pedidos_delivery (
  id                BIGSERIAL PRIMARY KEY,
  plataforma        TEXT NOT NULL,
  external_id       TEXT NULL,
  cliente_nombre    TEXT NULL,
  cliente_direccion TEXT NULL,
  items_json        TEXT NULL,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado            TEXT NOT NULL DEFAULT 'nuevo',
  notas             TEXT NULL,
  fecha_creacion    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deshabilitar RLS (Row Level Security) para todas
ALTER TABLE public.inventario       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log        DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_delivery DISABLE ROW LEVEL SECURITY;

-- Permisos de acceso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inventario       TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservas         TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_log        TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.turnos           TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_delivery TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE inventario_id_seq               TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE reservas_id_seq                 TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE audit_log_id_seq                TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE turnos_id_seq                   TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE pedidos_delivery_id_seq         TO anon, authenticated, service_role;

-- Recargar schema de PostgREST
NOTIFY pgrst, 'reload schema';
