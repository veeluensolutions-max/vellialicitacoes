-- ============================================================================
-- VELLIA LICITAÇÕES 2.0 — SCHEMA DO BANCO DE DADOS EM NUVEM (SUPABASE / POSTGRESQL)
-- Empresas: Veeluen Solutions & Excelência Ambiental
-- ============================================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela Central de Oportunidades (Oportunidades, Pregões e Contratos)
CREATE TABLE IF NOT EXISTS public.opportunities (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    portal TEXT NOT NULL DEFAULT 'Petronect',
    client TEXT NOT NULL,
    title TEXT NOT NULL,
    object TEXT NOT NULL,
    description TEXT,
    modality TEXT DEFAULT 'Pregão Eletrônico',
    contract_type TEXT DEFAULT 'Prestação de Serviços Especializados',
    situation TEXT DEFAULT 'Publicada / Recebendo Propostas',
    publish_date TEXT,
    end_date TEXT,
    days_left INTEGER,
    state VARCHAR(2) DEFAULT 'PE',
    city TEXT DEFAULT 'Recife',
    location TEXT DEFAULT 'Recife - PE',
    estimated_value TEXT,
    estimated_value_numeric NUMERIC(15, 2),
    currency VARCHAR(3) DEFAULT 'BRL',
    url TEXT,
    capture_date TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'Nova',
    canonical_status TEXT DEFAULT 'IDENTIFIED',
    decision TEXT,
    decision_reason TEXT,
    recommended_company TEXT NOT NULL DEFAULT 'Veeluen Solutions',
    company_scope TEXT NOT NULL DEFAULT 'ALL',
    primary_service TEXT,
    related_services JSONB DEFAULT '[]'::jsonb,
    score NUMERIC(5, 2) DEFAULT 0,
    score_tier TEXT DEFAULT 'LOW',
    priority TEXT DEFAULT 'Média',
    tags JSONB DEFAULT '[]'::jsonb,
    internal_notes TEXT,
    responsible_person TEXT,
    history JSONB DEFAULT '[]'::jsonb,
    why_matches JSONB DEFAULT '[]'::jsonb,
    risks JSONB DEFAULT '[]'::jsonb,
    score_breakdown JSONB DEFAULT '{}'::jsonb,
    explanation_summary TEXT,
    source_origin TEXT DEFAULT 'PNCP / Petronect',
    raw_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON public.opportunities (recommended_company);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities (status);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON public.opportunities (score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_last_updated ON public.opportunities (last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_number ON public.opportunities (number);

-- 3. Tabela do Cofre de Documentos (Atestados CAT, CNDs e Certidões)
CREATE TABLE IF NOT EXISTS public.document_vault (
    id TEXT PRIMARY KEY,
    document_number TEXT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'CAT', 'CND_FEDERAL', 'CND_ESTADUAL', 'CND_TRABALHISTA', 'BALANCO'
    company_name TEXT NOT NULL, -- 'Veeluen Solutions' ou 'Excelência Ambiental'
    issuer TEXT,
    issue_date DATE,
    expiry_date DATE,
    status TEXT DEFAULT 'VALIDO', -- 'VALIDO', 'A_VENCER', 'VENCIDO'
    file_url TEXT,
    file_hash TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_vault_company ON public.document_vault (company_name);
CREATE INDEX IF NOT EXISTS idx_doc_vault_expiry ON public.document_vault (expiry_date);

-- 4. Trilha Geral de Auditoria Imutável (LGPD & Compliance)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_name TEXT NOT NULL,
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    object TEXT,
    diff_before JSONB,
    diff_after JSONB,
    result TEXT DEFAULT 'SUCESSO',
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs (timestamp DESC);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas se existirem para permitir re-execução sem erro
DROP POLICY IF EXISTS "Permitir leitura pública com chave anônima para Veeluen e Excelência" ON public.opportunities;
DROP POLICY IF EXISTS "Permitir inserção e atualização autenticada ou anon" ON public.opportunities;
DROP POLICY IF EXISTS "Permitir gestão de documentos para toda a organização" ON public.document_vault;
DROP POLICY IF EXISTS "Auditoria imutável: apenas leitura e inserção, sem deleção" ON public.audit_logs;
DROP POLICY IF EXISTS "Auditoria: registrar eventos" ON public.audit_logs;

-- Políticas de Acesso Público Controlado para os Tenants
CREATE POLICY "Permitir leitura pública com chave anônima para Veeluen e Excelência"
ON public.opportunities FOR SELECT USING (true);

CREATE POLICY "Permitir inserção e atualização autenticada ou anon"
ON public.opportunities FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir gestão de documentos para toda a organização"
ON public.document_vault FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Auditoria imutável: apenas leitura e inserção, sem deleção"
ON public.audit_logs FOR SELECT USING (true);

CREATE POLICY "Auditoria: registrar eventos"
ON public.audit_logs FOR INSERT WITH CHECK (true);

-- 6. Habilitar Supabase Realtime para sincronização inter-máquinas instantânea
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.opportunities;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.document_vault;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
