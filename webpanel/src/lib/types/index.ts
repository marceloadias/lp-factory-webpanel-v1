// webpanel/src/lib/types/index.ts

export type JobStatus =
    | "pending"
    | "queued"
    | "running"
    | "processing"
    | "completed"
    | "failed";

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

/**
 * Status do cluster pode variar conforme o Engine evolui.
 * Mantemos compatível com dois mundos:
 * - UI antiga: inactive/provisioning/error
 * - Engine real: active/paused/deleted/retired etc.
 */
export type ClusterStatus =
    | "active"
    | "paused"
    | "deleted"
    | "retired"
    | "inactive"
    | "provisioning"
    | "error"
    | string;

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

/**
 * Payload real do Engine (campos podem crescer).
 */
export type ClusterPayload = {
    created_date?: string;

    product_name?: string;
    product_type?: string;

    affiliate_name?: string;
    platform_name?: string;

    product_url?: string;
    affiliate_url?: string;
    affiliate_checkout_url?: string;

    commission?: number;
    audience?: string;
    niche?: string;
    video_url?: string;

    [key: string]: any;
};

/**
 * Cluster real do Engine + compatibilidade com UI antiga.
 */
export interface Cluster {
    id: string;
    project_id: string;
    name: string;
    status: ClusterStatus;

    score: number;

    created_at?: string;
    updated_at?: string;
    payload?: ClusterPayload;

    // UI antiga (opcionais)
    region?: string;
    provider?: string;
    capacity?: ClusterCapacity;
    version?: string;
    last_updated?: string;
}

export interface Template {
    id: string;
    name: string;
    version: string;
    type: string;
    preview: string;
    edit_count?: number;
    locked?: boolean;
    content?: string;
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
        code?: string;
        message: string;
    };
}

// re-exports (mantém compatibilidade com "@/lib/types/agents")
export * from "./agents";
