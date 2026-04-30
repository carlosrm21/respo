-- SECURE SUPABASE: Enable RLS and Revoke Public Access
-- This script resolves the "Critical" warning by securing all public tables.

-- 1. Enable Row Level Security on ALL tables
ALTER TABLE IF EXISTS public.restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pedidos_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.configuracion_restaurante ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.licencia_estado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meseros ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.maintenance_audit ENABLE ROW LEVEL SECURITY;

-- 2. Revoke broad public permissions
-- This ensures that nobody can access the data using the ANON_KEY (public key)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;

-- 3. Grant proper permissions to service_role (Admin bypass)
-- This ensures that your Next.js server actions (using SERVICE_ROLE_KEY) continue to work.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 4. (Optional) Basic Policies
-- By enabling RLS and NOT adding policies for 'anon', all public access is blocked.
-- If you ever need to allow public read-only access to products (e.g., for a menu),
-- you can run: 
-- CREATE POLICY "Public read products" ON public.productos FOR SELECT USING (true);

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload schema';

DO $$ 
BEGIN 
    RAISE NOTICE 'Security script executed successfully. RLS is now enabled on all tables.';
END $$;
