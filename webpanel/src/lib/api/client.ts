"use client";

import { appStore } from "@/lib/store";
import * as mocks from "@/lib/mock/datasets";
import type { EngineResponse, Job, Cluster, InputProject } from "@/lib/types";
import type { Agent, AgentSuggestion } from "@/lib/types/agents";

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

    private err<T>(code: string, message: string): EngineResponse<T> {
        return {
            success: false,
            data: undefined as unknown as T,
            error: { code, message },
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
                // garante shape de error (code/message) se vier incompleto do backend
                const p = payload as EngineResponse<T>;
                if (p.success === false && p.error) {
                    return {
                        ...p,
                        error: {
                            code: (p.error as any).code || "engine_error",
                            message: (p.error as any).message || "Erro do Engine.",
                        },
                    };
                }
                return p;
            }

            // FastAPI costuma retornar { detail: "..." } em erros
            if (payload && typeof payload === "object" && "detail" in payload) {
                return this.err<T>("engine_detail", String((payload as any).detail));
            }

            // payload puro
            return { success: true, data: payload as T };
        }

        // Fallback para texto puro
        const text = await response.text();
        return { success: true, data: text as unknown as T };
    }

    async get<T>(
        endpoint: string,
        options: { timeout?: number } = {}
    ): Promise<EngineResponse<T>> {
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
                let errorCode = `http_${response.status}`;

                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Não autorizado. Verifique sua X-API-KEY.";
                    errorCode = "unauthorized";
                } else if (response.status === 404) {
                    errorMessage = "Endpoint não encontrado (404). Verifique a URL do Engine.";
                    errorCode = "not_found";
                }

                // tenta ler {detail} / {error} se vier JSON
                try {
                    const ct = response.headers.get("content-type") || "";
                    if (ct.includes("application/json")) {
                        const err = await response.json();
                        if (err?.detail) {
                            errorMessage = String(err.detail);
                            errorCode = "engine_detail";
                        }
                        if (err?.error) {
                            errorMessage = String(err.error);
                            errorCode = "engine_error";
                        }
                    }
                } catch { }

                const error = new Error(errorMessage) as any;
                error.status = response.status;
                error.code = errorCode;
                throw error;
            }

            appStore.setIsOnline(true);
            return await this.parseResponse<T>(response);
        } catch (error: any) {
            clearTimeout(timeout);

            if (error?.name === "AbortError") {
                return this.err<T>("timeout", "Timeout na requisição. O servidor demorou muito para responder.");
            }

            // erro genérico de rede (CORS / engine down)
            if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
                appStore.setIsOnline(false);
                return this.err<T>("offline", "Falha na conexão. Engine offline ou bloqueio de CORS.");
            }

            // Evita poluir o console para erros comuns do cliente (4xx)
            const isClientError = error?.status >= 400 && error?.status < 500;
            if (!isClientError) {
                console.error(`API Error GET ${endpoint}:`, error);
            }

            return this.err<T>(String(error?.code || "unknown_error"), String(error?.message || "Erro desconhecido"));
        }
    }

    async post<T>(
        endpoint: string,
        data: unknown = {},
        options: { timeout?: number } = {}
    ): Promise<EngineResponse<T>> {
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
                let errorCode = `http_${response.status}`;

                if (response.status === 401 || response.status === 403) {
                    errorMessage = "Não autorizado. Verifique sua X-API-KEY.";
                    errorCode = "unauthorized";
                } else if (response.status === 404) {
                    errorMessage = "Endpoint não encontrado (404).";
                    errorCode = "not_found";
                }

                try {
                    const ct = response.headers.get("content-type") || "";
                    if (ct.includes("application/json")) {
                        const err = await response.json();
                        if (err?.detail) {
                            errorMessage = String(err.detail);
                            errorCode = "engine_detail";
                        }
                        if (err?.error) {
                            errorMessage = String(err.error);
                            errorCode = "engine_error";
                        }
                    }
                } catch { }

                const error = new Error(errorMessage) as any;
                error.status = response.status;
                error.code = errorCode;
                throw error;
            }

            appStore.setIsOnline(true);
            return await this.parseResponse<T>(response);
        } catch (error: any) {
            clearTimeout(timeout);

            if (error?.name === "AbortError") {
                return this.err<T>("timeout", "Timeout na requisição POST. O servidor demorou muito para responder.");
            }

            if (error?.message === "Failed to fetch" || error?.name === "TypeError") {
                appStore.setIsOnline(false);
                return this.err<T>("offline", "Falha na conexão (POST). Engine offline ou bloqueio de CORS.");
            }

            // Evita poluir o console para erros comuns do cliente (4xx)
            const isClientError = error?.status >= 400 && error?.status < 500;
            if (!isClientError) {
                console.error(`API Error POST ${endpoint}:`, error);
            }

            return this.err<T>(String(error?.code || "unknown_error"), String(error?.message || "Erro desconhecido"));
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
        return this.get<InputProject>(`/inputs/projects/${projectId}`);
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

    async createAgentSuggestion(
        agentId: string,
        payload: { scope: "user" | "system"; text: string; author: string }
    ) {
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
            const cluster = mocks.MOCK_CLUSTERS.find((c: any) => c.id === id);
            return { success: true, data: cluster as unknown as T };
        }

        if (path.includes("/jobs/") && !path.includes("/cancel")) {
            const id = path.split("/").pop();
            const job = mocks.MOCK_JOBS.find((j: any) => j.id === id);
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
            const projects: InputProject[] = [
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
                ? ({ success: true, data: found as unknown as T } as EngineResponse<T>)
                : (this.err<T>("not_found", "Project not found in mock") as EngineResponse<T>);
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
                return this.err<T>("mock_not_found", "Route not found in mock");
        }
    }
}

export const apiClient = new ApiClient();
