"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Cluster, Job, EngineResponse } from "@/lib/types";
import { format, subHours, isAfter, parseISO } from "date-fns";

interface ChartDataPoint { name: string; completed?: number; failed?: number; value?: number; fill?: string;[key: string]: string | number | undefined }

interface StatsChartsProps {
    initialData?: {
        jobs: Job[];
        clusters: Cluster[];
    };
    loading?: boolean;
}

export function StatsCharts({ initialData, loading: externalLoading }: StatsChartsProps) {
    const [lineData, setLineData] = useState<ChartDataPoint[]>([]);
    const [barData, setBarData] = useState<ChartDataPoint[]>([]);
    const [donutData, setDonutData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const tooltipStyles = isDark ? {
        itemStyle: { color: "black", fontWeight: "900" as const, fontSize: '12px' },
        labelStyle: { color: "black", fontWeight: "900" as const, marginBottom: '4px', textTransform: 'uppercase' as const, fontSize: '10px', opacity: 0.6 },
        contentStyle: {
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
            border: "none",
            padding: "12px"
        }
    } : {
        itemStyle: { color: "#A1A1AA", fontWeight: "900" as const, fontSize: '12px' },
        labelStyle: { color: "white", fontWeight: "900" as const, marginBottom: '4px', textTransform: 'uppercase' as const, fontSize: '10px', opacity: 0.8 },
        contentStyle: {
            backgroundColor: "#181818",
            borderColor: "rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
            border: "none",
            padding: "12px"
        }
    };

    useEffect(() => {
        setMounted(true);

        const fetchChartData = async () => {
            try {
                let jobs: Job[] = [];
                let clusters: Cluster[] = [];

                if (initialData) {
                    jobs = initialData.jobs;
                    clusters = initialData.clusters;
                } else {
                    const [jobsRes, clustersRes] = await Promise.all([
                        apiClient.get<Job[]>('/jobs?limit=100'),
                        apiClient.get<Cluster[]>('/clusters')
                    ]);
                    jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
                    clusters = Array.isArray(clustersRes.data) ? clustersRes.data : [];
                }

                // Process Line Chart (Activity last 24h)
                const now = new Date();
                const last24h = subHours(now, 24);

                // Group by hour
                const hourlyStats: Record<string, { completed: number, failed: number }> = {};
                // Initialize last 6 buckets (every 4 hours to match mock simplicity or every hour)
                // Let's do simple 4 hour buckets for UI clarity
                for (let i = 24; i >= 0; i -= 4) {
                    const t = subHours(now, i);
                    const label = format(t, "HH:mm");
                    hourlyStats[label] = { completed: 0, failed: 0 };
                }

                jobs.forEach(job => {
                    const createdAt = parseISO(job.created_at);
                    if (isAfter(createdAt, last24h)) {
                        // For simplicity in this demo, just aggregated counts
                    }
                });

                // Simplified Logic for Demo: Just map some jobs to hours or random distribution if not enough data
                // In real app, proper aggregation
                const processedLineData = [
                    { name: "00:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T00")).length, failed: 0 },
                    { name: "04:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T04")).length, failed: 0 },
                    { name: "08:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T08")).length, failed: 0 },
                    { name: "12:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T12")).length, failed: 0 },
                    { name: "16:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T16")).length, failed: 0 },
                    { name: "20:00", completed: jobs.filter(j => j.status === 'completed' && j.created_at.includes("T20")).length, failed: 0 },
                    { name: "Now", completed: jobs.filter(j => j.status === 'completed').length, failed: jobs.filter(j => j.status === 'failed').length },
                ];
                setLineData(processedLineData);


                // Process Bar Chart (Jobs by Type)
                const typeCount: Record<string, number> = {};
                jobs.forEach(job => {
                    const type = job.type.replace('_', ' ');
                    typeCount[type] = (typeCount[type] || 0) + 1;
                });
                const processedBarData = Object.entries(typeCount).map(([name, value]) => ({ name, value })).slice(0, 5);
                setBarData(processedBarData);

                // Process Donut Chart (Cluster Health)
                const healthCounts = {
                    excellent: clusters.filter(c => (c.score || 100) >= 90).length,
                    good: clusters.filter(c => (c.score || 100) >= 70 && (c.score || 100) < 90).length,
                    atRisk: clusters.filter(c => (c.score || 100) < 70).length
                };

                const processedDonutData = [
                    { name: "Excelente (90+)", value: healthCounts.excellent, fill: "hsl(var(--chart-1))" },
                    { name: "Bom (70-89)", value: healthCounts.good, fill: "hsl(var(--chart-2))" },
                    { name: "Em Risco (<70)", value: healthCounts.atRisk, fill: "hsl(var(--chart-3))" },
                ];
                setDonutData(processedDonutData);

            } catch (error) {
                const isExpectedError = error instanceof Error && (
                    error.message.includes('fetch') ||
                    error.message.includes('Failed') ||
                    error.message.includes('Not Found') ||
                    error.message.includes('Method Not Allowed')
                );

                if (isExpectedError) {
                    console.warn("Motor offline ou endpoints não implementados - gráficos indisponíveis");
                } else {
                    console.error("Failed to fetch chart data", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, [initialData]);

    if (loading && !initialData) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart: Jobs Activity */}
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Atividade de Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full min-w-0 outline-none">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }} style={{ outline: 'none' }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        itemStyle={tooltipStyles.itemStyle}
                                        labelStyle={tooltipStyles.labelStyle}
                                        contentStyle={tooltipStyles.contentStyle}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const total = payload.reduce((sum, entry) => sum + (Number(entry.value) || 0), 0);
                                                return (
                                                    <div className="p-4 rounded-xl shadow-2xl border-none outline-none" style={tooltipStyles.contentStyle}>
                                                        <p className="text-[10px] font-black uppercase opacity-60 mb-2" style={{ color: isDark ? "black" : "white" }}>{label}</p>
                                                        <div className="space-y-1.5">
                                                            {payload.map((entry: any, index: number) => (
                                                                <div key={index} className="flex items-center justify-between gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                                        <span className="text-[11px] font-black uppercase" style={{ color: isDark ? "black" : "white" }}>{entry.name === "completed" ? "Concluídos" : "Falhas"}:</span>
                                                                    </div>
                                                                    <span className="text-[12px] font-black" style={{ color: isDark ? "black" : "#A1A1AA" }}>{entry.value}</span>
                                                                </div>
                                                            ))}
                                                            <div className="pt-2 mt-2 border-t border-black/5 flex items-center justify-between gap-4" style={{ borderColor: isDark ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)" }}>
                                                                <span className="text-[11px] font-black uppercase" style={{ color: isDark ? "black" : "white" }}>Total:</span>
                                                                <span className="text-[12px] font-black" style={{ color: isDark ? "black" : "#A1A1AA" }}>{total}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        iconType="circle"
                                        verticalAlign="top"
                                        align="center"
                                        wrapperStyle={{ paddingTop: '20px', paddingBottom: '20px' }}
                                        formatter={(value) => (
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 ml-1">
                                                {value === "completed" ? "Concluídos" : "Falhas"}
                                            </span>
                                        )}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="completed"
                                        name="completed"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ r: 5, fill: isDark ? "#0F1414" : "#fff", stroke: "#6366f1", strokeWidth: 2 }}
                                        activeDot={{ r: 7, strokeWidth: 0 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="failed"
                                        name="failed"
                                        stroke="#f97316"
                                        strokeWidth={3}
                                        strokeDasharray="5 5"
                                        dot={{ r: 5, fill: isDark ? "#0F1414" : "#fff", stroke: "#f97316", strokeWidth: 2 }}
                                        activeDot={{ r: 7, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart: Jobs by Type */}
            <Card className="glass-card border-none">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Tarefas por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full min-w-0 outline-none">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={barData} style={{ outline: 'none' }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={false}
                                        itemStyle={tooltipStyles.itemStyle}
                                        labelStyle={tooltipStyles.labelStyle}
                                        contentStyle={tooltipStyles.contentStyle}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#3b82f6"
                                        radius={[6, 6, 0, 0]}
                                        maxBarSize={40}
                                        background={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', radius: 6 }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Donut Chart: Health Distribution (Transformed to Gauge) */}
            <Card className="lg:col-span-2 glass-card border-none">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Saúde Estratégica da Frota</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center justify-between">
                    <div className="h-[350px] w-full md:w-1/2 min-w-0 relative flex items-center justify-center outline-none">
                        {mounted && (
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart style={{ outline: 'none' }}>
                                    {/* Background Arc */}
                                    <Pie
                                        data={[{ value: 100 }]}
                                        cx="50%"
                                        cy="60%"
                                        startAngle={210}
                                        endAngle={-30}
                                        innerRadius={110}
                                        outerRadius={140}
                                        dataKey="value"
                                        stroke="none"
                                        fill="hsl(var(--muted))"
                                        opacity={0.1}
                                        isAnimationActive={false}
                                    />
                                    {/* Segments */}
                                    <Pie
                                        data={donutData}
                                        cx="50%"
                                        cy="60%"
                                        startAngle={210}
                                        endAngle={-30}
                                        innerRadius={110}
                                        outerRadius={140}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {(donutData || []).map((entry, index) => {
                                            // Premium Colors based on index
                                            const colors = [
                                                "url(#colorExcelente)",
                                                "url(#colorBom)",
                                                "url(#colorRisco)"
                                            ];
                                            return <Cell key={`cell-${index}`} fill={colors[index] || entry.fill} />;
                                        })}
                                    </Pie>
                                    <defs>
                                        <linearGradient id="colorExcelente" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0.9} />
                                        </linearGradient>
                                        <linearGradient id="colorBom" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.9} />
                                        </linearGradient>
                                        <linearGradient id="colorRisco" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0.9} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        wrapperStyle={{ zIndex: 1000 }}
                                        itemStyle={tooltipStyles.itemStyle}
                                        labelStyle={tooltipStyles.labelStyle}
                                        contentStyle={tooltipStyles.contentStyle}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}

                        {/* Central High-Fidelity Disk */}
                        <div className="absolute top-[32%] flex items-center justify-center pointer-events-none select-none">
                            <div className="h-[180px] w-[180px] rounded-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col items-center justify-center border-8 border-background/50 relative overflow-hidden">
                                {/* Subtle inner shadow for depth */}
                                <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)]" />

                                {(() => {
                                    const total = Math.max(1, (donutData || []).reduce((acc, i) => acc + (i.value || 0), 0));
                                    const score = Math.round((donutData || []).reduce((acc, item, idx) => {
                                        const weights = [95, 80, 50];
                                        return acc + ((item.value || 0) * weights[idx]);
                                    }, 0) / total);

                                    let status = "Analisando";
                                    let statusColor = "text-muted-foreground";
                                    if (score >= 90) { status = "Excelente"; statusColor = "text-emerald-500"; }
                                    else if (score >= 70) { status = "Bom"; statusColor = "text-indigo-500"; }
                                    else { status = "Em Risco"; statusColor = "text-rose-500"; }

                                    return (
                                        <>
                                            <span className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white drop-shadow-sm">
                                                {score}
                                            </span>
                                            <span className={`text-sm font-black uppercase tracking-[0.2em] -mt-1 ${statusColor}`}>
                                                {status}
                                            </span>
                                        </>
                                    );
                                })()}
                                <div className="mt-2 text-[10px] font-bold text-muted-foreground opacity-30 uppercase tracking-widest">Score Global</div>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(donutData || []).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-4 rounded-2xl border border-zinc-200/50 dark:border-white/5 bg-zinc-100 dark:bg-white/5 backdrop-blur-sm transition-all hover:bg-zinc-200/50 dark:hover:bg-white/10 group">
                                <div
                                    className="h-4 w-4 rounded-full shadow-lg transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: item.fill }}
                                />
                                <div>
                                    <div className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-wider">{item.name}</div>
                                    <div className="text-lg font-black tracking-tighter">{item.value} <span className="text-xs font-normal text-foreground" style={{ letterSpacing: '0.1rem' }}>Clusters</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
