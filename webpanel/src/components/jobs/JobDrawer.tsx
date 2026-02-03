"use client";

import { useEffect, useState, useRef } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Job } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/ui/status-badge";
import { Terminal, WifiOff, Loader2, Database, Box, Calendar, AlertTriangle, Fingerprint, Layout } from "lucide-react";
import { appStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { I18N } from "@/lib/i18n/pt-BR";
import { cn } from "@/lib/utils";

interface JobDrawerProps {
    job: Job | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function JobDrawer({ job, open, onOpenChange }: JobDrawerProps) {
    const [detailedJob, setDetailedJob] = useState<Job | null>(null);
    const [detailsError, setDetailsError] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [streamError, setStreamError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initial sync and details fetching
    useEffect(() => {
        if (!job || !open) {
            setDetailedJob(null);
            setDetailsError(false);
            setFetchingDetails(false);
            setLogs([]);
            setStreamError(false);
            if (abortControllerRef.current) abortControllerRef.current.abort();
            return;
        }

        // Set initial data from props
        setDetailedJob(job);

        // Fetch full details from Engine
        const fetchFullDetails = async () => {
            setFetchingDetails(true);
            setDetailsError(false);
            try {
                const res = await apiClient.getJob(job.id);
                if (res.success && res.data) {
                    setDetailedJob(res.data);
                } else {
                    setDetailsError(true);
                }
            } catch (err) {
                console.error("Failed to fetch job details:", err);
                setDetailsError(true);
            } finally {
                setFetchingDetails(false);
            }
        };

        fetchFullDetails();

        const { mockMode, baseUrl, apiKey } = appStore.getState();

        // MOCK MODE: Simulation
        if (mockMode) {
            setLogs([
                `[${new Date().toISOString()}] Inicializando tarefa ${job.id} (SIMULAÇÃO)...`,
                `[${new Date().toISOString()}] ID do Projeto: ${job.project_id}`,
                `[${new Date().toISOString()}] ID do Cluster: ${job.cluster_id}`,
                `[${new Date().toISOString()}] Buscando configuração...`,
                `[${new Date().toISOString()}] Concluído.`
            ]);

            if (job.status === 'running') {
                const interval = setInterval(() => {
                    const newLog = `[${new Date().toISOString()}] Processando chunk ${Math.floor(Math.random() * 1000)}...`;
                    setLogs(prev => [...prev.slice(-49), newLog]);
                }, 2000);
                return () => clearInterval(interval);
            } else if (job.status === 'completed') {
                setLogs(prev => [...prev, `[${new Date().toISOString()}] Tarefa concluída com sucesso.`]);
            } else if (job.status === 'failed') {
                setLogs(prev => [...prev, `[${new Date().toISOString()}] Tarefa falhou: ${job.error || 'Erro desconhecido'}`]);
            }
            return;
        }

        // REAL MODE: SSE / Stream via Fetch
        let active = true;
        setStreamError(false);

        const isStreamingState = job.status === 'running' || job.status === 'processing';

        if (!isStreamingState) {
            const statusMsg = job.status === 'pending' || job.status === 'queued'
                ? "Aguardando na fila para processamento..."
                : `Tarefa finalizada com estado: ${job.status}`;
            setLogs(prev => [...prev, `[SISTEMA] ${statusMsg}`]);
            return;
        }

        setLogs(prev => [...prev.slice(-199), `[${new Date().toLocaleTimeString()}] Conectando ao stream de logs em ${baseUrl}...`]);

        const connectStream = async () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch(`${baseUrl}/jobs/${job.id}/stream`, {
                    headers: { 'X-API-KEY': apiKey },
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`Falha na conexão (${response.status})`);
                if (!response.body) throw new Error("Corpo do stream não disponível");

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (active) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(Boolean);

                    lines.forEach(line => {
                        let content = line;
                        if (line.startsWith('data: ')) content = line.slice(6);
                        const timestamp = new Date().toLocaleTimeString();
                        setLogs(prev => [...prev.slice(-199), `[${timestamp}] ${content}`]);
                    });
                }
            } catch (error: any) {
                if (error.name === 'AbortError') return;
                console.error("Stream error:", error);
                if (active) {
                    setStreamError(true);
                    setLogs(prev => [...prev.slice(-199), `[SISTEMA] Erro no stream: ${error.message}`]);
                }
            }
        };

        connectStream();

        return () => {
            active = false;
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };

    }, [job, open, retryCount]);

    const handleRetryStream = () => setRetryCount(prev => prev + 1);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [logs]);

    if (!job) return null;

    // Helper for rendering data fields
    const InfoField = ({ icon: Icon, label, value, className }: any) => (
        <div className={cn("space-y-1.5", className)}>
            <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest flex items-center gap-1.5">
                <Icon className="h-3 w-3" />
                {label}
            </p>
            <p className="text-[11px] font-bold text-foreground truncate">{value || "—"}</p>
        </div>
    );

    const displayJob = detailedJob || job;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl border-l border-border bg-card text-card-foreground p-0 overflow-hidden flex flex-col">
                <SheetHeader className="p-8 border-b border-border bg-muted/50 relative">
                    {fetchingDetails && (
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/20 overflow-hidden">
                            <div className="h-full bg-primary animate-progress-dash w-1/3" />
                        </div>
                    )}
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">{I18N.JOBS.DETAILS_TITLE}</p>
                            <SheetTitle className="text-2xl font-black tracking-tighter uppercase mt-2">
                                {displayJob.type.replace(/_/g, ' ')}
                            </SheetTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Fingerprint className="h-3 w-3 opacity-30 text-primary" />
                                <p className="text-[10px] font-mono opacity-40 uppercase tracking-tighter">{displayJob.id}</p>
                            </div>
                        </div>
                        <StatusBadge status={
                            displayJob.status === 'completed' ? 'success' :
                                displayJob.status === 'failed' ? 'danger' :
                                    displayJob.status === 'running' || displayJob.status === 'processing' ? 'info' : 'neutral'
                        }>
                            {displayJob.status === 'running' || displayJob.status === 'processing' ? I18N.STATUS.PROCESSING :
                                displayJob.status === 'completed' ? I18N.STATUS.COMPLETED :
                                    displayJob.status === 'failed' ? I18N.STATUS.FAILED :
                                        displayJob.status === 'pending' || displayJob.status === 'queued' ? "EM FILA" : displayJob.status}
                        </StatusBadge>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="p-8 space-y-10">
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 gap-y-6 gap-x-8 bg-muted/20 p-6 rounded-2xl border border-border/5">
                            <InfoField icon={Database} label="Projeto" value={displayJob.project_id} />
                            <InfoField icon={Box} label="Cluster" value={displayJob.cluster_id} />
                            <InfoField icon={Calendar} label="Criado em" value={displayJob.created_at ? new Date(displayJob.created_at).toLocaleString('pt-BR') : "—"} />
                            <InfoField icon={Layout} label="Fluxo" value={displayJob.type.split('_')[0]} />

                            {detailsError && !fetchingDetails && (
                                <div className="col-span-2 flex items-center gap-2 mt-2 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight">Detalhes adicionais indisponíveis no Engine</p>
                                </div>
                            )}
                        </div>

                        {/* Progress */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
                                <span>Progresso da Operação</span>
                                <span className="text-foreground">{displayJob.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/5">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(0,87,255,0.5)]"
                                    style={{ width: `${displayJob.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Error Handling (if any) */}
                        {displayJob.error && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Erro Reportado</span>
                                </div>
                                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl text-[11px] font-bold text-rose-500/80 font-mono">
                                    {displayJob.error}
                                </div>
                            </div>
                        )}

                        {/* Payload (JSON) */}
                        {displayJob.payload && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <Terminal className="h-3 w-3" />
                                    <span>Payload da Requisição</span>
                                </div>
                                <div className="bg-black/5 dark:bg-black/40 rounded-xl border border-border p-4">
                                    <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto">
                                        {JSON.stringify(displayJob.payload, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Logs Terminal */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Terminal className="h-3 w-3" />
                                    <span>{I18N.JOBS.LOGS}</span>
                                </div>
                                {displayJob.status === 'running' && (
                                    <span className="flex items-center gap-1.5 text-[8px] text-primary animate-pulse">
                                        <span className="h-1 w-1 rounded-full bg-primary" />
                                        LIVE
                                    </span>
                                )}
                            </div>
                            <div className="bg-[#0D0D0D] rounded-2xl border border-white/5 font-mono text-[11px] h-[300px] flex flex-col overflow-hidden shadow-2xl">
                                <ScrollArea className="flex-1 p-5" ref={scrollRef}>
                                    <div className="space-y-1.5 pr-4">
                                        {logs.length === 0 && !streamError && displayJob.status === 'running' && (
                                            <div className="flex items-center gap-2 text-muted-foreground/30 italic">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Iniciando recepção de logs...
                                            </div>
                                        )}
                                        {logs.map((log, i) => (
                                            <div key={i} className="text-muted-foreground leading-relaxed break-all">
                                                <span className="text-primary/40 font-black mr-2">/</span> {log}
                                            </div>
                                        ))}
                                        {streamError && (
                                            <div className="flex items-center gap-4 mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                                <WifiOff className="h-4 w-4 text-rose-500" />
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-rose-500 uppercase">Stream Indisponível</p>
                                                    <p className="text-[10px] text-rose-200/60 leading-tight">Não foi possível conectar ao log em tempo real.</p>
                                                </div>
                                                <Button size="sm" variant="outline" className="h-8 text-[10px] border-rose-500/30 hover:bg-rose-500/20 text-rose-500 font-bold uppercase" onClick={handleRetryStream}>
                                                    Retry
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <div className="p-8 bg-muted/50 border-t border-border flex gap-4">
                    <Button className="flex-1 rounded-full font-black uppercase tracking-widest text-[11px] h-12 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" onClick={() => onOpenChange(false)}>
                        {I18N.COMMON.CLOSE}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
