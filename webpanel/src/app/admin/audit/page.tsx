"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { apiClient } from "@/lib/api/client";
import {
    History,
    Download,
    User,
    ShieldCheck,
    ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable";
import { ColumnDef } from "@tanstack/react-table";

interface AuditLog {
    id: string;
    action: string;
    reason: string;
    actor: string;
    project_id: string;
    cluster_id?: string;
    timestamp: string;
}

export default function AuditPage() {
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                const res = await apiClient.get<AuditLog[]>('/audit');
                setAuditLogs(res.data || []);
            } catch (error) {
                console.error("Failed to fetch audit logs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
    }, []);

    const handleExportCSV = () => {
        if (auditLogs.length === 0) return;

        const headers = ["ID", "Ação", "Motivo", "Ator", "Projeto", "Cluster", "Timestamp"];
        const rows = auditLogs.map(log => [
            log.id,
            log.action,
            log.reason,
            log.actor,
            log.project_id,
            log.cluster_id || "Global",
            log.timestamp
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `audit_logs_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns: ColumnDef<AuditLog>[] = [
        {
            accessorKey: "action",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-0 font-black hover:bg-transparent"
                    >
                        Ação / Motivo
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const log = row.original
                return (
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-card border border-border/5 text-muted-foreground hover:text-primary hover:border-primary/20 transition-all">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-sm uppercase tracking-tighter text-foreground hover:text-primary transition-colors">{log.action.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-muted-foreground font-bold opacity-60 uppercase mt-0.5">{log.reason}</span>
                        </div>
                    </div>
                )
            },
        },
        {
            accessorKey: "actor",
            header: "Usuário Responsável",
            cell: ({ row }) => {
                const log = row.original
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <User className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-black text-foreground/80 uppercase tracking-tight">{log.actor}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "project_id",
            header: "Contexto",
            cell: ({ row }) => {
                const log = row.original
                return (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-primary/80 tracking-widest">{log.project_id}</span>
                        <span className="text-[10px] font-mono opacity-30 mt-1 uppercase font-bold">{log.cluster_id || 'Global Scope'}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "timestamp",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-0 font-black hover:bg-transparent ml-auto"
                    >
                        Timestamp
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const log = row.original
                return (
                    <div className="text-right">
                        <div className="text-xs font-black text-foreground/80 uppercase">
                            {format(new Date(log.timestamp), "dd/MM/yy", { locale: ptBR })}
                        </div>
                        <div className="text-[10px] font-mono opacity-30 mt-0.5">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                        </div>
                    </div>
                )
            },
        },
    ];

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="Log de Auditoria"
                description="Rastreabilidade completa de todas as ações administrativas realizadas no Factory."
            >
                <Button
                    variant="outline"
                    className="rounded-full gap-2 px-6 h-10 border-white/10 hover:bg-white/5 transition-all"
                    onClick={handleExportCSV}
                    disabled={auditLogs.length === 0}
                >
                    <Download className="h-4 w-4" />
                    Exportar CSV
                </Button>
            </PageHeader>

            {loading ? (
                <div className="flex justify-center p-20">
                    <History className="h-8 w-8 animate-pulse text-primary" />
                </div>
            ) : (
                <PremiumDataTable
                    title="Eventos do Sistema"
                    data={auditLogs}
                    columns={columns}
                    searchPlaceholder="Filtrar por ator, ação ou projeto..."
                    enableRowSelection={true}
                    enableColumnVisibility={true}
                    enableDateRange={true}
                    enableFilters={true}
                />
            )}
        </div>
    );
}
