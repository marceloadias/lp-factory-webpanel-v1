import { cn } from "@/lib/utils";

interface ScoreBarProps {
    value: number;
    className?: string;
    showLabel?: boolean;
}

export function ScoreBar({ value, className, showLabel = true }: ScoreBarProps) {
    const getScoreColor = (v: number) => {
        if (v >= 90) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
        if (v >= 70) return "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]";
        if (v >= 50) return "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]";
        return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
    };

    const getScoreTextColor = (v: number) => {
        if (v >= 90) return "text-emerald-500";
        if (v >= 70) return "text-blue-500";
        if (v >= 50) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className={cn("space-y-2 w-full", className)}>
            {(showLabel || true) && (
                <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-semibold text-muted-foreground/70">Performance score</span>
                    <span className={cn("text-xs font-black", getScoreTextColor(value))}>{value}%</span>
                </div>
            )}
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/5">
                <div
                    className={cn("h-full rounded-full transition-all duration-1000", getScoreColor(value))}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}
