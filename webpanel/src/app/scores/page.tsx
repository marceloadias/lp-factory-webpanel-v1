"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import {
    TrendingUp,
    ShieldCheck,
    Target
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from "@/components/ui/badge";

export default function ScoresPage() {
    const [scoreHistory, setScoreHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const res = await apiClient.get<any[]>('/scores');
                setScoreHistory(res.data || []);
            } catch (error) {
                console.error("Failed to fetch scores", error);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, []);

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="Centro de Performance"
                description="Histórico de saúde e métricas estratégicas global."
            >
                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${apiClient.isMock() ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {apiClient.isMock() ? "DATA: MOCK" : "DATA: REAL (Dev Test)"}
                    </span>
                    <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-6 py-2 gap-2 font-black uppercase text-[10px]">
                        <ShieldCheck className="h-4 w-4" />
                        Auditoria em conformidade
                    </Badge>
                </div>
            </PageHeader>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-3 glass-card border-none p-10 backdrop-blur-3xl rounded-3xl">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Evolução de Performance</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-black opacity-40 mt-1">Média global dos últimos 7 dias operacionais</p>
                        </div>
                        <div className="p-4 bg-primary/5 rounded-2xl">
                            <Target className="h-8 w-8 text-primary opacity-40" />
                        </div>
                    </div>

                    <div className="h-[400px] w-full min-w-0 outline-none">
                        {loading ? (
                            <div className="h-full w-full flex items-center justify-center">
                                <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-50">Carregando dados...</span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={scoreHistory} style={{ outline: 'none' }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0057FF" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#0057FF" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.1} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                        className="font-black uppercase opacity-40"
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        domain={[0, 100]}
                                        className="font-black opacity-40"
                                    />
                                    <Tooltip
                                        itemStyle={{
                                            color: isDark ? "black" : "#A1A1AA",
                                            fontWeight: "900",
                                            fontSize: '11px',
                                            textTransform: 'uppercase'
                                        }}
                                        labelStyle={{
                                            color: isDark ? "black" : "white",
                                            fontWeight: "900",
                                            marginBottom: '4px',
                                            opacity: 0.6,
                                            fontSize: '10px'
                                        }}
                                        contentStyle={{
                                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.95)' : '#181818',
                                            borderRadius: '12px',
                                            border: 'none',
                                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                                            padding: '12px',
                                            backdropFilter: isDark ? 'blur(4px)' : 'none'
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#0057FF"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorScore)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <div className="space-y-8">
                    <Card className="glass-card border-none p-8 bg-gradient-to-br from-primary to-blue-700 text-white rounded-3xl shadow-large relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp className="h-32 w-32" />
                        </div>
                        <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-2 relative z-10">Média Global</p>
                        <h4 className="text-5xl font-black tracking-tighter relative z-10">96.4%</h4>
                        <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase bg-white/20 w-fit px-3 py-1.5 rounded-full relative z-10">
                            <TrendingUp className="h-4 w-4" />
                            +2.4% vs semana anterior
                        </div>
                    </Card>

                    <Card className="glass-card border-none p-8 rounded-3xl backdrop-blur-3xl">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">Top Performers</h4>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase group-hover:text-primary transition-colors">PROD-CLUSTER-0{i}</span>
                                        <span className="text-[9px] opacity-30 uppercase font-black">Cluster ID: #{i + 8200}</span>
                                    </div>
                                    <div className="h-10 w-10 rounded-full border border-primary/10 flex items-center justify-center font-black text-xs text-primary bg-primary/5 group-hover:bg-primary group-hover:text-white transition-all">
                                        9{9 - i}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
