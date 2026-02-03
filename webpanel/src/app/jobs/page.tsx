"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import { Job } from "@/lib/types";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { ListTodo, RefreshCcw, FileText, Loader2, ArrowUpDown } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { JobDrawer } from "@/components/jobs/JobDrawer";
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { I18N } from "@/lib/i18n/pt-BR";

import { toast } from "sonner";

function JobsPageInner() {
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<string>("all");
    const [isClient, setIsClient] = useState(false);
    const [mockMode, setMockMode] = useState(true);

    // Initial state and project subscription
    useEffect(() => {
        const state = appStore.getState();
        setSelectedProject(state.selectedProject || "all");
        setMockMode(state.mockMode);

        const unsub = appStore.subscribe((newState) => {
            setSelectedProject(newState.selectedProject || "all");
            setMockMode(newState.mockMode);
        });

        setIsClient(true);
        return () => {
            unsub();
        };
    }, []);

    const fetchJobs = useCallback(
        async (isPollingCall = false) => {
            if (!isPollingCall) setLoading(true);

            try {
                const params = selectedProject !== "all" ? { projectId: selectedProject } : {};
                const res = await apiClient.listJobs(params);

                const data = Array.isArray(res.data) ? res.data : [];
                setJobs(data);

                // Check highlighted job status
                if (highlightId) {
                    const target = data.find((j) => j.id === highlightId);
                    if (target) {
                        const status = String(target.status || "").toLowerCase();

                        const isFinal = ["done", "completed", "success", "succeeded", "finished"].includes(status);
                        const isError = ["error", "failed", "canceled", "cancelled"].includes(status);

                        if (isFinal) {
                            toast.success("Cluster criado com sucesso!", {
                                description: `O cluster ${target.cluster_id || ""} está pronto para uso.`,
                                action: {
                                    label: "Ver Cluster",
                                    onClick: () => {
                                        window.location.href = target.cluster_id ? `/clusters/${target.cluster_id}` : "/clusters";
                                    },
                                },
                            });
                            return true; // Stop polling
                        }

                        if (isError) {
                            toast.error("Erro na criação do cluster", {
                                description: "Verifique os logs técnicos para mais detalhes.",
                            });
                            return true; // Stop polling
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                if (!isPollingCall) setLoading(false);
            }

            return false;
        },
        [selectedProject, highlightId]
    );

    // Polling logic
    useEffect(() => {
        let isPolling = true;
        let pollCount = 0;
        const maxPolls = 15; // ~30s (2s interval) quando tem highlight

        const runPolling = async () => {
            const shouldStop = await fetchJobs(true);
            if (shouldStop) {
                isPolling = false;
                return;
            }

            if (highlightId) {
                pollCount++;
                if (pollCount >= maxPolls) {
                    isPolling = false;
                    return;
                }

                setTimeout(() => {
                    if (isPolling) runPolling();
                }, 2000);
            } else {
                setTimeout(() => {
                    if (isPolling) runPolling();
                }, 10000);
            }
        };

        runPolling();

        return () => {
            isPolling = false;
        };
    }, [fetchJobs, highlightId]);

    const filteredJobs = jobs.filter((j) => selectedProject === "all" || j.project_id === selectedProject);

    const handleViewDetails = (job: Job) => {
        setSelectedJob(job);
        setDrawerOpen(true);
    };

    const columns: ColumnDef<Job>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
            accessorKey: "type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    {I18N.COMMON.ID} / Tipo
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight uppercase text-foreground">
                            {String(job.type || "").replace(/_/g, " ")}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground opacity-60">{job.id}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "cluster_id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    Cluster / Projeto
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground/80">{job.cluster_id}</span>
                        <span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase">{job.project_id}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "progress",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    Progresso
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const job = row.original;
                const progress = Number(job.progress || 0);
                return (
                    <div className="flex items-center gap-3 w-32">
                        <div className="h-1.5 flex-1 bg-muted/40 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(0,87,255,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-foreground">{progress}%</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    {I18N.COMMON.STATUS}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <StatusBadge
                        status={
                            job.status === "completed"
                                ? "success"
                                : job.status === "failed"
                                    ? "danger"
                                    : job.status === "running"
                                        ? "info"
                                        : "neutral"
                        }
                    >
                        {job.status === "running"
                            ? I18N.STATUS.PROCESSING
                            : job.status === "completed"
                                ? I18N.STATUS.COMPLETED
                                : job.status === "failed"
                                    ? I18N.STATUS.FAILED
                                    : job.status === "pending"
                                        ? I18N.STATUS.PENDING
                                        : job.status}
                    </StatusBadge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    {I18N.COMMON.CREATED_AT}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <span className="text-xs font-bold text-muted-foreground">
                        {job.created_at ? format(new Date(job.created_at), "dd/MM/yy HH:mm", { locale: ptBR }) : "-"}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => (
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {I18N.COMMON.ACTIONS}
                </div>
            ),
            cell: ({ row }) => {
                const job = row.original;
                return (
                    <div className="text-center flex items-center justify-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title={I18N.COMMON.DETAILS}
                            onClick={() => handleViewDetails(job)}
                        >
                            <FileText className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-8 pb-12">
            <PageHeader title={I18N.JOBS.TITLE} description={I18N.JOBS.SUBTITLE}>
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                        <span
                            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${mockMode ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                }`}
                        >
                            {mockMode ? `DADOS: ${I18N.COMMON.MOCK_MODE}` : `DADOS: ${I18N.COMMON.REAL_MODE}`}
                        </span>

                        <Button onClick={() => fetchJobs(false)} size="sm" variant="outline" className="rounded-full gap-2 h-7 text-xs">
                            <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                            Atualizar
                        </Button>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono opacity-60 mr-1">
                        <span className={isClient ? "text-emerald-500" : "text-amber-500"}>Cliente: {isClient ? "Sim" : "Não"}</span>
                        <span className="opacity-30">|</span>
                        <span>
                            Total: {jobs.length} / Filtrado: {filteredJobs.length}
                        </span>
                        <span className="opacity-30">|</span>
                        <span>Proj: {selectedProject}</span>
                    </div>
                </div>
            </PageHeader>

            {loading && jobs.length === 0 ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="p-20">
                    <EmptyState title="Nenhuma tarefa encontrada" description="A fila está vazia ou nenhum resultado corresponde à sua busca." icon={ListTodo} />
                </div>
            ) : (
                <PremiumDataTable
                    title="Tarefas em Execução"
                    data={filteredJobs}
                    columns={columns}
                    searchPlaceholder={I18N.DATATABLE.SEARCH_PLACEHOLDER}
                    searchColumn="type"
                    enableRowSelection={true}
                    enableColumnVisibility={true}
                    enableDateRange={true}
                    enableFilters={true}
                    highlightedRowId={highlightId || undefined}
                />
            )}

            <JobDrawer job={selectedJob} open={drawerOpen} onOpenChange={setDrawerOpen} />
        </div>
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-sm opacity-60">Carregando…</div>}>
            <JobsPageInner />
        </Suspense>
    );
}
