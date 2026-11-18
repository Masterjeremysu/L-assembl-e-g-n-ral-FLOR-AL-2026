/* ETAPE 1 : CREATION DES TABLES & SECURITE REALTIME */

DROP TABLE IF EXISTS public.ag_audit_logs CASCADE;
DROP TABLE IF EXISTS public.ag_resolutions CASCADE;
DROP TABLE IF EXISTS public.ag_coproprietaires CASCADE;
DROP TABLE IF EXISTS public.ag_state CASCADE;

-- 1. Table ag_state
CREATE TABLE public.ag_state (
  id TEXT PRIMARY KEY DEFAULT 'floreal_2026',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  seance JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT DEFAULT 'CS'
);

-- 2. Table ag_coproprietaires
CREATE TABLE public.ag_coproprietaires (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  lots TEXT DEFAULT '',
  tantiemes INT NOT NULL DEFAULT 0,
  batiment TEXT DEFAULT '',
  escalier TEXT DEFAULT '',
  etage TEXT DEFAULT '',
  presence TEXT NOT NULL DEFAULT 'absent',
  mandataire_id TEXT DEFAULT NULL,
  heure_emargement TIMESTAMPTZ DEFAULT NULL,
  signature TEXT DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table ag_resolutions
CREATE TABLE public.ag_resolutions (
  id TEXT PRIMARY KEY,
  numero INT NOT NULL,
  titre TEXT NOT NULL,
  description TEXT DEFAULT '',
  majorite TEXT NOT NULL DEFAULT 'Article 24',
  budget NUMERIC DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'en_attente',
  votes_pour INT NOT NULL DEFAULT 0,
  votes_contre INT NOT NULL DEFAULT 0,
  votes_abstention INT NOT NULL DEFAULT 0,
  votes_details JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Table ag_audit_logs
CREATE TABLE public.ag_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  auteur TEXT DEFAULT 'CS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RLS & Droits
ALTER TABLE public.ag_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ag_coproprietaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ag_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ag_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY ag_state_all ON public.ag_state FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ag_copros_all ON public.ag_coproprietaires FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ag_resolutions_all ON public.ag_resolutions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY ag_audit_all ON public.ag_audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. Activation Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ag_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ag_coproprietaires;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ag_resolutions;
