# 📚 BIBLIOTECA LP FACTORY (Mapa Mental Global + Etapas + Regras)
> **Arquivo oficial:** `biblioteca-lp-factory.md`  
> **Objetivo:** ser a biblioteca completa do LP FACTORY, com **tudo** que já foi decidido nos chats (Blueprint + etapas fechadas + regras).  
> **Leitura:** simples e direta (como para uma criança de 12 anos).  
> **Regra do projeto:** **NUNCA** “comer metade” — este documento deve conter **todas** as etapas e sugestões.

---

# ✅ 0) DIAGRAMA VISUAL EM ÁRVORE (MAPA MENTAL GLOBAL)
> **Esse é o mapa completo que você pediu.**  
> Ele é o “menu” do LP FACTORY: tudo está aqui.

```
LP FACTORY
├─ 0) Visão Geral
│  ├─ LP (Landing Page) → conversão rápida
│  ├─ ELP (Editorial LP/Hub) → SEO + autoridade
│  ├─ Meta: publicar (score ≥60) e evoluir para Gold (score ≥90)
│  ├─ Regra: tudo é versionado por Cluster (sem mudanças globais destrutivas)
│  └─ Anti-alucinação: não inventar dados, promessas, reviews ou imagens
│
├─ 1) Contratos (Arquivos e Padrões)
│  ├─ domains.yaml (domínios HUB/ELP e LP)
│  ├─ project.yaml (contrato canônico do projeto)
│  ├─ overlays/patches (melhorias versionadas sem mudar o baseline)
│  ├─ registries (catálogos e allowlists)
│  ├─ templates (Template Library versionada + screenshots)
│  └─ outputs (artefatos versionados, preferir ZIP/Storage)
│
├─ 2) Componentes do Sistema
│  ├─ Web Factory (painel web no navegador)
│  ├─ Engine FastAPI (cérebro)
│  ├─ Workers/Jobs/Queue (mãos que executam)
│  ├─ Redis (hot cache, locks, rate limit, negative cache)
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
├─ 5) Qualidade e Regras Ouro (obrigatórias)
│  ├─ Score Engine (regras + métricas + explicação)
│  ├─ External References Block (8+ links externos confiáveis)
│  ├─ Data Tables (1–3 tabelas numéricas por página)
│  ├─ Media Density (≈1 imagem / 400 palavras)
│  ├─ Mobile sem rolagem horizontal (exceto wrapper de tabelas)
│  └─ SEM imagens por IA (agentes) e SEM logo/texto sobreposto
│
├─ 6) Segurança e Auditoria
│  ├─ Access Control (Cloudflare Access + API Keys)
│  ├─ Emergency Access (Break-glass)
│  ├─ Abuse Protection + Negative Cache (barato e forte)
│  ├─ Auditoria em toda ação administrativa
│  └─ Segregação por project_id (isolamento total)
│
├─ 7) Armazenamento e Memória (Insights)
│  ├─ Hot/Warm/Gold (TTL + promoção score ≥90)
│  ├─ Supabase Storage (HTML/ZIP/assets/screenshots)
│  ├─ Media Registry + Garbage Collection (ref_count)
│  └─ Retenção inteligente (opcional: limpar gold fraco e velho)
│
├─ 8) Analytics e Otimização Contínua
│  ├─ Conectores: GA4, GSC, GTM
│  ├─ Complementos: Bing, Microsoft Clarity
│  ├─ Metrics History (snapshots por cluster)
│  ├─ Triggers de melhoria (dados reais)
│  └─ Update Scheduler (justo + por projeto)
│
└─ 9) Escala e Operação
   ├─ Token Saving Strategy + 90 Score Strategy
   ├─ Capacity Planning (KVM2 → KVM8)
   ├─ Provider Health + Auto-Routing (fallback)
   ├─ Runbooks + monitoramento CPU/RAM/Disk
   ├─ Update Cycle Gate (warmup + fairness)
   └─ Regra: 1 projeto em update por vez (janela por projeto)
```

---

# ✅ 1) O que é a LP FACTORY (explicação simples)
A **LP FACTORY** é uma fábrica que cria e mantém páginas na internet:

- **LP (Landing Page)**: página rápida para conversão (clique no CTA).
- **ELP (Editorial Landing Page / Hub)**: página maior para SEO e autoridade.

🎯 Meta do sistema:
- Publicar rápido com **score ≥ 60** (Launch Gate).
- Melhorar com dados reais até **score ≥ 90** (Gold).

---

# ✅ 2) Regras de Ouro (NUNCA quebrar)
Estas regras são como leis.

## 2.1 Sem ações globais destrutivas
❌ Não existe rollback global  
❌ Não existe delete global  
✅ Tudo é isolado por cluster  
✅ Tudo é auditado

## 2.2 Obrigatório em toda LP/ELP
✅ **8+ links externos confiáveis** (External References Block)  
✅ **1–3 tabelas numéricas** por página (Data Tables)  
✅ **≈1 imagem a cada 400 palavras** (Media Density)

## 2.3 Produto removido (não vender 404)
Se o produto sumir ou URL mudar:
- tirar do sitemap
- purgar cache
- servir **410** ou **301** seguro
- preservar aprendizado **Gold**
- registrar justificativa + auditoria

## 2.4 Regra de imagens (importantíssima)
- Agentes **não podem** criar imagens por IA.
- Agentes devem baixar imagens de bancos públicos e referências.
- Proibido imagens com **logos** ou **texto sobreposto**.

## 2.5 Template Freeze + Auditor (regra do seu chat)
- Templates novos só entram em novos projetos após revisão.
- Ajustes em templates existentes são **pontuais** e **auditados**.
- Se um template quebrar layout, cria-se um “template de correção” isolado.

---

# ✅ 3) Glossário (palavras importantes)
- **Projeto**: 1 nicho + 2 domínios (HUB/ELP e LP).
- **Cluster**: 1 produto/tema (LP + ELP).
- **Engine**: FastAPI que executa jobs e controla tudo.
- **Web Factory**: painel web para administrar.
- **Job**: uma tarefa do sistema (gerar, validar, publicar, otimizar).
- **Cache Key**: “impressão digital” da versão da página.
- **Gold**: score ≥ 90 (qualidade alta).
- **Warmup**: esperar dados reais antes de otimizar.

---

# ✅ 4) Etapa fechada: domains.yaml + project.yaml (contratos canônicos)
> “Continuar LP Factory Blueprint… montar domains.yaml e project.yaml canônico.”

## 4.1 domains.yaml (o mapa de domínios)
- HUB/ELP domain
- LP domain  
✅ Regra: **sempre 2 domínios por projeto**.

## 4.2 project.yaml (o contrato do projeto)
Campos obrigatórios (Project YAML Contract v1):
- contract_version
- project_id
- niche
- language
- domains.hub_elp
- domains.lp
- product_type
- clusters[]

Regra: baseline imutável + overlays versionados.

---

# ✅ 5) Endpoints mínimos do Engine (v1)
- GET /health
- GET /whoami
- POST /jobs
- GET /jobs/{id}
- POST /jobs/{id}/cancel
- GET /jobs/{id}/stream
- GET /jobs/{id}/download
- GET /page/{cluster_id}
- GET /page/{cluster_id}/meta
- POST /page/{cluster_id}/build
- POST /page/{cluster_id}/invalidate
- POST /page/{cluster_id}/purge

---

# ✅ 6) Pipeline por Agentes (01–09)
01 SEO Pack → seo_pack.json  
02 Content Pack → content.json  
03 HTML → HTML/CSS  
04 Validator → reports  
05 Assets → assets dedup  
06 Full Pipeline → 01→05  
07 Update Cycle → insights + planos  
08 Experiment Manager → A/B + rollout  
09 Optimizer → recovery/extreme  

---

# ✅ 7) Modelo de dados (colunas por tabela) — explicado
## jobs
id, project_id, cluster_id, agent_name, status, created_at, started_at, finished_at, priority, input_ref, output_ref, error_message

## agent_runs
id, job_id, agent_name, status, log_url, created_at, expires_at

## page_versions
id, project_id, cluster_id, channel, cache_key, html_url, zip_url, created_at, promoted_from

## page_cache
id, project_id, cluster_id, cache_key, status, expires_at, url_preview, url_prod

## scores
id, project_id, cluster_id, page_type, score, explain_json, updated_at

## insights_raw
id, project_id, cluster_id, payload_small, score_hint, expires_at

## insights_gold
id, project_id, cluster_id, insight_text, score, tags, usage_count, last_used_at, created_at

## experiments
id, project_id, cluster_id, status, variant_a_cache_key, variant_b_cache_key, rollout_percent, created_at

## experiment_metrics
id, experiment_id, metric_name, value_a, value_b, winner, captured_at

## optimizer_runs
id, project_id, cluster_id, mode, plan_url, result_url, created_at

## admin_actions_log
id, actor, action, reason, project_id, cluster_id, created_at

## media_registry
id, project_id, asset_hash, asset_url, owner_cluster_id, ref_count, created_at

## metrics_history
id, project_id, cluster_id, source, snapshot_json, captured_at

---

# ✅ 8) Score Engine (0–100) — regras detalhadas
Determinístico (0–70):
- refs 8+ (+10)
- tabelas (+10)
- mobile ok (+10)
- headings ok (+10)
- performance ok (+10)
- CTA forte (+10)
- estrutura completa (+10)

Conteúdo (70–90):
- copy clara (+5)
- coerência (+5)
- FAQ útil (+5)
- prova sem inventar (+5)
- ELP ≥1900 palavras (+5)
- links contexto (+5)

Dados reais (90–100):
- CTR melhorou (+5)
- conversão melhorou (+5)
- Clarity ajudou (+5)
- A/B venceu (+5)

---

# ✅ 9) Diff & Guardrails (bloqueios e correções)
Bloqueia promote se:
- removeu references block
- removeu tabelas
- overflow mobile
- quebrou hero/CTA
- links inválidos
- mudança grande demais

---

# ✅ 10) Fluxo de instalação no Ubuntu (checklist)
- Ubuntu 24.04 LTS
- Cloudflare Tunnel + Access
- Engine FastAPI (service)
- Redis (locks/cache)
- Supabase (tabelas + storage)
- Nginx (páginas/assets)
- Web Factory (UI → Engine)
- Monitoramento (CPU/RAM/Disk)

---

# ✅ 11) As 10 sugestões extras (lista fechada)
1) Template Freeze + Auditor  
2) Sem imagens IA (agentes)  
3) 8+ referências  
4) 1–3 tabelas  
5) Media Density  
6) Launch ≥60 / Gold ≥90  
7) Cluster Retirement  
8) Page Cache v1  
9) Diff & Guardrails  
10) Update Gate + fairness + 1 projeto por vez  

---

# ✅ FIM
Este documento é a **biblioteca oficial**.  
Nada deve ser removido daqui — apenas acrescentado.
