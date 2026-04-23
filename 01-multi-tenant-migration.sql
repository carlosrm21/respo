-- 01-multi-tenant-migration.sql
-- Este script expande la BD existente para soportar múltiples restaurantes simultáneamente.

-- 1. Crear tabla de restaurantes (tenants)
CREATE TABLE IF NOT EXISTS public.restaurantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  nit text UNIQUE NOT NULL,
  email text,
  telefono text,
  fecha_registro timestamptz NOT NULL DEFAULT now(),
  activo integer NOT NULL DEFAULT 1
);

-- 2. Insertar un Restaurante Default para no romper los datos existentes
DO $$
DECLARE
  default_restaurante_id uuid;
BEGIN
  -- Insertamos un restaurante por defecto
  INSERT INTO public.restaurantes (nombre, nit, email, telefono)
  VALUES ('Restaurante Original (Migrado)', '000000', 'admin@restaurante.localhost', '0000')
  RETURNING id INTO default_restaurante_id;

  -- 3. Añadir la columna restaurante_id a todas las tablas y asignarle el valor por defecto
  
  -- Mesas
  ALTER TABLE public.mesas ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.mesas SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.mesas ALTER COLUMN restaurante_id SET NOT NULL;

  -- Categorias
  ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.categorias SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.categorias ALTER COLUMN restaurante_id SET NOT NULL;

  -- Productos
  ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.productos SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.productos ALTER COLUMN restaurante_id SET NOT NULL;

  -- Combos
  ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.combos SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.combos ALTER COLUMN restaurante_id SET NOT NULL;

  -- Combo Items
  ALTER TABLE public.combo_items ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.combo_items SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.combo_items ALTER COLUMN restaurante_id SET NOT NULL;

  -- Pedidos
  ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.pedidos SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.pedidos ALTER COLUMN restaurante_id SET NOT NULL;

  -- Detalles Pedido
  ALTER TABLE public.detalles_pedido ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.detalles_pedido SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.detalles_pedido ALTER COLUMN restaurante_id SET NOT NULL;

  -- Facturas
  ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.facturas SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.facturas ALTER COLUMN restaurante_id SET NOT NULL;

  -- Caja
  ALTER TABLE public.caja ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.caja SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.caja ALTER COLUMN restaurante_id SET NOT NULL;

  -- Reservas
  ALTER TABLE public.reservas ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.reservas SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.reservas ALTER COLUMN restaurante_id SET NOT NULL;

  -- Inventario
  ALTER TABLE public.inventario ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.inventario SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.inventario ALTER COLUMN restaurante_id SET NOT NULL;

  -- Pedidos Delivery
  ALTER TABLE public.pedidos_delivery ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.pedidos_delivery SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.pedidos_delivery ALTER COLUMN restaurante_id SET NOT NULL;

  -- Turnos
  ALTER TABLE public.turnos ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.turnos SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.turnos ALTER COLUMN restaurante_id SET NOT NULL;

  -- Configuracion Restaurante
  ALTER TABLE public.configuracion_restaurante ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.configuracion_restaurante SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.configuracion_restaurante ALTER COLUMN restaurante_id SET NOT NULL;
  
  -- Quitar el Constraint UNIQUE aislado que causaría conflicto si hay 2 restaurantes con la misma clave
  ALTER TABLE public.configuracion_restaurante DROP CONSTRAINT IF EXISTS configuracion_restaurante_clave_key;
  ALTER TABLE public.configuracion_restaurante ADD CONSTRAINT config_rest_clave_unique UNIQUE (restaurante_id, clave);

  -- Licencia Estado
  ALTER TABLE public.licencia_estado ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.licencia_estado SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.licencia_estado ALTER COLUMN restaurante_id SET NOT NULL;
  
  -- Meseros (Usuarios / Operadores)
  ALTER TABLE public.meseros ADD COLUMN IF NOT EXISTS restaurante_id uuid REFERENCES public.restaurantes(id) ON DELETE CASCADE;
  UPDATE public.meseros SET restaurante_id = default_restaurante_id WHERE restaurante_id IS NULL;
  ALTER TABLE public.meseros ALTER COLUMN restaurante_id SET NOT NULL;

END $$;

-- 4. Habilitar RLS (Opcional si se usa Server Roles, pero recomendado para futuro)
-- ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
-- etc.

-- Actualizar cache de PostgREST
NOTIFY pgrst, 'reload schema';
