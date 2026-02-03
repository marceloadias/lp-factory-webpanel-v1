import { Provider } from "../types/providers";

export const MOCK_PROVIDERS: Provider[] = [
    {
        id: "openai",
        display_name: "OpenAI",
        enabled: true,
        models: [
            { id: "gpt-4o", label: "GPT-4o" },
            { id: "gpt-4o-mini", label: "GPT-4o Mini" },
            { id: "o1-preview", label: "o1 Preview" }
        ],
        default_model: "gpt-4o",
        last_updated: new Date().toISOString()
    },
    {
        id: "gemini",
        display_name: "Google Gemini",
        enabled: true,
        models: [
            { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
            { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" }
        ],
        default_model: "gemini-1.5-flash",
        last_updated: new Date().toISOString()
    },
    {
        id: "anthropic",
        display_name: "Anthropic",
        enabled: false,
        models: [
            { id: "claude-3-5-sonnet", label: "Claude 3.5 Sonnet" },
            { id: "claude-3-opus", label: "Claude 3 Opus" }
        ],
        default_model: "claude-3-5-sonnet",
        last_updated: new Date().toISOString()
    }
];
