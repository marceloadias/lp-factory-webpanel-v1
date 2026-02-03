"use client";

import { appStore } from "@/lib/store";
import * as mocks from "@/lib/mock/datasets";
import { EngineResponse, Job, Cluster } from "@/lib/types";
import { Agent, AgentSuggestion } from "@/lib/types/agents";

type InputProject = {
    project_id: string;
    niche?: string;
    locale?: string;
    hub_elp_domain?: string;
    lp_domain?: string;
};

class ApiClient {
    isMock() {
        return appStore.getState().mockMode;
    }

    private async delay(ms: number = 500) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private getHeaders() {
        const { apiKey } = appStore.getState();
        return {
            "X-API-KEY": apiKey || "",
            "Content-Type": "application/json",
        };
    }

    // ✅ Aceita:
    // - EngineResponse<T> => { success, data }
    // - payload puro (array/objeto) => embrulha em { success:true, data: payload }
    // - 204 No Content
    // - resposta não-JSON (texto)
    private async parseResponse<T>(response: Response): Promise<EngineResponse<T>> {
        if (response.status === 204) {
            return { success: true, data: undefined as unknown as T };
        }

        const contentType = response.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            const payload = await response.json();

            // EngineResponse padrão
            if (payload && typeof payload === "object" && "success" in payload) {
                return payload as EngineResponse<T>;
            }

            // FastAPI costuma retornar {detail: "..."} (especialmente em erros)
            if (payload && typeof payload === "object" && "detail" in payload) {
                return { success: false, error: { message: String((payload as any).detail) } } as any;
            }

            // payload puro
            return { success: true, data: payload as T } as EngineResponse<T>;
        }

        // Fallback para texto puro
        const text = await response.text();
        return { success: true, data: text as unknown as T } as EngineResponse<T>;
    }

    async get<T>(endpoint: string, options: { timeout?: number } = {}): Promise<EngineResponse<T>> {
        const { mockMode, baseUrl } = appStore.getState();

        if (mockMode) {
            await this.delay();
            return this.getMockData<T>(endpoint);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeout || 10000);

        try {
            const url = `${baseUrl}${endpoint}`;
            console.log(`[API Client] Calling: ${url}`);

            const response = await fetch(url, {
                headers: this.getHeaders(),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;

                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Não autorizado. Verifique sua X-API-KEY.";
                } else if (response.status === 404) {
                    errorMessage = "Endpoint não encontrado (404). Verifique a URL do Engine.";
                }

                // tenta ler {detail} / {error} se vier JSON
                try {
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const err = await response.json();
                        if (err?.detail) errorMessage = String(err.detail);
                        if (err?.error) errorMessage = String(err.error);
                    }
                } catch { }

                const error = new Error(errorMessage) as any;
                error.status = response.status;
                throw error;
            }

            appStore.setIsOnline(true);
            return await this.parseResponse<T>(response);
        } catch (error: any) {
            clearTimeout(timeout);

            if (error?.name === "AbortError") {
                throw new Error("Timeout na requisição. O servidor demorou muito para responder.");
            }

            // erro genérico de rede (CORS / engine down)
            if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
                appStore.setIsOnline(false);
                return { success: false, error: { message: "Falha na conexão. Engine offline ou bloqueio de CORS." } } as any;
            }

            // Evita poluir o console para erros comuns do cliente (4xx)
            // Só logamos erros reais do servidor (500+) ou erros inesperados de rede
            const isClientError = error?.status >= 400 && error?.status < 500;
            if (!isClientError) {
                console.error(`API Error GET ${endpoint}:`, error);
            }

            return { success: false, error: { message: error?.message || "Erro desconhecido" } } as any;
        }
    }

    async post<T>(endpoint: string, data: unknown = {}, options: { timeout?: number } = {}): Promise<EngineResponse<T>> {
        const { mockMode, baseUrl } = appStore.getState();

        if (mockMode) {
            await this.delay();
            return { success: true, data: data as T };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeout || 15000);

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: "POST",
                body: JSON.stringify(data),
                headers: this.getHeaders(),
                signal: controller.signal,
            });

            clearTimeout(timeout);

            if (!response.ok) {
                let errorMessage = `Erro ${response.status}: ${response.statusText}`;

                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Não autorizado. Verifique sua X-API-KEY.";
                } else if (response.status === 404) {
                    errorMessage = "Endpoint não encontrado (404).";
                }

                try {
                    const contentType = response.headers.get("content-type") || "";
                    if (contentType.includes("application/json")) {
                        const err = await response.json();
                        if (err?.detail) errorMessage = String(err.detail);
                        if (err?.error) errorMessage = String(err.error);
                    }
                } catch { }

                const error = new Error(errorMessage) as any;
                error.status = response.status;
                throw error;
            }

            appStore.setIsOnline(true);
            return await this.parseResponse<T>(response);
        } catch (error: any) {
            clearTimeout(timeout);

            if (error?.name === "AbortError") {
                throw new Error("Timeout na requisição POST. O servidor demorou muito para responder.");
            }

            if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
                appStore.setIsOnline(false);
                return { success: false, error: { message: "Falha na conexão (POST). Engine offline ou bloqueio de CORS." } } as any;
            }

            // Evita poluir o console para erros comuns do cliente (4xx)
            const isClientError = error?.status >= 400 && error?.status < 500;
            if (!isClientError) {
                console.error(`API Error POST ${endpoint}:`, error);
            }

            return { success: false, error: { message: error?.message || "Erro desconhecido" } } as any;
        }
    }

    // -----------------------------
    // Specific Methods
    // -----------------------------
    async health() {
        return this.get<{ status: string }>("/health");
    }

    async whoami() {
        return this.get<{ project: string; role: string; permissions: string[] }>("/whoami");
    }

    // -----------------------------
    // Inputs (domains.yaml + projects/*/project.yaml)
    // -----------------------------
    async listInputProjects() {
        return this.get<{ projects: InputProject[] }>("/inputs/projects");
    }

    async getInputProject(projectId: string) {
        return this.get(`/inputs/projects/${projectId}`);
    }

    async listJobs(params?: { limit?: number; offset?: number; projectId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset) queryParams.append("offset", params.offset.toString());
        if (params?.projectId && params.projectId !== "all") queryParams.append("project_id", params.projectId);

        const query = queryParams.toString();
        return this.get<Job[]>(`/jobs${query ? `?${query}` : ""}`);
    }

    async getJob(id: string) {
        return this.get<Job>(`/jobs/${id}`);
    }

    async cancelJob(id: string) {
        return this.post<{ status: string }>(`/jobs/${id}/cancel`);
    }

    async listClusters(params?: { limit?: number; offset?: number; projectId?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append("limit", params.limit.toString());
        if (params?.offset) queryParams.append("offset", params.offset.toString());
        if (params?.projectId && params.projectId !== "all") queryParams.append("project_id", params.projectId);

        const query = queryParams.toString();
        return this.get<Cluster[]>(`/clusters${query ? `?${query}` : ""}`);
    }

    async getCluster(id: string) {
        return this.get<Cluster>(`/clusters/${id}`);
    }

    // -----------------------------
    // Agents & Suggestions
    // -----------------------------
    async getAgents() {
        return this.get<Agent[]>("/agents");
    }

    async getAgentSuggestions(agentId: string) {
        return this.get<AgentSuggestion[]>(`/agents/${agentId}/suggestions`);
    }

    async createAgentSuggestion(agentId: string, payload: { scope: "user" | "system"; text: string; author: string }) {
        return this.post<AgentSuggestion>(`/agents/${agentId}/suggestions`, payload);
    }

    async archiveAgentSuggestion(id: string) {
        return this.post<{ ok: boolean }>(`/agent-suggestions/${id}/archive`);
    }

    // -----------------------------
    // Mock routing
    // -----------------------------
    private getMockData<T>(endpoint: string): EngineResponse<T> {
        const url = new URL(`http://mock${endpoint}`);
        const path = url.pathname;

        if (path.includes("/clusters/")) {
            const id = path.split("/").pop();
            const cluster = mocks.MOCK_CLUSTERS.find((c) => c.id === id);
            return { success: true, data: cluster as unknown as T };
        }

        if (path.includes("/jobs/") && !path.includes("/cancel")) {
            const id = path.split("/").pop();
            const job = mocks.MOCK_JOBS.find((j) => j.id === id);
            return { success: true, data: job as unknown as T };
        }

        if (path === "/health") {
            return { success: true, data: { status: "ok", version: "mock-1.0.0" } as unknown as T };
        }

        if (path === "/whoami") {
            return { success: true, data: { project: "mock_project", role: "admin", permissions: ["*"] } as unknown as T };
        }

        if (path === "/inputs/projects") {
            return {
                success: true,
                data: {
                    projects: [
                        {
                            project_id: "proj_saude",
                            niche: "Saúde",
                            locale: "pt-br",
                            hub_elp_domain: "saudecomprova.com.br",
                            lp_domain: "saudecomprova.com",
                        },
                        {
                            project_id: "proj_dinheiro",
                            niche: "Dinheiro",
                            locale: "pt-br",
                            hub_elp_domain: "dinheiroepix.com.br",
                            lp_domain: "dinheiroepix.com",
                        },
                    ],
                } as unknown as T,
            };
        }

        if (path.startsWith("/inputs/projects/")) {
            const projectId = path.split("/").pop() || "";
            const projects = [
                {
                    project_id: "proj_saude",
                    niche: "Saúde",
                    locale: "pt-br",
                    hub_elp_domain: "saudecomprova.com.br",
                    lp_domain: "saudecomprova.com",
                },
                {
                    project_id: "proj_dinheiro",
                    niche: "Dinheiro",
                    locale: "pt-br",
                    hub_elp_domain: "dinheiroepix.com.br",
                    lp_domain: "dinheiroepix.com",
                },
            ];
            const found = projects.find((p) => p.project_id === projectId);
            return found
                ? ({ success: true, data: found as unknown as T } as any)
                : ({ success: false, error: { message: "Project not found in mock" } } as any);
        }

        switch (path) {
            case "/clusters":
                return { success: true, data: mocks.MOCK_CLUSTERS as unknown as T };
            case "/jobs":
                return { success: true, data: mocks.MOCK_JOBS as unknown as T };
            case "/templates":
                return { success: true, data: mocks.MOCK_TEMPLATES as unknown as T };
            case "/audit":
                return { success: true, data: mocks.MOCK_AUDIT as unknown as T };
            case "/scores":
                return { success: true, data: mocks.MOCK_SCORES as unknown as T };
            default:
                return { success: false, error: { message: "Route not found in mock" } } as any;
        }
    }
}

export const apiClient = new ApiClient();
