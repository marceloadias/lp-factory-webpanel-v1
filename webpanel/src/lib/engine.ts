import { apiClient } from "@/lib/api/client";
import type { EngineCluster } from "@/lib/engine-types";

/**
 * Busca 1 cluster por ID no Engine.
 * Mantemos o nome fetchCluster (já existente no seu projeto) para não quebrar imports antigos.
 */
export async function fetchCluster(clusterId: string): Promise<EngineCluster | null> {
    const res = await apiClient.get<EngineCluster>(`/clusters/${clusterId}`);
    return res?.success ? (res.data ?? null) : null;
}
