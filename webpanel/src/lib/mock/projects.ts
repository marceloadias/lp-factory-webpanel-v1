import { Project } from "../types/project";

export const MOCK_PROJECTS: Project[] = [
    {
        project_id: "proj_demo",
        name: "Projeto Demo",
        niche: "Tecnologia",
        language: "pt-BR",
        domains: {
            hub_elp: "demo.factory.ai",
            lp: "lp.demo.factory.ai"
        },
        clusters_count: 12,
        clusters_online: 10,
        avg_score: 87,
        gold_clusters: 5,
        last_update: "2026-01-27T18:00:00Z",
        integrations: ["GA4", "GSC", "GTM"],
        update_cycle: {
            enabled: true,
            warmup_hours: 48,
            next_window: "2026-01-29T00:00:00Z"
        },
        jobs_stats: {
            running: 2,
            queued: 5,
            failed: 1
        }
    },
    {
        project_id: "proj_001",
        name: "Projeto 001",
        niche: "E-commerce",
        language: "pt-BR",
        domains: {
            hub_elp: "shop.factory.ai",
            lp: "lp.shop.factory.ai"
        },
        clusters_count: 8,
        clusters_online: 7,
        avg_score: 92,
        gold_clusters: 6,
        last_update: "2026-01-27T16:30:00Z",
        integrations: ["GA4", "GSC"],
        update_cycle: {
            enabled: true,
            warmup_hours: 24,
            next_window: "2026-01-28T12:00:00Z"
        },
        jobs_stats: {
            running: 1,
            queued: 3,
            failed: 0
        }
    },
    {
        project_id: "proj_002",
        name: "Projeto 002",
        niche: "Saúde e Bem-estar",
        language: "en-US",
        domains: {
            hub_elp: "health.factory.ai",
            lp: "lp.health.factory.ai"
        },
        clusters_count: 15,
        clusters_online: 14,
        avg_score: 78,
        gold_clusters: 3,
        last_update: "2026-01-27T20:15:00Z",
        integrations: ["GA4", "GTM", "Bing"],
        update_cycle: {
            enabled: false,
            warmup_hours: 72,
            next_window: "2026-02-01T00:00:00Z"
        },
        jobs_stats: {
            running: 0,
            queued: 8,
            failed: 2
        }
    }
];

export function getProjectById(id: string): Project | undefined {
    return MOCK_PROJECTS.find(p => p.project_id === id);
}
