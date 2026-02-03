export interface Project {
    project_id: string;
    name: string;
    niche: string;
    language: string;
    domains: {
        hub_elp: string;
        lp: string;
    };
    clusters_count: number;
    clusters_online: number;
    avg_score: number;
    gold_clusters: number;
    last_update: string;
    integrations: string[];
    update_cycle: {
        enabled: boolean;
        warmup_hours: number;
        next_window: string;
    };
    jobs_stats: {
        running: number;
        queued: number;
        failed: number;
    };
}
