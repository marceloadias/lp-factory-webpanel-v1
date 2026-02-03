import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "success" | "danger" | "neutral" | "info";

export function StatusBadge({
    status,
    className,
    children,
}: {
    status?: Variant;
    className?: string;
    children: React.ReactNode;
}) {
    const base =
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 h-8 shadow-sm text-xs font-semibold";

    const variants: Record<Variant, string> = {
        success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/15",
        danger: "bg-rose-500/10 text-rose-700 border-rose-500/15",
        neutral: "bg-muted/30 text-foreground/80 border-border/15",
        info: "bg-blue-500/10 text-blue-700 border-blue-500/15",
    };

    const v: Variant = status ?? "neutral";

    return <span className={cn(base, variants[v], className)}>{children}</span>;
}
