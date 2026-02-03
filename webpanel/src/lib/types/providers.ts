// lib/types/providers.ts

export interface ModelConfig {
    id: string
    label: string
}

export type ProviderStatus = "enabled" | "disabled"
export type ProviderHealth = "ok" | "error" | "unknown"

export interface Provider {
    id: string
    display_name: string
    enabled: boolean
    base_url?: string
    api_key?: string

    models: ModelConfig[]
    default_model?: string

    rate_limit_rpm?: number
    rate_limit_tpm?: number
    notes?: string
    last_updated?: string

    /** Opcional: prepara o terreno para health real */
    health?: ProviderHealth
    status?: ProviderStatus
}