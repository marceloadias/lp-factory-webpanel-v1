"use client";

import { Button } from "@/components/ui/button";
import { Plus, List, Database, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEngineStatus } from "@/hooks/use-engine-status";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonProps {
    href: string;
    icon: React.ElementType;
    children: React.ReactNode;
    variant?: "outline" | "default";
    disabled?: boolean;
    tooltip?: string;
    className?: string;
}

const ActionButton = ({ href, icon: Icon, children, variant = "outline", disabled = false, tooltip = "", className }: ActionButtonProps) => {
    const button = (
        <Button
            asChild={!disabled}
            variant={variant}
            disabled={disabled}
            className={cn(
                "gap-2 shadow-sm rounded-full px-6 transition-all duration-300",
                variant === "default" ? "bg-primary hover:bg-primary/90 text-white" : "bg-card hover:bg-accent",
                disabled && "opacity-50 cursor-not-allowed grayscale pointer-events-none",
                className
            )}
        >
            {disabled ? (
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {children}
                </div>
            ) : (
                <Link href={href}>
                    <Icon className="h-4 w-4" />
                    {children}
                </Link>
            )}
        </Button>
    );

    if (!tooltip) return button;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>{button}</div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-rose-500 text-white border-none p-2 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        {tooltip}
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export function QuickActions({ clusterCount = 0, jobCount = 0 }: { clusterCount?: number, jobCount?: number }) {
    const isOnline = useEngineStatus();

    return (
        <div className="flex flex-wrap items-center gap-3">
            <ActionButton
                href="/clusters/new"
                icon={Plus}
                variant={clusterCount === 0 ? "default" : "outline"}
                disabled={!isOnline}
                tooltip={!isOnline ? "Engine offline – impossível executar jobs" : ""}
                className={cn(
                    clusterCount === 0 && "bg-[#0059FF] hover:bg-[#0048d1] shadow-[#0059FF]/20"
                )}
            >
                Criar Cluster
            </ActionButton>

            <ActionButton
                href="/jobs"
                icon={List}
                disabled={!isOnline}
                tooltip={!isOnline ? "Engine offline – impossível executar jobs" : ""}
            >
                Abrir Fila {jobCount > 0 && `(${jobCount})`}
            </ActionButton>

            <ActionButton
                href="/clusters"
                icon={Database}
                variant={clusterCount > 0 ? "default" : "outline"}
            >
                Ver Clusters
            </ActionButton>
        </div>
    );
}
