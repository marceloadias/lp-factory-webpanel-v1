"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { KpiCard } from "@/components/ui/kpi-card"
import { getProjectById } from "@/lib/mock/projects"
import { appStore } from "@/lib/store"
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable"
import { ColumnDef } from "@tanstack/react-table"
import {
    Database,
    Target,
    Award,
    Activity,
    AlertCircle,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ArrowUpDown
} from "lucide-react"

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const project = getProjectById(projectId)

    useEffect(() => {
        if (project) {
            appStore.setState({ selectedProject: project.project_id })
        }
    }, [project])

    if (!project) {
        return (
            <div className="space-y-10 pb-12">
                <PageHeader
                    title="Projeto não encontrado"
                    description="O projeto solicitado não existe."
                />
                <div className="flex justify-center">
                    <Button onClick={() => router.push('/projects')}>
                        Voltar para Projetos
                    </Button>
                </div>
            </div>
        )
    }

    // Mock clusters for this project (50 for pagination demo)
    // Using deterministic values to avoid hydration mismatch
    const projectClusters = Array.from({ length: 50 }, (_, i) => {
        // Seed-based score generation (60-100)
        const seedScore = ((i * 17 + 13) % 41) + 60
        // Seed-based date offset (0-30 days ago)
        const daysAgo = (i * 7) % 30
        const dateOffset = daysAgo * 24 * 60 * 60 * 1000
        const baseDate = new Date('2025-06-27T12:00:00Z').getTime()

        return {
            cluster_id: `cluster_${project.project_id}_${String(i + 1).padStart(3, '0')}`,
            project_id: project.project_id,
            score: seedScore,
            status: (i < 40 ? 'active' : 'inactive') as 'active' | 'inactive',
            updated_at: new Date(baseDate - dateOffset).toISOString(),
        }
    })

    return (
        <div className="space-y-10 pb-12">
            <PageHeader
                title={project.name}
                description={`${project.niche} • ${project.language}`}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                    title="Total de Clusters"
                    value={project.clusters_count}
                    icon={Database}
                    description="Clusters cadastrados"
                />
                <KpiCard
                    title="Clusters Online"
                    value={project.clusters_online}
                    icon={CheckCircle2}
                    trend={{ value: `${Math.round((project.clusters_online / project.clusters_count) * 100)}%`, positive: true }}
                    description="Em produção"
                />
                <KpiCard
                    title="Score Médio"
                    value={`${project.avg_score}%`}
                    icon={Target}
                    trend={{ value: "+2.1%", positive: true }}
                    description="Performance global"
                />
                <KpiCard
                    title="Clusters Gold"
                    value={project.gold_clusters}
                    icon={Award}
                    description="Score ≥ 90"
                />
                <KpiCard
                    title="Jobs Running"
                    value={project.jobs_stats.running}
                    icon={Activity}
                    description="Em execução"
                />
                <KpiCard
                    title="Jobs Failed"
                    value={project.jobs_stats.failed}
                    icon={AlertCircle}
                    description="Com falha"
                />
            </div>

            {/* Shortcuts */}
            <Card className="glass-card border-none p-6">
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest opacity-70">Atalhos Rápidos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link href={`/clusters?project_id=${project.project_id}`}>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                            >
                                <Database className="h-4 w-4" />
                                <span>Ver Clusters</span>
                                <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                        </Link>
                        <Link href={`/jobs?project_id=${project.project_id}`}>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                            >
                                <Activity className="h-4 w-4" />
                                <span>Ver Jobs</span>
                                <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                        </Link>
                        <Link href={`/scores?project_id=${project.project_id}`}>
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20"
                            >
                                <Target className="h-4 w-4" />
                                <span>Ver Scores</span>
                                <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                        </Link>
                        <Link href="/settings">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2 bg-secondary/50 hover:bg-secondary/70"
                            >
                                <span>Configurações</span>
                                <ExternalLink className="h-3 w-3 ml-auto" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>

            {/* Update Cycle Gate */}
            <Card className="glass-card border-none">
                <CardHeader className="border-b border-white/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest opacity-70">
                            Update Cycle Gate
                        </CardTitle>
                        <Badge variant={project.update_cycle.enabled ? "default" : "secondary"}>
                            {project.update_cycle.enabled ? "Ativo" : "Desabilitado"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Status</span>
                            </div>
                            <p className="text-sm font-black">
                                {project.update_cycle.enabled ? "Habilitado" : "Desabilitado"}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                                <Clock className="h-3 w-3" />
                                <span>Warmup</span>
                            </div>
                            <p className="text-sm font-black">{project.update_cycle.warmup_hours}h</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase">
                                <Activity className="h-3 w-3" />
                                <span>Próxima Janela</span>
                            </div>
                            <p className="text-sm font-black">
                                {new Date(project.update_cycle.next_window).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Premium Clusters DataTable */}
            <div className="space-y-6">
                <PremiumDataTable
                    title="Clusters do Projeto"
                    data={projectClusters}
                    searchPlaceholder="Pesquisar cluster..."
                    enableRowSelection={true}
                    enableColumnVisibility={true}
                    enableDateRange={true}
                    enableFilters={true}
                    columns={[
                        {
                            accessorKey: "cluster_id",
                            header: ({ column }) => {
                                return (
                                    <Button
                                        variant="ghost"
                                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                        className="h-8 px-0 font-black hover:bg-transparent"
                                    >
                                        Cluster ID
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                )
                            },
                            cell: ({ row }) => {
                                const cluster = row.original
                                return (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-muted/30 text-muted-foreground">
                                            <Database className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-bold">{cluster.cluster_id}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                Infra ID-{row.index + 1}
                                            </span>
                                        </div>
                                    </div>
                                )
                            },
                        },
                        {
                            accessorKey: "project_id",
                            header: "Projeto",
                            cell: ({ row }) => (
                                <span className="text-sm font-medium">{row.original.project_id}</span>
                            ),
                        },
                        {
                            accessorKey: "score",
                            header: ({ column }) => {
                                return (
                                    <Button
                                        variant="ghost"
                                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                        className="h-8 px-0 font-black hover:bg-transparent"
                                    >
                                        Health Score
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                )
                            },
                            cell: ({ row }) => {
                                const cluster = row.original
                                return (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                            Performance Score
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm font-black ${cluster.score >= 90
                                                    ? "text-emerald-500"
                                                    : cluster.score >= 60
                                                        ? "text-primary"
                                                        : "text-orange-500"
                                                    }`}
                                            >
                                                {cluster.score}%
                                            </span>
                                            <div className="flex-1 max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${cluster.score >= 90
                                                        ? "bg-emerald-500"
                                                        : cluster.score >= 60
                                                            ? "bg-primary"
                                                            : "bg-orange-500"
                                                        }`}
                                                    style={{ width: `${cluster.score}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                        },
                        {
                            accessorKey: "status",
                            header: ({ column }) => {
                                return (
                                    <Button
                                        variant="ghost"
                                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                        className="h-8 px-0 font-black hover:bg-transparent"
                                    >
                                        Status
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                )
                            },
                            cell: ({ row }) => {
                                const cluster = row.original
                                return (
                                    <Badge
                                        variant="outline"
                                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-full ${cluster.status === "active"
                                            ? "border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                            : "border-2 border-muted text-muted-foreground"
                                            }`}
                                    >
                                        {cluster.status === "active" ? "Online" : "Inactive"}
                                    </Badge>
                                )
                            },
                        },
                        {
                            accessorKey: "updated_at",
                            header: ({ column }) => {
                                return (
                                    <Button
                                        variant="ghost"
                                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                                        className="h-8 px-0 font-black hover:bg-transparent"
                                    >
                                        Atualizado
                                        <ArrowUpDown className="ml-2 h-3 w-3" />
                                    </Button>
                                )
                            },
                            cell: ({ row }) => {
                                const cluster = row.original
                                return (
                                    <span className="text-sm text-muted-foreground font-medium">
                                        {new Date(cluster.updated_at).toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                )
                            },
                        },
                        {
                            id: "actions",
                            header: () => <div className="text-center">Ações</div>,
                            cell: ({ row }) => {
                                const cluster = row.original
                                return (
                                    <div className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-primary hover:text-primary hover:bg-primary/10 font-bold text-xs h-8"
                                            asChild
                                        >
                                            <Link href={`/clusters/${cluster.cluster_id}`}>
                                                Gerenciar
                                                <ChevronRight className="ml-1 h-3 w-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                )
                            },
                        },
                    ] as ColumnDef<typeof projectClusters[0]>[]}
                />
            </div>
        </div>
    )
}
