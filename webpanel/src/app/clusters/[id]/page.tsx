"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { EngineCluster } from "@/lib/engine-types";
import { fetchCluster } from "@/lib/engine";

import { appStore } from "@/lib/store";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreBar } from "@/components/ui/score-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Loader2,
    ExternalLink,
    Calendar,
    Link as LinkIcon,
    DollarSign,
    User,
    Globe,
    Copy,
    Check,
    Activity,
    Boxes,
    FileJson,
    Tag,
} from "lucide-react";

function safeText(v: unknown, fallback = "—") {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    return s.length ? s : fallback;
}

function isHttpUrl(v?: string) {
    if (!v) return false;
    return v.startsWith("http://") || v.startsWith("https://");
}

function extractEngineDetail(err: unknown): string | null {
    try {
        const e: any = err;
        const detail =
            e?.response?.data?.detail ??
            e?.data?.detail ??
            e?.response?.detail ??
            e?.detail;
        if (typeof detail === "string" && detail.trim().length) return detail.trim();

        const msg = e?.message;
        if (typeof msg === "string" && msg.trim().length) return msg.trim();

        return null;
    } catch {
        return null;
    }
}

function Field({
    label,
    value,
    icon,
}: {
    label: string;
    value: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border/10 bg-background/60 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {icon ? <span className="opacity-80">{icon}</span> : null}
                <span className="font-medium">{label}</span>
            </div>
            <div className="mt-1 text-sm md:text-base font-semibold leading-snug">
                {value}
            </div>
        </div>
    );
}

function UrlRow({
    label,
    url,
    onCopy,
}: {
    label: string;
    url?: string;
    onCopy: (text: string) => void;
}) {
    const canOpen = isHttpUrl(url);
    const canCopy = !!url;

    return (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/10 bg-background/60 p-4">
            <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">{label}</div>
                <div className="mt-1 text-xs md:text-sm font-mono break-all opacity-80">
                    {safeText(url)}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="secondary"
                    className="rounded-full h-9 px-3"
                    disabled={!canCopy}
                    onClick={() => url && onCopy(url)}
                    title="Copiar"
                >
                    <Copy className="h-4 w-4" />
                </Button>

                {canOpen ? (
                    <a
                        href={url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex"
                        title="Abrir"
                    >
                        <Button variant="secondary" className="rounded-full h-9 px-3">
                            <ExternalLink className="h-4 w-4" />
                        </Button>
                    </a>
                ) : (
                    <Button
                        variant="secondary"
                        className="rounded-full h-9 px-3"
                        disabled
                        title="Abrir"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function ClusterDetailsPage() {
    const router = useRouter();
    const params = useParams<{ id?: string }>();
    const clusterId = params?.id;

    const [cluster, setCluster] = useState<EngineCluster | null>(null);
    const [loading, setLoading] = useState(true);
    const [mockMode, setMockMode] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [refreshTick, setRefreshTick] = useState(0);

    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // mock mode (store) - sem await aqui
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

    // fetch engine
    useEffect(() => {
        let alive = true;

        const run = async () => {
            if (!clusterId) {
                setCluster(null);
                setLoading(false);
                setError("Cluster ID ausente na rota.");
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const data = await fetchCluster(String(clusterId));

                if (!alive) return;

                setCluster(data ?? null);
                if (!data) setError("Engine retornou vazio (success=false ou data=null).");
            } catch (e) {
                if (!alive) return;
                console.error("Failed to fetch cluster detail:", e);

                setCluster(null);

                const detail = extractEngineDetail(e);
                setError(detail ?? "Falha ao buscar o cluster no Engine.");
            } finally {
                if (!alive) return;
                setLoading(false);
            }
        };

        run();
        return () => {
            alive = false;
        };
    }, [clusterId, refreshTick]);

    const payload = useMemo(() => cluster?.payload || {}, [cluster]);

    const createdAt = useMemo(() => {
        if (!cluster?.created_at) return null;
        try {
            return format(new Date(cluster.created_at), "dd/MM/yyyy, HH:mm:ss", {
                locale: ptBR,
            });
        } catch {
            return cluster.created_at;
        }
    }, [cluster?.created_at]);

    const updatedAt = useMemo(() => {
        if (!cluster?.updated_at) return null;
        try {
            return format(new Date(cluster.updated_at), "dd/MM/yyyy, HH:mm:ss", {
                locale: ptBR,
            });
        } catch {
            return cluster.updated_at;
        }
    }, [cluster?.updated_at]);

    const statusLabel = useMemo(() => {
        const s = (cluster?.status || "").toLowerCase();
        if (!s) return "—";
        if (s === "active") return "Operacional";
        if (s === "inactive") return "Offline";
        return cluster?.status || "—";
    }, [cluster?.status]);

    const statusVariant = useMemo(() => {
        const s = (cluster?.status || "").toLowerCase();
        if (s === "active") return "success";
        if (s === "inactive") return "danger";
        return "neutral";
    }, [cluster?.status]);

    const rawJson = useMemo(() => {
        if (!cluster) return "";
        try {
            return JSON.stringify(cluster, null, 2);
        } catch {
            return String(cluster);
        }
    }, [cluster]);

    async function copyText(key: string, text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            window.setTimeout(() => setCopiedKey(null), 1200);
        } catch {
            try {
                const ta = document.createElement("textarea");
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand("copy");
                document.body.removeChild(ta);
                setCopiedKey(key);
                window.setTimeout(() => setCopiedKey(null), 1200);
            } catch {
                // falhou
            }
        }
    }

    if (loading && !cluster) {
        return (
            <div className="flex justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!cluster) {
        return (
            <div className="space-y-8 pb-12">
                <PageHeader
                    title="Detalhes do Cluster"
                    description="Não foi possível carregar este cluster."
                >
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="rounded-full gap-2"
                            onClick={() => router.push("/clusters")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Button>

                        <Button
                            variant="secondary"
                            className="rounded-full"
                            onClick={() => setRefreshTick((v) => v + 1)}
                        >
                            Recarregar
                        </Button>
                    </div>
                </PageHeader>

                <div className="p-10 md:p-20 space-y-6">
                    <EmptyState
                        title="Cluster não encontrado"
                        description={
                            error
                                ? `${error} — verifique o ID, sua conexão com o Engine, ou se o cluster foi removido.`
                                : "Verifique o ID, sua conexão com o Engine, ou se o cluster foi removido."
                        }
                        icon={Globe}
                    />
                </div>
            </div>
        );
    }

    const scoreValue = cluster.score ?? 0;

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title={safeText(cluster.name)}
                description={`ID único: ${safeText(cluster.id)}`}
            >
                <div className="flex items-center gap-2">
                    <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${mockMode
                                ? "bg-amber-500/10 text-amber-700 border-amber-500/15"
                                : "bg-emerald-500/10 text-emerald-700 border-emerald-500/15"
                            }`}
                    >
                        {mockMode ? "Dados: Mock" : "Dados: Real"}
                    </span>

                    <Button asChild variant="ghost" className="rounded-full gap-2">
                        <Link href="/clusters">
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </Link>
                    </Button>

                    <Button
                        variant="secondary"
                        className="rounded-full"
                        onClick={() => setRefreshTick((v) => v + 1)}
                    >
                        Recarregar
                    </Button>
                </div>
            </PageHeader>

            <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={statusVariant as any}>{statusLabel}</StatusBadge>

                <Badge variant="secondary" className="rounded-full">
                    <span className="font-semibold">{scoreValue}%</span>&nbsp;
                    <span className="text-muted-foreground">Health</span>
                </Badge>

                <Badge variant="secondary" className="rounded-full font-mono">
                    {safeText(cluster.project_id)}
                </Badge>

                <div className="w-full md:w-[260px] md:ml-auto">
                    <ScoreBar value={scoreValue} showLabel={false} className="translate-y-[2px]" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2 rounded-3xl border-border/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-primary" />
                            Dados do produto
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Informações principais do cluster (do payload do Engine)
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Nome do produto"
                                icon={<Tag className="h-4 w-4" />}
                                value={safeText((payload as any).product_name || cluster.name)}
                            />
                            <Field
                                label="Tipo de produto"
                                value={
                                    <span className="uppercase">
                                        {safeText((payload as any).product_type)}
                                    </span>
                                }
                            />
                            <Field label="Plataforma" value={safeText((payload as any).platform_name)} />
                            <Field
                                label="Afiliado"
                                icon={<User className="h-4 w-4" />}
                                value={safeText((payload as any).affiliate_name)}
                            />
                            <Field
                                label="Comissão"
                                icon={<DollarSign className="h-4 w-4" />}
                                value={
                                    (payload as any).commission !== undefined &&
                                        (payload as any).commission !== null
                                        ? Number((payload as any).commission).toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                        })
                                        : "—"
                                }
                            />
                            <Field label="Nicho" value={safeText((payload as any).niche)} />
                            <Field label="Público alvo" value={safeText((payload as any).audience)} />
                            <Field
                                label="Data de criação (created_date)"
                                icon={<Calendar className="h-4 w-4" />}
                                value={
                                    <span className="font-mono">
                                        {safeText((payload as any).created_date)}
                                    </span>
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="xl:col-span-1 space-y-6">
                    <Card className="rounded-3xl border-border/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Temporalidade
                            </CardTitle>
                            <CardDescription className="text-sm">Datas do Engine e status</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="rounded-2xl border border-border/10 bg-background/60 p-4">
                                <div className="text-xs font-medium text-muted-foreground">Criado em</div>
                                <div className="mt-1 text-sm md:text-base font-semibold font-mono">
                                    {safeText(createdAt)}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border/10 bg-background/60 p-4">
                                <div className="text-xs font-medium text-muted-foreground">
                                    Última sincronização
                                </div>
                                <div className="mt-1 text-sm md:text-base font-semibold font-mono text-primary">
                                    {safeText(updatedAt)}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-border/10 bg-background/60 p-4">
                                <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Engine status
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`h-2 w-2 rounded-full ${(cluster.status || "").toLowerCase() === "active"
                                                ? "bg-emerald-500"
                                                : "bg-rose-500"
                                            }`}
                                    />
                                    <span className="text-sm font-semibold">{statusLabel}</span>
                                </div>
                            </div>

                            {error ? (
                                <>
                                    <Separator className="bg-border/10" />
                                    <div className="text-xs font-mono opacity-70">{error}</div>
                                </>
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-border/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Performance global
                            </CardTitle>
                            <CardDescription className="text-sm">
                                Aqui entra métrica real quando existir endpoint de tracking
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 gap-4">
                            <Field label="Clicks totais" value="—" />
                            <Field label="Conversão estimada" value="—" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="xl:col-span-3 rounded-3xl border-border/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-primary" />
                            Ecossistema de conectividade
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Links do produto, afiliado e checkout (copiar/abrir)
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <UrlRow
                            label="Link da página de vendas"
                            url={(payload as any).product_url}
                            onCopy={(t) => copyText("product_url", t)}
                        />
                        <UrlRow
                            label="Link de afiliado (hoplink)"
                            url={(payload as any).affiliate_url}
                            onCopy={(t) => copyText("affiliate_url", t)}
                        />
                        <UrlRow
                            label="Link de checkout direto"
                            url={(payload as any).affiliate_checkout_url}
                            onCopy={(t) => copyText("affiliate_checkout_url", t)}
                        />

                        {copiedKey ? (
                            <div className="flex items-center gap-2 text-sm text-emerald-700">
                                <Check className="h-4 w-4" />
                                Copiado: <span className="font-mono">{copiedKey}</span>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                <Card className="xl:col-span-3 rounded-3xl border-border/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg font-semibold flex items-center gap-2">
                            <FileJson className="h-5 w-5 text-primary" />
                            Diagnóstico do motor (JSON)
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Exatamente o que o Engine retornou em{" "}
                            <span className="font-mono">/clusters/{String(clusterId ?? "")}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">JSON bruto do cluster</div>

                            <Button
                                variant="secondary"
                                className="rounded-full h-9 px-3"
                                onClick={() => rawJson && copyText("raw_json", rawJson)}
                                disabled={!rawJson}
                                title="Copiar JSON"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar
                            </Button>
                        </div>

                        <div className="rounded-3xl border border-border/10 bg-neutral-950 text-neutral-100 overflow-hidden">
                            <pre className="p-5 text-[12px] md:text-[13px] leading-6 font-mono overflow-auto max-h-[520px]">
                                {rawJson || "—"}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
