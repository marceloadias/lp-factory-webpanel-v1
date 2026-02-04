"use client";

import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import type { Cluster, InputProject } from "@/lib/types";
import {
    Database,
    Plus,
    Loader2,
    ChevronRight,
    ArrowUpDown,
    DollarSign,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreBar } from "@/components/ui/score-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { I18N } from "@/lib/i18n/pt-BR";

function toNumberOrZero(v: unknown): number {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number") return Number.isFinite(v) ? v : 0;
    if (typeof v === "string") {
        const n = Number(v.replace(",", "."));
        return Number.isFinite(n) ? n : 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function safeText(v: unknown, fallback = "—") {
    if (v === null || v === undefined) return fallback;
    const s = String(v).trim();
    return s.length ? s : fallback;
}

function getCommissionNumber(cluster: Cluster): number {
    const raw =
        (cluster as any)?.payload?.commission ?? (cluster as any)?.commission ?? null;
    return toNumberOrZero(raw);
}

function getCommissionBRL(cluster: Cluster): string {
    const n = getCommissionNumber(cluster);
    if (!n || n <= 0) return "—";
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getStatusUi(statusRaw: unknown): { label: string; badge: "success" | "danger" | "neutral" } {
    const s = String(statusRaw ?? "").toLowerCase().trim();

    if (!s) return { label: "—", badge: "neutral" };

    if (s === "active") return { label: "Online", badge: "success" };

    // estados comuns do Engine
    if (s === "paused") return { label: "Pausado", badge: "neutral" };
    if (s === "retired") return { label: "Retirado", badge: "neutral" };
    if (s === "deleted") return { label: "Deletado", badge: "danger" };

    // compat legado
    if (s === "inactive") return { label: "Offline", badge: "danger" };
    if (s === "provisioning") return { label: "Provisionando", badge: "neutral" };
    if (s === "error") return { label: "Erro", badge: "danger" };

    // fallback: mostra o próprio status
    return { label: s.toUpperCase(), badge: "neutral" };
}

export default function ClustersPage() {
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [loading, setLoading] = useState(true);

    // seleciona projeto real
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [projects, setProjects] = useState<InputProject[]>([]);

    const [isClient, setIsClient] = useState(false);
    const [mockMode, setMockMode] = useState(false);

    // 1) Sync com store + client flag
    useEffect(() => {
        const state = appStore.getState();
        setSelectedProject(state.selectedProject || "");
        setMockMode(state.mockMode);

        const unsub = appStore.subscribe((newState) => {
            setSelectedProject(newState.selectedProject || "");
            setMockMode(newState.mockMode);
        });

        setIsClient(true);
        return () => {
            unsub();
        };
    }, []);

    // 2) Carrega projetos reais do Engine
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await apiClient.listInputProjects();
                const list = Array.isArray(res.data?.projects) ? res.data.projects : [];
                setProjects(list);

                // se ainda não tem selecionado, escolhe o primeiro projeto
                const state = appStore.getState();
                const current = state.selectedProject || "";
                const isValid = current && list.some((p: any) => p.project_id === current);

                const first = list[0]?.project_id || "";
                const chosen = isValid ? current : first;

                if (chosen) {
                    appStore.setSelectedProject(chosen);
                    setSelectedProject(chosen);
                }
            } catch (e) {
                console.error("Failed to load input projects", e);
                setProjects([]);
            }
        };

        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectedProjectObj = useMemo(() => {
        return projects.find((p) => p.project_id === selectedProject);
    }, [projects, selectedProject]);

    const fetchClusters = async (projectId: string) => {
        setLoading(true);
        try {
            const params = projectId ? { projectId } : {};
            const res = await apiClient.listClusters(params);

            // engine pode retornar array direto em data:
            setClusters(Array.isArray(res.data) ? (res.data as Cluster[]) : []);
        } catch (error) {
            console.error("Failed to fetch clusters", error);
            setClusters([]);
        } finally {
            setLoading(false);
        }
    };

    // 3) Busca clusters sempre que o projeto muda (mockMode não altera a API por enquanto, mas mantemos pra UI)
    useEffect(() => {
        if (!selectedProject) {
            setClusters([]);
            setLoading(false);
            return;
        }
        fetchClusters(selectedProject);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedProject, mockMode]);

    const filteredClusters = clusters;

    const headerButtonClass =
        "h-8 px-0 font-semibold hover:bg-transparent text-xs tracking-tight text-muted-foreground hover:text-foreground";

    const columns: ColumnDef<Cluster>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        {I18N.COMMON.NAME}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const cluster = row.original;
                const st = getStatusUi(cluster.status);

                return (
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-xl bg-card border border-border/5 text-muted-foreground hover:text-primary transition-colors">
                            <Database className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm tracking-tight text-foreground hover:text-primary transition-colors truncate">
                                {safeText(cluster.name)}
                            </span>
                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground/70">
                                <span className="font-mono">{safeText(cluster.project_id)}</span>
                                <span className="opacity-30">·</span>
                                <span className="uppercase">{st.label}</span>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "project_id",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        {I18N.COMMON.PROJECTS}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <Badge
                    variant="secondary"
                    className="bg-muted/50 text-muted-foreground text-xs px-2 py-0 border-none font-semibold"
                >
                    {row.original.project_id}
                </Badge>
            ),
        },

        // ✅ Comissão (payload.commission)
        {
            id: "commission",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        Comissão
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            sortingFn: (a, b) => {
                const an = getCommissionNumber(a.original);
                const bn = getCommissionNumber(b.original);
                return an - bn;
            },
            cell: ({ row }) => {
                const val = getCommissionBRL(row.original);

                return (
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground/70" />
                        <span className="text-xs font-mono font-semibold text-muted-foreground">
                            {val}
                        </span>
                    </div>
                );
            },
        },

        {
            accessorKey: "score",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        Health Score
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <div className="w-48">
                    <ScoreBar
                        value={row.original.score || 0}
                        showLabel={false}
                        className="translate-y-1"
                    />
                </div>
            ),
        },

        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        {I18N.COMMON.STATUS}
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const st = getStatusUi(row.original.status);
                return <StatusBadge status={st.badge}>{st.label}</StatusBadge>;
            },
        },

        {
            accessorKey: "version",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className={headerButtonClass}
                    >
                        Versão
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                );
            },
            cell: ({ row }) => (
                <span className="text-xs font-mono font-semibold text-muted-foreground">
                    v{(row.original as any)?.version ?? "—"}
                </span>
            ),
        },

        {
            id: "actions",
            header: () => (
                <div className="text-center text-xs font-semibold text-muted-foreground/70">
                    {I18N.COMMON.ACTIONS}
                </div>
            ),
            cell: ({ row }) => {
                const cluster = row.original;
                return (
                    <div className="text-center">
                        <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="rounded-full gap-2 text-primary hover:bg-primary/10 transition-all"
                        >
                            <Link href={`/clusters/${cluster.id}`}>
                                {I18N.COMMON.DETAILS}
                                <ChevronRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="Frota de Clusters"
                description="Visualize e gerencie todos os clusters ativos em sua infraestrutura."
            >
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-xs font-semibold tracking-tight px-2 py-0.5 rounded-full ${mockMode
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-emerald-500/10 text-emerald-500"
                                }`}
                        >
                            {mockMode
                                ? `Dados: ${I18N.COMMON.MOCK_MODE}`
                                : `Dados: ${I18N.COMMON.REAL_MODE}`}
                        </span>

                        <Button
                            asChild
                            className="rounded-full gap-2 shadow-lg shadow-primary/20 h-7 text-xs font-semibold"
                        >
                            <Link href="/clusters/new">
                                <Plus className="h-3 w-3" />
                                {I18N.CLUSTERS.CREATE}
                            </Link>
                        </Button>
                    </div>

                    {/* Seletor de Projeto */}
                    <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-semibold text-muted-foreground/70">Projeto</div>

                        <select
                            className="h-8 rounded-md border bg-background px-2 text-xs font-semibold"
                            value={selectedProject}
                            onChange={(e) => {
                                const pid = e.target.value;
                                appStore.setSelectedProject(pid);
                                setSelectedProject(pid);
                            }}
                        >
                            {projects.map((p) => (
                                <option key={p.project_id} value={p.project_id}>
                                    {p.project_id} — {p.niche || "N/A"}
                                </option>
                            ))}
                        </select>

                        {selectedProjectObj && (
                            <div className="text-xs text-muted-foreground font-mono opacity-80">
                                ELP:{" "}
                                <span className="font-semibold">{selectedProjectObj.hub_elp_domain}</span> ·
                                LP: <span className="font-semibold">{selectedProjectObj.lp_domain}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono opacity-60 mr-1">
                        <span className={isClient ? "text-emerald-500" : "text-amber-500"}>
                            Cliente: {isClient ? "Sim" : "Não"}
                        </span>
                        <span className="opacity-30">|</span>
                        <span>
                            Total: {clusters.length} / Filtrado: {filteredClusters.length}
                        </span>
                        <span className="opacity-30">|</span>
                        <span>Proj: {selectedProject || "-"}</span>
                    </div>
                </div>
            </PageHeader>

            {loading && clusters.length === 0 ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredClusters.length === 0 ? (
                <div className="p-20">
                    <EmptyState
                        title="Nenhum cluster encontrado"
                        description="Sua frota está vazia ou nenhum resultado corresponde à sua busca."
                        icon={Database}
                        actionLabel={I18N.CLUSTERS.CREATE}
                        onAction={() => (window.location.href = "/clusters/new")}
                    />
                </div>
            ) : (
                <PremiumDataTable
                    title="Clusters Ativos"
                    data={filteredClusters}
                    columns={columns}
                    searchPlaceholder={I18N.DATATABLE.SEARCH_PLACEHOLDER}
                    enableRowSelection={true}
                    enableColumnVisibility={true}
                    enableDateRange={true}
                    enableFilters={true}
                />
            )}
        </div>
    );
}
