import { LucideIcon, Search } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    title,
    description,
    icon: Icon = Search,
    actionLabel,
    onAction
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-card/30 rounded-3xl border-2 border-dashed border-muted-foreground/10 animate-in fade-in zoom-in duration-500">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Icon className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mt-2 mb-6 leading-relaxed">
                {description}
            </p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="rounded-full px-8 shadow-lg shadow-primary/20">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
