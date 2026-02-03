"use client"

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatsCharts } from "@/components/overview/StatsCharts";
import { TablesRow } from "@/components/overview/TablesRow";
import { QuickActions } from "@/components/overview/QuickActions";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import { Cluster, Job } from "@/lib/types";
import { KpiCard } from "@/components/ui/kpi-card";
import {
    Activity,
    Database,
    Target,
    Monitor,
    ClipboardList,
    FileText,
    Server,
    History
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { I18N } from "@/lib/i18n/pt-BR";
import { SystemStatus } from "@/components/overview/SystemStatus";

export default function OverviewPage() {
    const [mounted, setMounted] = useState(false);
    const [data, setData] = useState<{ jobs: Job[], clusters: Cluster[] }>({
        jobs: [],
        clusters: []
    });
    const [stats, setStats] = useState({
        totalJobs: 0,
        runningJobs: 0,
        averageScore: 0,
        totalClusters: 0,
        loading: true
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [jobsRes, clustersRes] = await Promise.all([
                apiClient.get<Job[]>('/jobs'),
                apiClient.get<Cluster[]>('/clusters')
            ]);

            const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
            const clusters = Array.isArray(clustersRes.data) ? clustersRes.data : [];

            const avgScore = clusters.length > 0
                ? Math.round(clusters.reduce((acc, c) => acc + (c.score || 0), 0) / clusters.length)
                : 0;

            setData({ jobs, clusters });
            setStats({
                totalJobs: jobs.length,
                runningJobs: jobs.filter(j => j.status === 'running').length,
                totalClusters: clusters.length,
                averageScore: avgScore,
                loading: false
            });
        } catch (error) {
            if (appStore.getIsOnline()) {
                console.error("Overview fetch error", error);
            }
            setStats(prev => ({ ...prev, loading: false }));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, []);

    if (!mounted) return null;

    return (
        <div className="space-y-16 pb-12">
            <PageHeader title={I18N.OVERVIEW.TITLE} description={I18N.OVERVIEW.SUBTITLE}>
                <QuickActions clusterCount={stats.totalClusters} jobCount={stats.totalJobs} />
            </PageHeader>

            <SystemStatus />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard
                    title={I18N.OVERVIEW.ACTIVE_TASKS}
                    value={stats.totalJobs}
                    icon={Activity}
                    trend={{ value: "+1.14%", positive: true }}
                    description={I18N.OVERVIEW.GLOBAL_STATUS}
                />
                <KpiCard
                    title={I18N.COMMON.CLUSTERS}
                    value={stats.totalClusters}
                    icon={Database}
                    trend={{ value: "+0.82%", positive: true }}
                    description={I18N.OVERVIEW.ONLINE_FLEET}
                />
                <KpiCard
                    title={I18N.OVERVIEW.PERFORMANCE}
                    value={stats.averageScore + "%"}
                    icon={Target}
                    trend={{ value: "+0.32%", positive: true }}
                    description={I18N.OVERVIEW.AVERAGE_SCORE}
                />
                <KpiCard
                    title="Gateway UI"
                    value="ONLINE"
                    icon={Monitor}
                    trend={{ value: "99.9%", positive: true }}
                    description="Stream de API"
                />
            </div>

            <div className="space-y-10">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black tracking-tight page-heading uppercase">Relatórios & Infraestrutura</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="glass-card border-none p-10 rounded-3xl shadow-xl group hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-8">
                            <div className="p-6 bg-primary/5 rounded-2xl text-primary shadow-sm border border-primary/10 transition-transform group-hover:scale-110">
                                <ClipboardList className="h-8 w-8" />
                            </div>
                            <div className="flex-1 space-y-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black tracking-tight uppercase">Saúde Global</h3>
                                    <span className="text-sm font-black text-primary">{stats.averageScore}%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(0,87,255,0.4)] transition-all duration-1000"
                                        style={{ width: `${stats.averageScore}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card border-none p-10 rounded-3xl shadow-xl group hover:shadow-2xl transition-all">
                        <div className="flex items-center gap-8">
                            <div className="p-6 bg-emerald-500/5 rounded-2xl text-emerald-500 shadow-sm border border-emerald-500/10 transition-transform group-hover:scale-110">
                                <FileText className="h-8 w-8" />
                            </div>
                            <div className="flex-1 space-y-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-black tracking-tight uppercase">Sincronia Nodes</h3>
                                    <span className="text-sm font-black text-emerald-500">100%</span>
                                </div>
                                <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000"
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="glass-card border-none p-8 rounded-3xl shadow-xl group hover:shadow-2xl transition-all border-2 border-primary/10 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-none">Infraestrutura</p>
                                <h3 className="text-3xl font-black tracking-tighter leading-none mt-2">ATIVO</h3>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-sm">
                                <Server className="h-6 w-6" />
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Region Host</p>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase">US-EAST-01</span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] border-none font-black uppercase">{I18N.STATUS.ACTIVE}</Badge>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                    <History className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] page-subheading">Monitoramento em Tempo Real</span>
                </div>
                <div className="space-y-6">
                    <TablesRow initialData={data} loading={loading} onRefresh={fetchData} />
                </div>
            </div>

            <div>
                <StatsCharts initialData={data} loading={loading} />
            </div>
        </div>
    );
}
