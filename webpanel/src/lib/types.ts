export type JobStatus = "pending" | "queued" | "running" | "processing" | "completed" | "failed";

export interface Job {
    id: string;
    project_id: string;
    cluster_id: string;
    type: string;
    status: JobStatus;
    progress: number;
    created_at: string;
    updated_at: string;
    error?: string;
    payload?: any;
}

export type ClusterStatus = "active" | "inactive" | "provisioning" | "error";

/*
 * @description
 * Incluido dia 02/02/2026 - ChatGPT
 */
export type InputProject = {
    project_id: string;
    niche?: string;
    locale?: string;
    hub_elp_domain?: string;
    lp_domain?: string;
};


export interface ClusterCapacity {
    used: number;
    total: number;
}

export interface Cluster {
    id: string;
    project_id: string;
    name: string;
    status: ClusterStatus;
    score: number;
    region: string;
    provider: string;
    capacity: ClusterCapacity;
    version: string;
    last_updated: string;
}

export interface Template {
    id: string;
    name: string;
    version: string;
    type: string;
    preview: string;
    edit_count?: number;
    locked?: boolean;
    content?: string; // HTML/CSS content for editing
}

export interface AuditEvent {
    id: string;
    action: string;
    actor: string;
    cluster_id?: string;
    project_id: string;
    reason: string;
    timestamp: string;
}

export interface EngineResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
    };
}
