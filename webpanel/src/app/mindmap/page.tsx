"use client"

import React, { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Globe, Layers, Activity, Cpu, Zap, History, LineChart,
    Sparkles, Lightbulb, FlaskConical, Shield, Database, Award
} from "lucide-react"
import {
    SYSTEM_TREE, LIBRARY_TREE,
    SYSTEM_SECTIONS, LIBRARY_SECTIONS
} from "@/lib/mindmap/lp-factory-mindmap"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const iconMap: any = {
    Globe,
    Layers,
    Activity,
    Cpu,
    Zap,
    History,
    LineChart,
    Sparkles,
    Lightbulb,
    FlaskConical,
    Shield,
    Database,
    Award
}

export default function MindMapPage() {
    const [activeTab, setActiveTab] = useState("system")

    const currentTree = activeTab === "system" ? SYSTEM_TREE : LIBRARY_TREE
    const currentSections = activeTab === "system" ? SYSTEM_SECTIONS : LIBRARY_SECTIONS

    return (
        <div className="space-y-10 pb-12">
            <PageHeader
                title="Mapa Mental"
                description="Árvore estrutural e fluxos lógicos do ecossistema LP Factory."
            />

            <Tabs defaultValue="system" onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/50 border border-white/20 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="system" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        Estrutura do Sistema
                    </TabsTrigger>
                    <TabsTrigger value="library" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all font-black uppercase text-[10px] tracking-widest">
                        Biblioteca Oficial
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-10 mt-0 outline-none">
                    {/* Tree View Section */}
                    <Card className="border-none overflow-hidden shadow-xl rounded-3xl">
                        <CardHeader className="border-b border-blue-100 bg-white">
                            <div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-[#181818]">
                                    {activeTab === "system" ? "Árvore do Sistema" : "Árvore da Biblioteca"}
                                </CardTitle>
                                <p className="text-xs text-[#181818]/50 mt-1 font-medium">
                                    {activeTab === "system"
                                        ? "Arquitetura detalhada do ecossistema LP Factory."
                                        : "Glossário e especificações técnicas da biblioteca oficial."}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="bg-white p-6 md:p-12 font-mono text-sm leading-relaxed overflow-x-auto">
                                <pre className="text-[#181818] whitespace-pre">
                                    {currentTree.split('\n').map((line, i) => {
                                        // Match main headers
                                        if (line.trim() === 'LP FACTORY' || line.trim() === '📚 BIBLIOTECA LP FACTORY') {
                                            return (
                                                <div key={i} className="mb-4">
                                                    <span className="font-bold text-[#181818] tracking-tight text-xl">{line}</span>
                                                </div>
                                            );
                                        }

                                        // Only main titles start with ├─ or └─ at the very beginning
                                        const isRootTitle = /^[├└]─\s+\d\)/.test(line);

                                        if (isRootTitle) {
                                            const match = line.match(/^([├└]─\s+)(\d\).*)$/);
                                            if (match) {
                                                return (
                                                    <div key={i}>
                                                        <span>{match[1]}</span>
                                                        <span className="text-blue-600 font-black">{match[2]}</span>
                                                    </div>
                                                );
                                            }
                                        }
                                        return <div key={i}>{line}</div>;
                                    })}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Cards Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-1 w-1 rounded-full bg-blue-600" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/60">Resumo por Seção</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {currentSections.map((section, idx) => {
                                const Icon = iconMap[section.icon] || Globe
                                return (
                                    <Card key={idx} className="bg-white border border-transparent hover:border-blue-500 hover:shadow-lg transition-all p-6 group rounded-2xl shadow-sm">
                                        <div className="space-y-4">
                                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 w-fit group-hover:scale-110 transition-transform">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xs font-black uppercase tracking-wider text-[#181818]">{section.title}</h3>
                                                <p className="text-xs text-[#181818] leading-relaxed font-medium">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
