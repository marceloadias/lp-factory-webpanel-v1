"use client"

import { useState } from "react"
import Link from "next/link"
import { PageHeader } from "@/components/ui/page-header"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MOCK_PROJECTS } from "@/lib/mock/projects"
import { FolderKanban, Globe, Users, Calendar } from "lucide-react"
import { I18N } from "@/lib/i18n/pt-BR"

export default function ProjectsPage() {
    return (
        <div className="space-y-10 pb-12">
            <PageHeader
                title={I18N.COMMON.PROJECTS}
                description="Gerenciamento centralizado de projetos e suas configurações."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PROJECTS.map((project) => (
                    <Link
                        key={project.project_id}
                        href={`/projects/${project.project_id}`}
                        className="block transition-transform hover:scale-[1.02]"
                    >
                        <Card className="glass-card border-border hover:border-primary p-6 transition-all h-full">
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                        <FolderKanban className="h-5 w-5" />
                                    </div>
                                    <Badge variant="secondary" className="text-[9px] font-black uppercase">
                                        {project.language}
                                    </Badge>
                                </div>

                                {/* Title and Niche */}
                                <div className="space-y-1">
                                    <h3 className="text-lg font-black uppercase tracking-tight">{project.name}</h3>
                                    <p className="text-xs text-muted-foreground font-medium">{project.niche}</p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">{I18N.COMMON.CLUSTERS}</p>
                                        <p className="text-sm font-black text-primary">{project.clusters_count}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-bold text-muted-foreground uppercase">Score Médio</p>
                                        <p className="text-sm font-black text-primary">{project.avg_score}%</p>
                                    </div>
                                </div>

                                {/* Domains */}
                                <div className="space-y-2 pt-2">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground font-mono truncate">{project.domains.hub_elp}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-muted-foreground font-mono truncate">{project.domains.lp}</span>
                                    </div>
                                </div>

                                {/* Integrations */}
                                <div className="flex items-center gap-2 flex-wrap pt-2">
                                    {project.integrations.map((integration) => (
                                        <Badge
                                            key={integration}
                                            variant="outline"
                                            className="text-[8px] font-black px-2 py-0.5"
                                        >
                                            {integration}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Last Update */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                                    <Calendar className="h-3 w-3" />
                                    <span className="font-medium">
                                        Atualizado: {new Date(project.last_update).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
