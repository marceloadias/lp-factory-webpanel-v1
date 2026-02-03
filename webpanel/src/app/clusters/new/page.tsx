"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import { I18N } from "@/lib/i18n/pt-BR";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Loader2,
    Database,
    Calendar,
    Tag,
    DollarSign,
    AlertCircle,
    Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type InputProject = {
    project_id: string;
    niche?: string;
    locale?: string;
    hub_elp_domain?: string;
    lp_domain?: string;
};

export default function NewClusterPage() {
    const router = useRouter();

    const [mockMode, setMockMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const [projects, setProjects] = useState<InputProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>(""); // agora é obrigatório

    // Data do formulário (DD-MM-YY)
    const today = useMemo(() => {
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yy = String(d.getFullYear()).slice(-2);
        return `${dd}-${mm}-${yy}`;
    }, []);

    // Data para ID (DDMMYY)
    const dateForId = useMemo(() => today.replace(/-/g, ""), [today]);

    const selectedProjectObj = useMemo(() => {
        return projects.find((p) => p.project_id === selectedProject);
    }, [projects, selectedProject]);

    // Form State
    const [formData, setFormData] = useState({
        product_name: "",
        product_type: "",
        affiliate_name: "",
        platform_name: "",
        product_url: "",
        affiliate_url: "",
        affiliate_checkout_url: "",
        commission: "",
        audience: "",
        video_url: "",
    });

    // ---------- helpers ----------
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validateUrl = (url: string) => {
        if (!url) return true;
        return url.startsWith("http://") || url.startsWith("https://");
    };

    // Sufixo do cluster_id: 3 primeiras letras do project_id (proj_demo => PRO)
    const clusterSuffix = useMemo(() => {
        const raw = (selectedProject || "PRO").replace(/[^a-zA-Z0-9]/g, "");
        return raw.slice(0, 3).toUpperCase().padEnd(3, "X");
    }, [selectedProject]);

    // ID: DDMMYY-XXX
    const clusterId = useMemo(() => {
        return `${dateForId}-${clusterSuffix}`;
    }, [dateForId, clusterSuffix]);

    // ---------- sync store / load projects ----------
    useEffect(() => {
        const state = appStore.getState();
        setMockMode(state.mockMode);

        const unsub = appStore.subscribe((newState) => {
            setMockMode(newState.mockMode);
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await apiClient.listInputProjects();
                const list = Array.isArray(res.data?.projects) ? res.data.projects : [];
                setProjects(list);

                // define projeto selecionado:
                // 1) tenta store.selectedProject se existir e for válido
                // 2) senão, pega o primeiro projeto da lista
                const state = appStore.getState();
                const current = state.selectedProject || "";
                const isValid = current && list.some((p) => p.project_id === current);

                const chosen = isValid ? current : (list[0]?.project_id || "");
                if (chosen) {
                    appStore.setSelectedProject(chosen);
                    setSelectedProject(chosen);
                } else {
                    setSelectedProject("");
                }
            } catch (e) {
                console.error("Failed to load input projects", e);
                setProjects([]);
                setSelectedProject("");
            }
        };

        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------- submit ----------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // validações obrigatórias
        if (!selectedProject) {
            toast.error("Selecione um Projeto (obrigatório).");
            return;
        }
        if (!formData.product_name?.trim()) {
            toast.error("O campo Nome do Produto é obrigatório.");
            return;
        }
        if (!formData.product_type) {
            toast.error("O campo Tipo de Produto é obrigatório.");
            return;
        }
        if (!formData.platform_name?.trim()) {
            toast.error("O campo Plataforma é obrigatório.");
            return;
        }
        if (!formData.affiliate_name?.trim()) {
            toast.error("O campo Nome do Afiliado é obrigatório.");
            return;
        }
        if (!formData.audience?.trim()) {
            toast.error("O campo Público Alvo é obrigatório.");
            return;
        }

        // urls
        if (!validateUrl(formData.product_url)) {
            toast.error("URL do Produto inválida (deve iniciar com http:// ou https://).");
            return;
        }
        if (!validateUrl(formData.affiliate_url)) {
            toast.error("URL de Afiliado inválida (deve iniciar com http:// ou https://).");
            return;
        }
        if (formData.affiliate_checkout_url && !validateUrl(formData.affiliate_checkout_url)) {
            toast.error("URL de Checkout inválida (deve iniciar com http:// ou https://).");
            return;
        }
        if (formData.video_url && !validateUrl(formData.video_url)) {
            toast.error("URL de Vídeo inválida (deve iniciar com http:// ou https://).");
            return;
        }

        // comissão
        const commissionValue = parseFloat(String(formData.commission).replace(",", "."));
        if (isNaN(commissionValue) || commissionValue <= 0) {
            toast.error("A comissão deve ser um valor numérico positivo.");
            return;
        }

        // nicho vem do projeto
        const nicheFromProject = selectedProjectObj?.niche || "";

        setLoading(true);

        const payload = {
            type: "create_cluster",
            project_id: selectedProject,
            cluster_id: clusterId,
            payload: {
                created_date: today,

                // meta do projeto (útil pro backend / auditoria / debug)
                project_id: selectedProject,
                locale: selectedProjectObj?.locale,
                hub_elp_domain: selectedProjectObj?.hub_elp_domain,
                lp_domain: selectedProjectObj?.lp_domain,
                niche: nicheFromProject,

                // dados do cluster
                product_name: formData.product_name,
                product_type: formData.product_type, // FISICO | DIGITAL | SERVICO
                platform_name: formData.platform_name,
                affiliate_name: formData.affiliate_name,
                product_url: formData.product_url,
                affiliate_url: formData.affiliate_url,
                affiliate_checkout_url: formData.affiliate_checkout_url || undefined,
                commission: commissionValue,
                audience: formData.audience,
                video_url: formData.video_url || undefined,
            },
        };

        try {
            const res = await apiClient.post<{ id: string }>("/jobs", payload);

            if (res.success && res.data?.id) {
                toast.success(I18N.CLUSTERS.SUCCESS_CREATE);
                router.push(`/jobs?highlight=${res.data.id}`);
                return;
            }

            throw new Error(res.error?.message || I18N.CLUSTERS.ERROR_CREATE);
        } catch (error: any) {
            console.error("Failed to create cluster", error);
            toast.error(error.message || I18N.CLUSTERS.ERROR_CREATE);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 overflow-hidden">
            <PageHeader title={I18N.CLUSTERS.NEW_TITLE} description={I18N.CLUSTERS.NEW_SUBTITLE}>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current/10",
                                mockMode ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                            )}
                        >
                            {mockMode ? `MODO: ${I18N.COMMON.MOCK_MODE}` : `MODO: ${I18N.COMMON.REAL_MODE}`}
                        </span>

                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="rounded-full gap-2 text-muted-foreground hover:bg-muted/50 transition-all font-black uppercase text-xs tracking-tight"
                        >
                            <Link href="/clusters">
                                <ArrowLeft className="h-3 w-3" />
                                {I18N.COMMON.CANCEL}
                            </Link>
                        </Button>
                    </div>
                </div>
            </PageHeader>

            <form
                onSubmit={handleSubmit}
                className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
                <Card className="glass-card border-none overflow-hidden rounded-3xl bg-[#F4F7F9]/90 dark:bg-[#080909]/80">
                    <CardHeader className="p-10 border-b border-border/10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Database className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tight">
                                    {I18N.CLUSTERS.CREATE}
                                </CardTitle>
                                <CardDescription className="text-sm font-medium opacity-60">
                                    Provisionamento tático baseado em dados de afiliação.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-10 space-y-12">
                        {/* Projeto (obrigatório) */}
                        <div className="bg-muted/20 p-8 rounded-2xl border border-border/5 space-y-4">
                            <div className="flex items-center justify-between gap-6 flex-wrap">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Projeto (obrigatório)
                                    </Label>
                                    <select
                                        className="h-12 rounded-xl border bg-background px-3 text-sm font-black"
                                        value={selectedProject}
                                        onChange={(e) => {
                                            const pid = e.target.value;
                                            appStore.setSelectedProject(pid);
                                            setSelectedProject(pid);
                                        }}
                                    >
                                        <option value="" disabled>
                                            Selecione um projeto...
                                        </option>
                                        {projects.map((p) => (
                                            <option key={p.project_id} value={p.project_id}>
                                                {p.project_id} — {p.niche || "N/A"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedProjectObj && (
                                    <div className="text-xs font-mono opacity-70 leading-5">
                                        <div>
                                            <span className="opacity-60">Nicho:</span>{" "}
                                            <span className="font-black">{selectedProjectObj.niche || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="opacity-60">Locale:</span>{" "}
                                            <span className="font-black">{selectedProjectObj.locale || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="opacity-60">ELP:</span>{" "}
                                            <span className="font-black">{selectedProjectObj.hub_elp_domain || "-"}</span>
                                        </div>
                                        <div>
                                            <span className="opacity-60">LP:</span>{" "}
                                            <span className="font-black">{selectedProjectObj.lp_domain || "-"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="text-[11px] text-muted-foreground font-medium">
                                O <b>nicho</b> é definido pelo projeto e vai travado no payload.
                            </div>
                        </div>

                        {/* Auto-generated Readonly Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-muted/20 p-8 rounded-2xl border border-border/5">
                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                                    <Tag className="h-3 w-3 text-primary" />
                                    ID do Cluster (Automático)
                                </Label>
                                <Input
                                    readOnly
                                    value={clusterId}
                                    className="h-14 rounded-xl bg-white/30 dark:bg-black/10 border-none font-mono font-black text-lg text-primary text-center"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                                    <Calendar className="h-3 w-3 text-primary" />
                                    Data de Registro
                                </Label>
                                <Input
                                    readOnly
                                    value={today}
                                    className="h-14 rounded-xl bg-white/30 dark:bg-black/10 border-none font-black text-lg text-center opacity-60"
                                />
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">
                                Informações do Produto
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Nome do Produto *
                                    </Label>
                                    <Input
                                        name="product_name"
                                        required
                                        placeholder="Ex: Curso de Marketing..."
                                        value={formData.product_name}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Tipo de Produto *
                                    </Label>
                                    <select
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border border-border/40 px-3 font-black"
                                        value={formData.product_type}
                                        onChange={(e) => setFormData((p) => ({ ...p, product_type: e.target.value }))}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="FISICO">FÍSICO</option>
                                        <option value="DIGITAL">DIGITAL</option>
                                        <option value="SERVICO">SERVIÇO</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Plataforma *
                                    </Label>
                                    <Input
                                        name="platform_name"
                                        required
                                        placeholder="Ex: Hotmart, Kiwify..."
                                        value={formData.platform_name}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Nicho (do projeto)
                                    </Label>
                                    <Input
                                        readOnly
                                        value={selectedProjectObj?.niche || ""}
                                        className="h-14 rounded-xl bg-muted/20 border-border/20 font-bold opacity-70"
                                        title="Nicho definido pelo projeto selecionado"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-3 w-3 text-primary" />
                                        URL do Produto *
                                    </div>
                                    <span className="text-[10px] text-primary/60 italic flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        URL da página oficial
                                    </span>
                                </Label>
                                <Input
                                    name="product_url"
                                    required
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.product_url}
                                    onChange={handleChange}
                                    className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium text-sm"
                                />
                            </div>
                        </div>

                        {/* Affiliate & Strategy */}
                        <div className="space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary/60 border-b border-primary/10 pb-2">
                                Dados do Afiliado & Estratégia
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Nome do Afiliado *
                                    </Label>
                                    <Input
                                        name="affiliate_name"
                                        required
                                        placeholder="Seu nome ou identificador..."
                                        value={formData.affiliate_name}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Comissão (R$) *
                                    </Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                        <Input
                                            name="commission"
                                            required
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.commission}
                                            onChange={handleChange}
                                            className="h-14 pl-10 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        URL Afiliado (CTA) *
                                    </Label>
                                    <Input
                                        name="affiliate_url"
                                        required
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.affiliate_url}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium text-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        URL Checkout (Opcional)
                                    </Label>
                                    <Input
                                        name="affiliate_checkout_url"
                                        type="url"
                                        placeholder="https://..."
                                        value={formData.affiliate_checkout_url}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        Público Alvo (1 Linha) *
                                    </Label>
                                    <Input
                                        name="audience"
                                        required
                                        placeholder="Ex: Homens de 25-45 anos interessados em..."
                                        value={formData.audience}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium text-sm"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">
                                        URL Vídeo VSL (Opcional)
                                    </Label>
                                    <Input
                                        name="video_url"
                                        type="url"
                                        placeholder="https://youtube.com/..."
                                        value={formData.video_url}
                                        onChange={handleChange}
                                        className="h-14 rounded-xl bg-white/50 dark:bg-black/20 border-border/40 focus:ring-primary/20 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-border/10">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="w-full sm:w-auto h-12 rounded-xl px-10 font-black text-xs uppercase tracking-widest opacity-60 hover:opacity-100 transition-all"
                            >
                                <Link href="/clusters">{I18N.COMMON.CANCEL}</Link>
                            </Button>

                            <Button
                                type="submit"
                                disabled={loading || !selectedProject}
                                className="w-full sm:w-auto h-16 rounded-xl px-24 bg-primary text-white font-black text-[12px] uppercase tracking-[0.1em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Criar Cluster
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
