import { Agent } from "../types/agents";

export const MOCK_AGENTS: Agent[] = [
    {
        id: "01",
        name: "Generate LP SEO Pack",
        description: "Gera headlines, keywords e meta tags focadas em SEO.",
        enabled: true,
        provider_binding: { provider_id: "gemini", model_id: "gemini-1.5-flash" }
    },
    {
        id: "02",
        name: "API Client & SSE",
        description: "Gerencia a lógica de comunicação e eventos em tempo real.",
        enabled: true,
        provider_binding: { provider_id: "openai", model_id: "gpt-4o" }
    },
    {
        id: "03",
        name: "Content Generation",
        description: "Cria o conteúdo completo da Landing Page baseado na persona.",
        enabled: true,
        provider_binding: { provider_id: "gemini", model_id: "gemini-1.5-pro" }
    },
    {
        id: "04",
        name: "Media & Assets Provider",
        description: "Sugere imagens, ícones e prompts para o design visual.",
        enabled: true,
        provider_binding: { provider_id: "openai", model_id: "gpt-4o" }
    },
    {
        id: "05",
        name: "HTML/Tailwind Expert",
        description: "Transforma o conteúdo em código HTML/CSS de alta conversão.",
        enabled: true,
        provider_binding: { provider_id: "openai", model_id: "gpt-4o" }
    },
    {
        id: "06",
        name: "Deployment Engineer",
        description: "Faz o deploy da LP no Netlify/Vercel via CLI.",
        enabled: false
    },
    {
        id: "07",
        name: "Analytics Specialist",
        description: "Configura GTM, GA4 e Pixel Meta automaticamente.",
        enabled: false
    },
    {
        id: "08",
        name: "A/B Testing Master",
        description: "Sugere variações de headlines para testes de conversão.",
        enabled: false
    },
    {
        id: "09",
        name: "Quality Assurance",
        description: "Valida links, contrastes e carregamento da página.",
        enabled: true,
        provider_binding: { provider_id: "google", model_id: "gemini-1.5-flash" }
    }
];
