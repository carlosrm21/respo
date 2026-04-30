-- Tabla para registrar NITs que ya usaron el trial gratuito
-- Se mantiene aunque el tenant sea eliminado (para evitar abusos)
CREATE TABLE IF NOT EXISTS public.trial_nits_usados (
  nit TEXT PRIMARY KEY,
  nombre_original TEXT,
  email_original TEXT,
  trial_expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Política RLS: solo el service role puede leer/escribir
ALTER TABLE public.trial_nits_usados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.trial_nits_usados
  FOR ALL
  USING (false)
  WITH CHECK (false);
