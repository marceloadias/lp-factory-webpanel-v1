"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { ExternalLink, Loader2, Database, ListTodo } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import { Cluster, Job, EngineResponse } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScoreBar } from "@/components/ui/score-bar";
import { I18N } from "@/lib/i18n/pt-BR";

interface TablesRowProps {
    initialData?: {
        jobs: Job[];
        clusters: Cluster[];
    };
    loading?: boolean;
    onRefresh?: () => void;
}

export function TablesRow({ initialData, loading: externalLoading, onRefresh }: TablesRowProps) {
    const [clusters, setClusters] = useState<Cluster[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initialData) {
            setClusters(initialData.clusters.sort((a, b) => (a.score ?? 100) - (b.score ?? 100)).slice(0, 5));
            setJobs(initialData.jobs.slice(0, 5));
            setLoading(externalLoading ?? false);
            return;
        }

        const fetchData = async (isInitial = false) => {
            const isOnline = appStore.getIsOnline();
            if (!isOnline && !isInitial) return;

            try {
                const [clustersRes, jobsRes] = await Promise.all([
                    apiClient.get<Cluster[]>('/clusters'),
                    apiClient.get<Job[]>('/jobs')
                ]);

                const clustersList = Array.isArray(clustersRes.data) ? clustersRes.data : [];
                setClusters(clustersList.sort((a, b) => (a.score ?? 100) - (b.score ?? 100)).slice(0, 5));

                const jobsList = Array.isArray(jobsRes.data) ? jobsRes.data : [];
                setJobs(jobsList.slice(0, 5));

            } catch (error) {
                if (isOnline) {
                    console.error("Dashboard fetch error:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData(true);
        const interval = setInterval(() => fetchData(), 10000);

        let lastOnline = appStore.getIsOnline();
        const unsub = appStore.subscribe((state) => {
            if (state.isOnline && !lastOnline) {
                fetchData();
            }
            lastOnline = state.isOnline;
        });

        return () => {
            clearInterval(interval);
            unsub();
        };
    }, [initialData, externalLoading]);

    if (loading) {
        return (
            <div className="flex justify-center p-12 glass-card rounded-3xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="glass-card border-none overflow-hidden p-0">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Database className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight uppercase">Clusters em Risco</h2>
                    </div>
                    <Link href="/clusters" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity translate-y-0.5">
                        Ver Frota <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
                <div className="p-0">
                    <Table className="lp-table">
                        <TableHeader>
                            <TableRow className="border-white/5 uppercase">
                                <TableHead className="px-6">Cluster</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead className="text-right px-6">Saúde</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clusters.length === 0 ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={3} className="lp-table-empty">Nenhum cluster encontrado</TableCell>
                                </TableRow>
                            ) : (
                                clusters.map((cluster) => (
                                    <TableRow key={cluster.id} className="group border-white/5 hover:bg-muted/30">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">{cluster.name}</span>
                                                <span className="text-[10px] uppercase font-bold opacity-30">{cluster.provider} · {cluster.region}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3 w-32">
                                                <ScoreBar value={cluster.score || 0} showLabel={false} className="translate-y-1" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <StatusBadge status={cluster.status === 'active' ? 'success' : 'danger'}>
                                                {cluster.status === 'active' ? 'Ativo' : 'Offline'}
                                            </StatusBadge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Card className="glass-card border-none overflow-hidden p-0">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <ListTodo className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black tracking-tight uppercase">Tarefas Recentes</h2>
                    </div>
                    <Link href="/jobs" className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 hover:opacity-80 transition-opacity translate-y-0.5">
                        Fila Completa <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
                <div className="p-0">
                    <Table className="lp-table">
                        <TableHeader>
                            <TableRow className="border-white/5 uppercase">
                                <TableHead className="px-6">Operação</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right px-6">Tempo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {jobs.length === 0 ? (
                                <TableRow className="border-none">
                                    <TableCell colSpan={3} className="lp-table-empty">Nenhuma tarefa recente</TableCell>
                                </TableRow>
                            ) : (
                                jobs.map((job) => (
                                    <TableRow key={job.id} className="group border-white/5 hover:bg-muted/30">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{job.type.replace('_', ' ')}</span>
                                                <span className="text-[10px] font-mono opacity-30">{job.id.substring(0, 12)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={
                                                job.status === 'completed' ? 'success' :
                                                    job.status === 'failed' ? 'danger' :
                                                        job.status === 'running' ? 'info' : 'neutral'
                                            }>
                                                {job.status === 'running' ? I18N.STATUS.PROCESSING :
                                                    job.status === 'completed' ? 'OK' : I18N.STATUS.FAILED}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell className="text-right px-6 text-[10px] font-bold uppercase opacity-50">
                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
