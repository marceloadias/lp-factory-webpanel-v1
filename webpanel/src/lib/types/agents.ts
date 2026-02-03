export interface AgentBinding {
    provider_id: string;
    model_id: string;
  }
  
  export interface Agent {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    provider_binding?: AgentBinding;
    max_cost?: number;
    notes?: string;
  }
  
  /** Quem criou a sugestão: usuário (manual) ou sistema (regra/base). */
  export type AgentSuggestionScope = "user" | "system";
  
  /** Status para manter histórico (auditoria) sem apagar. */
  export type AgentSuggestionStatus = "active" | "archived";
  
  export interface AgentSuggestion {
    id: string;
    agent_id: string;
  
    scope: AgentSuggestionScope;     // "user" (você) | "system" (core)
    status: AgentSuggestionStatus;   // "active" | "archived"
  
    text: string;
  
    created_at: string;
    updated_at: string;
  
    author: string;         // ex: "Marcelo" | "admin" | "system"
    last_editor: string;    // quem editou por último
  }
  