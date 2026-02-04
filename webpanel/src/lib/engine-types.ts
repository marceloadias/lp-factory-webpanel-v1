export type ClusterStatus =
    | "active"
    | "inactive"
    | "paused"
    | "deleted"
    | "retired"
    | string;

export type ProductType =
    | "DIGITAL"
    | "FISICO"
    | "ENCAPSULADO"
    | "SAAS"
    | "SERVICO"
    | string;

export interface ClusterPayload {
    created_date?: string; // "01-02-26"

    product_name?: string;
    product_type?: ProductType;

    affiliate_name?: string;
    platform_name?: string;

    product_url?: string;
    affiliate_url?: string;
    affiliate_checkout_url?: string;

    commission?: number;
    audience?: string;
    niche?: string;
    video_url?: string;

    // não quebrar se o engine mandar coisas novas:
    [key: string]: any;
}

export interface EngineCluster {
    id: string;
    name: string;
    status: ClusterStatus;
    project_id: string;

    score?: number;
    created_at?: string;
    updated_at?: string;

    payload?: ClusterPayload;
}
