"use client";

import { Cluster, Job, AuditEvent, Template } from "@/lib/types";

export const MOCK_CLUSTERS: Cluster[] = [
    {
        id: "cluster-8231",
        project_id: "proj_demo",
        name: "PROD-EDGE-01",
        status: "active",
        score: 98,
        region: "us-east-1",
        provider: "aws",
        capacity: { used: 45, total: 100 },
        version: "1.4.2",
        last_updated: new Date().toISOString()
    },
    {
        id: "cluster-1290",
        project_id: "proj_001",
        name: "STAGING-01",
        status: "active",
        score: 85,
        region: "eu-central-1",
        provider: "hetzner",
        capacity: { used: 12, total: 64 },
        version: "1.4.1",
        last_updated: new Date().toISOString()
    },
    {
        id: "cluster-9921",
        project_id: "proj_002",
        name: "LEGACY-PROD",
        status: "inactive",
        score: 42,
        region: "sa-east-1",
        provider: "aws",
        capacity: { used: 89, total: 100 },
        version: "1.2.0",
        last_updated: new Date().toISOString()
    }
];

export const MOCK_JOBS: Job[] = [
    {
        id: "job_9x2kL01m",
        project_id: "proj_demo",
        cluster_id: "cluster-8231",
        type: "deploy_landing_page",
        status: "running",
        progress: 65,
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "job_1v8sP92q",
        project_id: "proj_002",
        cluster_id: "cluster-9921",
        type: "sync_edge_cache",
        status: "completed",
        progress: 100,
        created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
        id: "job_7m3fR45t",
        project_id: "proj_001",
        cluster_id: "cluster-1290",
        type: "generate_seo_pack",
        status: "failed",
        progress: 15,
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        updated_at: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
        error: "Timeout during GPT-4 response generation"
    }
];

export const MOCK_TEMPLATES: Template[] = [
    {
        id: "tpl_standard_v1",
        name: "Standard Performance",
        version: "1.0.2",
        type: "landing_page",
        preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: "tpl_convert_high",
        name: "High Conversion V3",
        version: "3.2.1",
        type: "landing_page",
        preview: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&q=60"
    }
];

export const MOCK_AUDIT: AuditEvent[] = [
    {
        id: "audit_1",
        action: "CLUSTER_RESTART",
        actor: "marcelo@lp-factory.com",
        cluster_id: "cluster-8231",
        project_id: "client-delta",
        reason: "Manual refresh after config change",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
        id: "audit_2",
        action: "KEY_ROTATION",
        actor: "system_auto",
        project_id: "client-omega",
        reason: "Security policy: 90 days rotation",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
];

export const MOCK_SCORES = [
    { date: "2024-01-20", score: 92 },
    { date: "2024-01-21", score: 94 },
    { date: "2024-01-22", score: 88 },
    { date: "2024-01-23", score: 95 },
    { date: "2024-01-24", score: 97 },
    { date: "2024-01-25", score: 96 },
    { date: "2024-01-26", score: 98 }
];
