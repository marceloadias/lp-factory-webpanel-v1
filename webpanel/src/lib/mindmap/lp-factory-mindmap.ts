export const SYSTEM_TREE = `LP FACTORY
├─ 0) Ideia do Projeto
│  ├─ Gerar e operar páginas (LP/ELP) em escala com controle humano
│  ├─ Publicar rápido (Portão de Lançamento ≥60) e evoluir para Ouro (≥90)
│  └─ Tudo versionado e isolado por Cluster (sem mudanças globais destrutivas)
│
├─ 1) Estrutura Principal
│  ├─ Projeto (id_projeto)
│  │  ├─ Nicho + idioma + tipo_produto
│  │  ├─ 2 domínios obrigatórios (HUB/ELP e LP)
│  │  └─ Integrações: GA4 / GSC / GTM (e opcional Bing/Clarity)
│  │
│  └─ Cluster (id_cluster)
│     ├─ Produto alvo (oferta) + comissão (opcional)
│     ├─ HUB (conteúdo/autoridade)
│     ├─ ELP (editorial, SEO/EEAT, palavras mínimas)
│     └─ LP (transacional, conversão)
│
├─ 2) Pipeline de Execução (Tarefas)
│  ├─ Fila de Tarefas (na fila → executando → sucesso|falhou|cancelado)
│  ├─ Registros (fluxo SSE) + progresso
│  ├─ Tentar novamente/Tempo limite/Cancelar
│  └─ 1 trabalhador (v1) + bloqueio/TTL (evitar concorrência)
│
├─ 3) Agentes (01–09)
│  ├─ 01 - Gerar Pacote SEO de LP (palavras-chave GSC, título/H1, metas, FAQ, schema)
│  ├─ 02 - Gerar Pacote de Conteúdo de LP (texto por seção, provas, CTAs, tabelas)
│  ├─ 03 - Gerar HTML de LP (template → HTML final, tokens, layout)
│  ├─ 04 - Validar Landing Page (proteções: links, tabelas, refs, mobile)
│  ├─ 05 - Gerar Pacote de Recursos de LP (imagens de bancos públicos, sem IA)
│  ├─ 06 - Executar Pipeline Completo (orquestra 01→05 + gera artefatos)
│  ├─ 07 - Ciclo de Atualização (gatilhos GA4/GSC + período de espera + agendador justo)
│  ├─ 08 - Gerenciador de Experimentos (A/B, implantação 10→25→50→100, promover/reverter)
│  └─ 09 - Otimizador (Recuperação <90, Extremo 90→95+, mudanças controladas)
│
├─ 4) Pontuação e Qualidade
│  ├─ Portão de Lançamento v1: publicação recomendada ≥60
│  ├─ Ouro: ≥90 (insights_ouro + relatórios "por que venceu")
│  ├─ Regras fixas: referências externas (mín 8), tabelas (1–3), densidade de mídia
│  └─ Verificações mobile (sem rolagem horizontal; tabelas responsivas)
│
├─ 5) Cache e Versões
│  ├─ Cache de Página v1: chave_cache = hash (projeto + conteúdo + template + refs)
│  ├─ Invalidar / Limpar (admin + motivo + auditoria)
│  ├─ Rascunho / Pré-visualização / Produção (promover/reverter)
│  └─ Diferenças e Proteções antes de promover
│
├─ 6) Observabilidade e Auditoria
│  ├─ Registros SSE por tarefa / endpoints de status
│  ├─ Registro de auditoria (toda ação admin com justificativa)
│  ├─ Métricas históricas (snapshots GA4/GSC)
│  └─ Alertas de regressão + saúde do provedor
│
└─ 7) Assistente do Painel (Assistente LP Factory)
   ├─ Ajuda humana: diagnosticar falhas, sugerir correções, explicar status
   ├─ Pode acionar ações seguras (onde permitido) com proteções
   └─ Recusa fora do escopo: "Desculpe, eu só trabalho na LP FACTORY"`;

export const LIBRARY_TREE = `📚 BIBLIOTECA LP FACTORY
├─ 0) Visão Geral
│  ├─ LP (Landing Page) → conversão rápida
│  ├─ ELP (Editorial LP/Hub) → SEO + autoridade
│  ├─ Meta: publicar (score ≥60) e evoluir para Gold (score ≥90)
│  ├─ Regra: versionamento isolado por Cluster (sem mudanças globais)
│  └─ Anti-alucinação: não inventar dados, promessas, reviews ou imagens
│
├─ 1) Contratos (Arquivos e Padrões)
│  ├─ domains.yaml (domínios HUB/ELP e LP)
│  ├─ project.yaml (contrato canônico do projeto)
│  ├─ overlays/patches (melhorias versionadas)
│  ├─ registries (catálogos e allowlists)
│  ├─ templates (Library versionada + screenshots)
│  └─ outputs (artefatos versionados, preferir ZIP/Storage)
│
├─ 2) Componentes do Sistema
│  ├─ Web Factory (painel web) + Engine FastAPI (cérebro)
│  ├─ Workers/Jobs/Queue (execução) + Redis (cache/locks)
│  ├─ Supabase (DB + Storage + observabilidade)
│  ├─ CDN/Nginx (entrega rápida)
│  └─ Cloudflare Access + Tunnel (segurança)
│
├─ 3) Pipeline de Agentes (01–09)
│  ├─ 01 SEO Pack (seo_pack.json)
│  ├─ 02 Content Pack (content.json)
│  ├─ 03 HTML Generator (HTML/CSS)
│  ├─ 04 Validator/Guardrails (relatórios + score)
│  ├─ 05 Assets Pack (imagens + dedup + otimização)
│  ├─ 06 Full Pipeline (orquestrador 01→05)
│  ├─ 07 Update Cycle (GA4/GSC/GTM/Bing/Clarity)
│  ├─ 08 Experiment Manager (A/B controlado + rollout)
│  └─ 09 Optimizer (Recovery/Extreme)
│
├─ 4) Publicação e Versionamento
│  ├─ Canais: Draft → Preview → Production
│  ├─ Page Cache (cache_key + TTL + invalidation)
│  ├─ Diff & Guardrails (anti-quebra)
│  ├─ Promote/Rollback por cluster
│  └─ Sitemaps (sitemap-index → HUB + LP)
│
├─ 5) Qualidade e Regras Ouro
│  ├─ Score Engine (0-100) + 8+ Referências Externas
│  ├─ 1–3 Tabelas Numéricas + Mídia (1/400 palavras)
│  ├─ Mobile sem rolagem horizontal (exceto tabelas)
│  └─ SEM imagens por IA e SEM logo/texto sobreposto
│
├─ 6) Segurança e Auditoria
│  ├─ Access Control (Cloudflare) + Emergency Access
│  ├─ Abuse Protection + Negative Cache (barato e forte)
│  ├─ Auditoria em toda ação administrativa
│  └─ Segregação por project_id (isolamento total)
│
├─ 7) Armazenamento e Memória
│  ├─ Hot/Warm/Gold (TTL + promoção score ≥90)
│  ├─ Supabase Storage (HTML/ZIP/assets/screenshots)
│  ├─ Media Registry (GC/RefCount)
│  └─ Retenção inteligente (limpar gold fraco/velho)
│
├─ 8) Analytics e Otimização
│  ├─ Conectores: GA4, GSC, GTM, Bing, Clarity
│  ├─ Métricas: Metrics History (Snapshots)
│  ├─ Triggers de melhoria (dados reais)
│  └─ Update Scheduler (justo + por projeto)
│
└─ 9) Escala e Operação
   ├─ Token Saving Strategy + 90 Score Strategy
   ├─ Capacity Planning (KVM2 → KVM8)
   ├─ Provider Health + Auto-Routing (fallback)
   ├─ Runbooks + Monitoramento CPU/RAM/Disk
   └─ Update Cycle Gate (warmup + fairness)`;

export const SYSTEM_SECTIONS = [
    { title: "Ideia do Projeto", description: "Operação em escala com controle humano e desempenho evolutivo.", icon: "Lightbulb" },
    { title: "Estrutura Principal", description: "Hierarquia: Projeto > Domínio > Cluster > HUB/ELP/LP.", icon: "Layers" },
    { title: "Pipeline (Tarefas)", description: "Fila assíncrona, monitoramento SSE e prevenção de concorrência.", icon: "Activity" },
    { title: "Agentes IA", description: "9 especialistas (SEO, Conteúdo, HTML, Validação, Recursos, etc).", icon: "Cpu" },
    { title: "Qualidade", description: "Launch Gate 60 e Gold 90+ com auditoria mobile e densidade.", icon: "Zap" },
    { title: "Cache e Versões", description: "Gestão de versões (Draft/Prod) com rollback imediato.", icon: "History" },
    { title: "Observabilidade", description: "Auditoria total e histórico de métricas GA4/GSC.", icon: "LineChart" },
    { title: "LP Factory Assistant", description: "Suporte especializado focado exclusivamente no ecossistema.", icon: "Sparkles" }
];

export const LIBRARY_SECTIONS = [
    { title: "Visão Geral", description: "Meta de publicação ≥60 e evolução para ≥90, com regras anti-alucinação.", icon: "Lightbulb" },
    { title: "Contratos e Padrões", description: "Definição de domains.yaml e project.yaml canônicos e versionados.", icon: "Layers" },
    { title: "Componentes", description: "Arquitetura técnica: FastAPI, Workers, Redis, Supabase e Cloudflare.", icon: "Database" },
    { title: "Pipeline de Agentes", description: "Fluxo sequencial 01-09 e orquestração de updates por agentes IA.", icon: "Cpu" },
    { title: "Publicação", description: "Draft/Preview/Production com Diff, Guardrails e Rollback por cluster.", icon: "History" },
    { title: "Regras de Ouro", description: "8+ links externos, tabelas obrigatórias e proibição de imagens IA.", icon: "Award" },
    { title: "Segurança total", description: "Cloudflare Access, Abuse Protection e segregação por project_id.", icon: "Shield" },
    { title: "Escala e Operação", description: "Update Gate, fairness, Provider Health e Capacity Planning.", icon: "LineChart" }
];
