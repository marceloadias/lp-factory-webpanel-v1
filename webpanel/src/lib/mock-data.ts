// Mock data for Overview page

export interface KPIData {
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    status?: "success" | "warning" | "danger" | "neutral";
    icon: string;
}

export interface ChartDataPoint {
    name: string;
    value?: number;
    fill?: string;
    [key: string]: unknown;
}

export interface ClusterAtRisk {
    id: string;
    name: string;
    score: number;
    status: "critical" | "warning";
    lastUpdate: string;
}

export interface RecentJob {
    id: string;
    type: string;
    status: "running" | "completed" | "failed" | "queued";
    duration: string;
    cluster: string;
}

// KPI Data
export const kpiData: KPIData[] = [
    {
        label: "Jobs",
        value: "12 / 5 / 847",
        trend: { value: 8, isPositive: true },
        status: "success",
        icon: "activity",
    },
    {
        label: "Clusters Online",
        value: 24,
        trend: { value: 2, isPositive: true },
        status: "success",
        icon: "database",
    },
    {
        label: "Score ≥ 90",
        value: "87%",
        trend: { value: 3, isPositive: true },
        status: "success",
        icon: "target",
    },
    {
        label: "Providers",
        value: "4/5",
        trend: { value: 1, isPositive: false },
        status: "warning",
        icon: "cloud",
    },
];

// Line chart data (Jobs over time)
export const lineChartData: ChartDataPoint[] = [
    { name: "00:00", completed: 12, failed: 1 },
    { name: "04:00", completed: 8, failed: 0 },
    { name: "08:00", completed: 45, failed: 2 },
    { name: "12:00", completed: 78, failed: 3 },
    { name: "16:00", completed: 92, failed: 1 },
    { name: "20:00", completed: 65, failed: 2 },
    { name: "Now", completed: 42, failed: 0 },
];

// Bar chart data (Jobs by type)
export const barChartData: ChartDataPoint[] = [
    { name: "Create", value: 124 },
    { name: "Update", value: 89 },
    { name: "Publish", value: 156 },
    { name: "SEO", value: 78 },
    { name: "Cache", value: 45 },
];

// Donut chart data (Cluster distribution)
export const donutChartData: ChartDataPoint[] = [
    { name: "Excellent (90+)", value: 18, fill: "hsl(var(--chart-1))" },
    { name: "Good (70-89)", value: 4, fill: "hsl(var(--chart-2))" },
    { name: "At Risk (<70)", value: 2, fill: "hsl(var(--chart-3))" },
];

// Clusters at risk
export const clustersAtRisk: ClusterAtRisk[] = [
    {
        id: "cl_001",
        name: "fitness-pro-landing",
        score: 45,
        status: "critical",
        lastUpdate: "2 min ago",
    },
    {
        id: "cl_002",
        name: "crypto-signals-v2",
        score: 62,
        status: "warning",
        lastUpdate: "15 min ago",
    },
    {
        id: "cl_003",
        name: "weight-loss-offer",
        score: 58,
        status: "warning",
        lastUpdate: "1h ago",
    },
    {
        id: "cl_004",
        name: "dating-funnel-br",
        score: 71,
        status: "warning",
        lastUpdate: "3h ago",
    },
];

// Recent jobs
export const recentJobs: RecentJob[] = [
    {
        id: "job_8847",
        type: "publish",
        status: "running",
        duration: "2m 34s",
        cluster: "fitness-pro-landing",
    },
    {
        id: "job_8846",
        type: "seo_update",
        status: "completed",
        duration: "1m 12s",
        cluster: "crypto-signals-v2",
    },
    {
        id: "job_8845",
        type: "create_cluster",
        status: "completed",
        duration: "45s",
        cluster: "new-offer-jan",
    },
    {
        id: "job_8844",
        type: "cache_purge",
        status: "failed",
        duration: "0s",
        cluster: "weight-loss-offer",
    },
    {
        id: "job_8843",
        type: "update_content",
        status: "queued",
        duration: "-",
        cluster: "dating-funnel-br",
    },
];

export interface CacheEntry {
    id: string;
    path: string;
    cluster: string;
    status: "hit" | "miss" | "stale";
    size: string;
    lastGenerated: string;
}

export const cacheItems: CacheEntry[] = [
    { id: "c_1", path: "/", cluster: "fitness-pro-landing", status: "hit", size: "42 KB", lastGenerated: "2m ago" },
    { id: "c_2", path: "/pricing", cluster: "fitness-pro-landing", status: "miss", size: "0 KB", lastGenerated: "Never" },
    { id: "c_3", path: "/", cluster: "crypto-signals-v2", status: "hit", size: "128 KB", lastGenerated: "15m ago" },
    { id: "c_4", path: "/checkout", cluster: "weight-loss-offer", status: "stale", size: "84 KB", lastGenerated: "3h ago" },
    { id: "c_5", path: "/", cluster: "dating-funnel-br", status: "hit", size: "56 KB", lastGenerated: "5m ago" },
    { id: "c_6", path: "/thanks", cluster: "dating-funnel-br", status: "hit", size: "12 KB", lastGenerated: "5m ago" },
];

export interface AuditLog {
    id: string;
    action: string;
    user: string;
    cluster: string;
    details: string;
    timestamp: string;
    status: "success" | "warning" | "error";
}

export const auditLogs: AuditLog[] = [
    { id: "a_1", action: "PURGE_CACHE", user: "admin@lpfactory.com", cluster: "fitness-pro-landing", details: "Manual purge all paths", timestamp: "2024-03-20 14:20:12", status: "success" },
    { id: "a_2", action: "PROMOTE_VERSION", user: "system", cluster: "crypto-signals-v2", details: "Version v1.2.4 promoted to production", timestamp: "2024-03-20 13:45:00", status: "success" },
    { id: "a_3", action: "RETIRE_CLUSTER", user: "manager@test.com", cluster: "old-offer-2023", details: "Cluster retired due to low score", timestamp: "2024-03-20 12:10:33", status: "warning" },
    { id: "a_4", action: "FAILED_JOB", user: "system", cluster: "weight-loss-offer", details: "Job job_8844 failed after 3 retries", timestamp: "2024-03-20 11:30:00", status: "error" },
];

export interface ProviderHealth {
    id: string;
    name: string;
    status: "active" | "degraded" | "deprecated";
    latency: string;
    uptime: string;
    models: string[];
}

export const providerHealth: ProviderHealth[] = [
    { id: "p_1", name: "OpenAI", status: "active", latency: "240ms", uptime: "99.98%", models: ["gpt-4o", "gpt-4-turbo"] },
    { id: "p_2", name: "Anthropic", status: "active", latency: "310ms", uptime: "99.95%", models: ["claude-3-opus", "claude-3-sonnet"] },
    { id: "p_3", name: "Google Vertex", status: "degraded", latency: "1200ms", uptime: "98.50%", models: ["gemini-1.5-pro", "gemini-1.5-flash"] },
    { id: "p_4", name: "Groq", status: "active", latency: "45ms", uptime: "100%", models: ["llama-3-70b", "mixtral-8x7b"] },
    { id: "p_5", name: "OldProvider", status: "deprecated", latency: "-", uptime: "0%", models: ["legacy-model-v1"] },
];

export const latencyHistory = [
    { time: "10:00", openai: 240, anthropic: 310, google: 450, groq: 45 },
    { time: "11:00", openai: 260, anthropic: 330, google: 480, groq: 48 },
    { time: "12:00", openai: 230, anthropic: 300, google: 1500, groq: 42 },
    { time: "13:00", openai: 250, anthropic: 320, google: 2200, groq: 46 },
    { time: "14:00", openai: 240, anthropic: 310, google: 1200, groq: 45 },
];

