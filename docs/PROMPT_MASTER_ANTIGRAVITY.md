Você é o Google Antigravity e vai construir o WebPanel v1 da LP Factory.

OBJETIVO:
Criar um painel Admin premium (Next.js + shadcn/ui) moderno, sutil, rápido, com modo escuro e sidebar recolhível (ícones apenas).
Estilo: clean SaaS, sem transparência, cards suaves, bordas leves, fundo sólido, com UX de produto profissional.

IDENTIDADE VISUAL (obrigatória):
- Primary / CTA: #0046CC (fixo, sem variações roxas)
- Background Light: #FBFEFF (branco suave)
- Cards: #FFFFFF
- Borders: #E9EEF5
- Dark Mode: fundo grafite (não preto puro), cards grafite e CTA azul coerente
- Nada de roxo
- Sidebar: recolhível (expanded e collapsed)
- Design sutil e “premium”, sem visual carregado

REGRAS DE ARQUITETURA (obrigatórias):
1) O WebPanel NÃO acessa Supabase diretamente.
2) O WebPanel fala SOMENTE com o Engine FastAPI via HTTP usando header X-API-KEY.
3) Logs em tempo real devem usar SSE: GET /jobs/{id}/stream
4) Tudo é isolado por project_id e cluster_id (nunca misturar contextos).
5) Não existe ação destrutiva global (tudo é pontual e isolado por cluster).
6) Qualquer ação admin (promote/rollback/purge/retire) exige "reason" obrigatório e gera Audit Log via Engine.
7) Se o Engine estiver offline, a UI deve mostrar aviso claro e permitir retry (não travar a UI).

ENDPOINTS MÍNIMOS DO ENGINE (não inventar endpoints fictícios):
- GET  /health
- GET  /whoami
- POST /jobs
- GET  /jobs/{id}
- POST /jobs/{id}/cancel
- GET  /jobs/{id}/stream      (SSE)
- GET  /jobs/{id}/download
- GET  /clusters
- GET  /clusters/{cluster_id}
- POST /clusters/create       (ou POST /jobs com type=create_cluster)
- GET  /templates
- GET  /audit

PÁGINAS OBRIGATÓRIAS (v1):
- Overview (KPIs + charts + tabelas rápidas)
- Jobs Queue (lista + detalhe com logs SSE + download)
- Clusters (lista + filtros + score)
- Cluster Detail (KPIs, ações seguras, versões, diff, guardrails checklist)
- Create Cluster (formulário + cria cluster via Engine)
- Templates Gallery (cards com preview)
- Page Cache (hit/miss, invalidate/purge)
- Providers Health (status models + fallback)
- Audit Logs (filtrado)
- Settings (Engine URL, API key, refresh)

PÁGINA CREATE CLUSTER (campos obrigatórios):
- Nome do Produto (obrigatório)
- Tipo do Produto: Físico | Digital | Serviço
- Nicho (dropdown por projeto/domínio; cada domínio é um nicho único)
- URL referência (produto/serviço) (obrigatório)
- Idioma (lista aceita: pt-br, en-us, en-gb, en-au, en-ca, es, de)
- Persona única (1 linha)
- GEO País (obrigatório) + Estado opcional

Links:
- Link afiliado 1 - CTA Global (obrigatório)
- Link afiliado 2 - CTA Checkout (recomendado)

Vídeos (opcionais):
- URL Vídeo 1 - Video Review
- URL Vídeo 2 - VSL

SEO inicial:
- Palavra-chave principal (default = Nome do Produto)
- Palavras-chave secundárias (1 por linha) apenas seed inicial; depois agentes refinam por GA4/GSC/Bing

ASSISTENTE IA (obrigatório):
- Botão flutuante canto inferior direito (FAB)
- Abre drawer chat “LP Factory Assistant”
- Botões: Attach Context (job/cluster/logs) e Send to Audit (cria ticket/job no Engine)
- Fora do escopo: responder sempre “Desculpe, eu só trabalho na LP FACTORY.”
- O Assistente NUNCA fala com Supabase direto, somente com o Engine.

ENTREGÁVEL (obrigatório):
- Projeto Next.js App Router + TypeScript + shadcn/ui
- Sidebar recolhível com tooltips quando recolhida
- Topbar com Search + botão Create + Status Engine + Dark/Light toggle + Avatar
- Componentes reutilizáveis: cards, badges, tables, drawers, dialogs
- Client HTTP com X-API-KEY, Engine URL configurável e tratamento de erro (offline/timeout)
- Sem hardcode de dados: tudo vem do Engine via API

ORDEM DE IMPLEMENTAÇÃO (obrigatória):
1) Layout base (Sidebar + Topbar + Theme + Tokens)
2) Página Overview
3) Página Jobs (com SSE + Drawer detalhado)
4) Página Clusters
5) Cluster Detail
6) Create Cluster
7) Templates Gallery
8) Providers + Audit + Cache + Settings

REGRAS DE UX (para ficar premium):
- Sem transparência/glass
- Espaçamento generoso e tipografia limpa
- Azul (#0046CC) apenas para CTA e destaques (evitar painel “colorido demais”)
- Tabelas com filtros, paginação e badges
- Drawer/Modal para detalhes (jobs/cluster/actions)
