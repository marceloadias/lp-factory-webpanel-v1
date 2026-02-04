import os
import time
from datetime import datetime
import pandas as pd
import streamlit as st

APP_TITLE = "LP Factory — WebPanel (Streamlit)"
DEFAULT_ENGINE_URL = os.getenv("LPF_ENGINE_URL", "http://127.0.0.1:8010")
DEFAULT_API_KEY = os.getenv("LPF_API_KEY", "MASTER_CHANGE_ME_2026")

st.set_page_config(
    page_title=APP_TITLE,
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded",
)

CSS = """
<style>
.block-container { padding-top: 1.2rem; padding-bottom: 2rem; }
section[data-testid="stSidebar"] { background: #0b1220; border-right: 1px solid rgba(255,255,255,0.06); }
section[data-testid="stSidebar"] * { color: #d8e1ff; }
.kpi-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 14px; }
.kpi-title { font-size: 12px; opacity: 0.75; margin-bottom: 6px; }
.kpi-value { font-size: 28px; font-weight: 800; line-height: 1; }
.kpi-sub { font-size: 12px; opacity: 0.7; margin-top: 8px; }
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)

# -----------------------------
# Session state
# -----------------------------
if "nav" not in st.session_state:
    st.session_state.nav = "Dashboard"
if "engine_url" not in st.session_state:
    st.session_state.engine_url = DEFAULT_ENGINE_URL
if "api_key" not in st.session_state:
    st.session_state.api_key = DEFAULT_API_KEY

# -----------------------------
# Mock data (local first)
# -----------------------------
def mock_clusters() -> pd.DataFrame:
    return pd.DataFrame([
        {"cluster_id": "010226-PRO", "name": "Marcelo Demo 1", "status": "active", "score": 60, "commission": 50, "updated_at": "2026-02-01 13:42"},
        {"cluster_id": "cluster_002", "name": "Smartwatch Ultra Pro", "status": "active", "score": 62, "commission": 12, "updated_at": "2026-01-26 03:46"},
        {"cluster_id": "cluster_003", "name": "Produto X", "status": "draft", "score": 48, "commission": 30, "updated_at": "2026-02-03 18:10"},
        {"cluster_id": "cluster_004", "name": "Produto Y", "status": "active", "score": 91, "commission": 25, "updated_at": "2026-02-02 09:22"},
    ])

def mock_jobs() -> pd.DataFrame:
    return pd.DataFrame([
        {"job_id": "job_001", "type": "agent06_full_pipeline", "status": "running", "progress": 35, "cluster_id": "010226-PRO", "updated_at": "agora"},
        {"job_id": "job_002", "type": "agent04_validate", "status": "done", "progress": 100, "cluster_id": "cluster_004", "updated_at": "há 2h"},
        {"job_id": "job_003", "type": "agent03_generate_html", "status": "queued", "progress": 0, "cluster_id": "cluster_002", "updated_at": "há 5m"},
    ])

clusters_df = mock_clusters()
jobs_df = mock_jobs()

# -----------------------------
# Sidebar
# -----------------------------
with st.sidebar:
    st.markdown(f"### {APP_TITLE}")
    st.caption("Painel simples • 9 Agentes • Score/Jobs/Clusters")

    if st.button("🏠 Dashboard", use_container_width=True):
        st.session_state.nav = "Dashboard"
    if st.button("📦 Clusters", use_container_width=True):
        st.session_state.nav = "Clusters"
    if st.button("⚙️ Jobs", use_container_width=True):
        st.session_state.nav = "Jobs"
    if st.button("🧾 Logs", use_container_width=True):
        st.session_state.nav = "Logs"
    if st.button("🔒 Config", use_container_width=True):
        st.session_state.nav = "Config"

    st.divider()
    st.caption("Conexão (ainda mock)")
    st.write(f"Engine: `{st.session_state.engine_url}`")

# -----------------------------
# Header
# -----------------------------
c1, c2 = st.columns([2, 1])
with c1:
    st.title(st.session_state.nav)
with c2:
    st.caption("Hora")
    st.write(datetime.now().strftime("%d/%m/%Y %H:%M"))

# -----------------------------
# Pages
# -----------------------------
if st.session_state.nav == "Dashboard":
    active_count = int((clusters_df["status"] == "active").sum())
    avg_score = int(clusters_df["score"].mean())
    gold_count = int((clusters_df["score"] >= 90).sum())
    running_jobs = int((jobs_df["status"] == "running").sum())

    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown(f"<div class='kpi-card'><div class='kpi-title'>Clusters Ativos</div><div class='kpi-value'>{active_count}</div><div class='kpi-sub'>status=active</div></div>", unsafe_allow_html=True)
    with k2:
        st.markdown(f"<div class='kpi-card'><div class='kpi-title'>Score Médio</div><div class='kpi-value'>{avg_score}</div><div class='kpi-sub'>Meta Gold ≥ 90</div></div>", unsafe_allow_html=True)
    with k3:
        st.markdown(f"<div class='kpi-card'><div class='kpi-title'>Gold</div><div class='kpi-value'>{gold_count}</div><div class='kpi-sub'>clusters com 90+</div></div>", unsafe_allow_html=True)
    with k4:
        st.markdown(f"<div class='kpi-card'><div class='kpi-title'>Jobs Rodando</div><div class='kpi-value'>{running_jobs}</div><div class='kpi-sub'>fila operacional</div></div>", unsafe_allow_html=True)

    st.divider()

    ch1, ch2 = st.columns([1.2, 1])
    with ch1:
        st.subheader("Key Metrics (exemplo)")
        metric_series = pd.DataFrame(
            {"mes": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
             "valor": [250, 420, 360, 520, 610, 580, 720]}
        ).set_index("mes")
        st.line_chart(metric_series)

    with ch2:
        st.subheader("Weekly Jobs (exemplo)")
        week_series = pd.DataFrame(
            {"dia": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
             "jobs": [6, 7, 8, 8, 7, 11, 9]}
        ).set_index("dia")
        st.bar_chart(week_series)

    st.subheader("Recent Clusters (exemplo)")
    st.dataframe(clusters_df, use_container_width=True, hide_index=True)

elif st.session_state.nav == "Clusters":
    st.subheader("Lista de Clusters")
    q = st.text_input("Buscar por nome/ID", "")
    df = clusters_df.copy()
    if q.strip():
        df = df[df["name"].str.contains(q, case=False) | df["cluster_id"].str.contains(q, case=False)]
    st.dataframe(df, use_container_width=True, hide_index=True)

    st.divider()
    selected = st.selectbox("Abrir Cluster", df["cluster_id"].tolist() if len(df) else [])
    if selected:
        row = clusters_df[clusters_df["cluster_id"] == selected].iloc[0].to_dict()
        st.markdown(f"### {row['name']}")
        a, b, c, d = st.columns(4)
        a.metric("Cluster ID", row["cluster_id"])
        b.metric("Status", row["status"])
        c.metric("Score", int(row["score"]))
        d.metric("Comissão (%)", int(row["commission"]))

        st.subheader("Ações (mock)")
        x1, x2, x3, x4 = st.columns(4)
        x1.button("▶️ Rodar Pipeline (Agent06)", use_container_width=True)
        x2.button("✅ Validar (Agent04)", use_container_width=True)
        x3.button("🧱 Gerar HTML (Agent03)", use_container_width=True)
        x4.button("🖼️ Assets (Agent05)", use_container_width=True)

        st.info("No próximo passo a gente conecta esses botões no Engine via POST /jobs.")

elif st.session_state.nav == "Jobs":
    st.subheader("Fila de Jobs")
    st.dataframe(jobs_df, use_container_width=True, hide_index=True)

    st.divider()
    st.subheader("Criar Job (mock)")
    col1, col2, col3 = st.columns([1, 1, 1])
    with col1:
        cluster = st.selectbox("Cluster", clusters_df["cluster_id"].tolist())
    with col2:
        job_type = st.selectbox("Tipo", [
            "agent01_seo_pack",
            "agent02_content_pack",
            "agent03_generate_html",
            "agent04_validate",
            "agent05_assets_pack",
            "agent06_full_pipeline",
            "agent07_update_cycle",
            "agent08_experiment_manager",
            "agent09_optimizer",
        ])
    with col3:
        st.write("")
        st.write("")
        if st.button("Enviar Job", use_container_width=True):
            st.success(f"Job enviado (mock): {job_type} para {cluster}")

elif st.session_state.nav == "Logs":
    st.subheader("Logs (mock)")
    job_id = st.selectbox("Escolha um job", jobs_df["job_id"].tolist())
    st.caption("Depois vira SSE real do Engine (/jobs/{id}/stream).")

    box = st.empty()
    for i in range(3):
        box.code(f"[{datetime.now().strftime('%H:%M:%S')}] job={job_id} • step={i+1}/3 • ok\n", language="text")
        time.sleep(0.35)

elif st.session_state.nav == "Config":
    st.subheader("Configuração (local)")
    st.session_state.engine_url = st.text_input("Engine URL", st.session_state.engine_url)
    st.session_state.api_key = st.text_input("X-API-KEY", st.session_state.api_key, type="password")
    st.info("No próximo passo vamos testar /health e /whoami no Engine.")

else:
    st.warning("Página não encontrada.")
