"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface KpiCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    status?: "success" | "warning" | "danger" | "neutral";
    icon: LucideIcon;
}

export function KpiCard({ label, value, subValue, status = "neutral", icon: Icon }: KpiCardProps) {
    const statusColors = {
        success: "text-emerald-500 bg-emerald-500/10",
        warning: "text-amber-500 bg-amber-500/10",
        danger: "text-rose-500 bg-rose-500/10",
        neutral: "text-primary bg-primary/10",
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="glass-card p-6 border-none overflow-hidden group relative flex flex-col justify-between min-h-[160px]">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all">
                    <Icon className="h-20 w-20" />
                </div>
                <div className="flex flex-col gap-4 relative z-10">
                    <div className={cn("p-3 rounded-2xl w-fit transition-transform group-hover:rotate-6", statusColors[status])}>
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
                        <h3 className="text-4xl font-black mt-1 tracking-tighter">{value}</h3>
                        {subValue && (
                            <p className="text-[11px] font-bold text-muted-foreground/80 mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="h-1 w-1 rounded-full bg-primary" />
                                {subValue}
                            </p>
                        )}
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
