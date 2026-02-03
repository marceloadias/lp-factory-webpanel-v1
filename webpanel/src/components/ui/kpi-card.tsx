"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: string;
        positive: boolean;
    };
    className?: string;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

export function KpiCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    variant = 'default'
}: KpiCardProps) {
    const variants = {
        default: "bg-card text-card-foreground",
        primary: "bg-primary text-primary-foreground",
        success: "bg-emerald-500 text-white",
        warning: "bg-amber-500 text-white",
        danger: "bg-rose-500 text-white"
    };

    return (
        <Card className={cn(
            "p-6 border-none shadow-xl rounded-3xl overflow-hidden relative group transition-all duration-300 hover:-translate-y-1",
            variants[variant],
            className
        )}>
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
                <Icon className="h-24 w-24" />
            </div>

            <div className="flex flex-col gap-1 relative z-10">
                <p className="text-xs font-semibold text-muted-foreground/70">
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-black tracking-tighter leading-none">{value}</h3>
                    {trend && (
                        <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-md",
                            trend.positive ? "bg-emerald-400/20 text-emerald-400" : "bg-rose-400/20 text-rose-400"
                        )}>
                            {trend.value}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs font-medium text-muted-foreground/60 mt-2">
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
}
