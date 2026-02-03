-- migration: create_agent_suggestions_table
-- Descrição: Cria a estrutura de sugestões de agentes com auditoria e índices.

-- 1. Função de trigger para atualizar o timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Criação da tabela agent_suggestions
-- Nota: gen_random_uuid() é nativo do Postgres 13+ (Supabase padrão)
CREATE TABLE IF NOT EXISTS public.agent_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id TEXT NOT NULL,
    scope TEXT NOT NULL CHECK (scope IN ('user', 'system')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    last_editor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Adiciona o trigger na tabela
DROP TRIGGER IF EXISTS tr_agent_suggestions_updated_at ON public.agent_suggestions;
CREATE TRIGGER tr_agent_suggestions_updated_at
    BEFORE UPDATE ON public.agent_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Índices para performance (Leitura e Filtros)
-- Busca rápida por agente
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_agent_id ON public.agent_suggestions(agent_id);

-- Busca otimizada por abas (User vs System) e ativos
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_lookup ON public.agent_suggestions(agent_id, scope, status);

-- Ordenação cronológica (Timeline)
CREATE INDEX IF NOT EXISTS idx_agent_suggestions_created_at ON public.agent_suggestions(created_at);

-- 5. Comentários para Auditoria e Documentação
COMMENT ON TABLE public.agent_suggestions IS 'Tabela de sugestões auditáveis para agentes de IA.';
COMMENT ON COLUMN public.agent_suggestions.scope IS 'Origem da sugestão: user ou system.';
COMMENT ON COLUMN public.agent_suggestions.status IS 'Status de visibilidade: active ou archived (não deletar).';
