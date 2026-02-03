import { Provider } from "../types/providers";
import { Agent, AgentSuggestion } from "../types/agents";
import { MOCK_PROVIDERS } from "../mock/providers";
import { MOCK_AGENTS } from "../mock/agents";

export interface UIPreferences {
    sidebarExpanded: boolean;
    theme: "light" | "dark" | "system";
    accentColor: string;
}

export interface AppState {
    mockMode: boolean;
    baseUrl: string;
    apiKey: string;
    selectedProject: string;
    uiPreferences: UIPreferences;
    isOnline: boolean;
    providers: Provider[];
    agents: Agent[];
    agentSuggestions: AgentSuggestion[];
}

type Listener = (state: AppState) => void;

const DEFAULT_STATE: AppState = {
    mockMode: true,
    baseUrl: process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:8000",
    apiKey: process.env.NEXT_PUBLIC_ENGINE_API_KEY || "",
    selectedProject: "all",
    uiPreferences: {
        sidebarExpanded: true,
        theme: "light",
        accentColor: "#0057ff",
    },
    isOnline: true,
    providers: MOCK_PROVIDERS,
    agents: MOCK_AGENTS,
    agentSuggestions: [],
};

class Store {
    private state: AppState;
    private listeners: Set<Listener> = new Set();

    constructor() {
        this.state = this.loadState();
    }

    private loadState(): AppState {
        // SSR/Build safe
        if (typeof window === "undefined") return DEFAULT_STATE;

        const saved = localStorage.getItem("lp_factory_store");
        if (saved) {
            try {
                return { ...DEFAULT_STATE, ...JSON.parse(saved) };
            } catch (e) {
                console.error("Failed to parse store state", e);
            }
        }
        return DEFAULT_STATE;
    }

    private saveState() {
        if (typeof window !== "undefined") {
            localStorage.setItem("lp_factory_store", JSON.stringify(this.state));
        }
    }

    getState(): AppState {
        return this.state;
    }

    // -----------------------------
    // Convenience getters/setters
    // -----------------------------
    getIsOnline(): boolean {
        return this.state.isOnline;
    }

    setIsOnline(isOnline: boolean) {
        if (this.state.isOnline === isOnline) return;
        this.setState({ isOnline });
    }

    setSelectedProject(selectedProject: string) {
        // garante fallback
        const next = selectedProject?.trim() ? selectedProject : "all";
        if (this.state.selectedProject === next) return;
        this.setState({ selectedProject: next });
    }

    setMockMode(mockMode: boolean) {
        if (this.state.mockMode === mockMode) return;
        this.setState({ mockMode });
    }

    setBaseUrl(baseUrl: string) {
        const next = (baseUrl || "").trim();
        if (!next) return;
        if (this.state.baseUrl === next) return;
        this.setState({ baseUrl: next });
    }

    setApiKey(apiKey: string) {
        const next = apiKey || "";
        if (this.state.apiKey === next) return;
        this.setState({ apiKey: next });
    }

    // -----------------------------
    // Health check
    // -----------------------------
    async checkHealth() {
        const { apiClient } = await import("../api/client");
        try {
            const res = await apiClient.get<{ status: string }>("/health", { timeout: 5000 });
            const isOk = res.success && (res.data?.status === "ok" || res.data?.status === "success");
            this.setIsOnline(isOk);
        } catch {
            this.setIsOnline(false);
        }
    }

    // -----------------------------
    // Core store methods
    // -----------------------------
    setState(updates: Partial<AppState> | ((state: AppState) => Partial<AppState>)) {
        const nextState = typeof updates === "function" ? updates(this.state) : updates;
        this.state = { ...this.state, ...nextState };
        this.saveState();
        this.notify();
    }

    subscribe(listener: Listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notify() {
        this.listeners.forEach((l) => l(this.state));
    }
}

export const appStore = new Store();
