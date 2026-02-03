"use client";

import { AlertCircle, Globe2, Monitor, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEngineStatus } from "@/hooks/use-engine-status";

const ENGINE_URL = "http://127.0.0.1:8010";

export function SystemStatusItem({ name, status, icon: Icon }: { name: string, status: string, icon: React.ElementType }) {
    const isOnline = status === 'online';

    return (
        <div className="flex items-center gap-3 py-2 border-b border-border/20 last:border-none">
            <div className={cn(
                "p-1.5 rounded-lg",
                isOnline ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-500 bg-zinc-500/10"
            )}>
                <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground truncate">{name}</span>
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter",
                        isOnline ? "text-emerald-500" : "text-zinc-400"
                    )}>
                        {isOnline ? 'Active' : 'Offline'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export function OfflineWarning() {
    const { isOnline, checkSystem, loading } = useEngineStatus();

    if (isOnline) return null;

    return (
        <div className="mt-8 border border-amber-500/20 bg-amber-500/[0.03] rounded-[2rem] p-6 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                    <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Motor Desconectado</p>
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase">Verifique sua conexão local ou VPN</p>
                </div>
            </div>
            <Button
                variant="default"
                size="sm"
                onClick={checkSystem}
                disabled={loading}
                className="h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 border-none transition-all"
            >
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                Tentar Reconexão
            </Button>
        </div>
    );
}

export function SystemStatus() {
    return <OfflineWarning />;
}
