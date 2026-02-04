import { apiClient } from "@/lib/api/client";
import type { Cluster } from "@/lib/types";

/**
 * Busca 1 cluster por ID no Engine.
 * Mantemos o nome fetchCluster (padrão do projeto) para não quebrar imports.
 */
export async function fetchCluster(clusterId: string): Promise<Cluster | null> {
    const res = await apiClient.get<Cluster>(`/clusters/${clusterId}`);
    return res?.success ? (res.data ?? null) : null;
}

/**
 * Lista clusters (opcionalmente filtrando por projectId).
 */
export async function fetchClusters(params?: { projectId?: string }): Promise<Cluster[]> {
    const res = await apiClient.listClusters(params ?? {});
    return Array.isArray(res?.data) ? (res.data as Cluster[]) : [];
}
