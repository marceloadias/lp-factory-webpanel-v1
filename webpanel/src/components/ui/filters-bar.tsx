"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    showFilterButton?: boolean;
    onFilterClick?: () => void;
    activeFiltersCount?: number;
    className?: string;
    children?: React.ReactNode;
}

export function FiltersBar({
    search,
    onSearchChange,
    placeholder = "Buscar...",
    showFilterButton = true,
    onFilterClick,
    activeFiltersCount = 0,
    className,
    children
}: FiltersBarProps) {
    return (
        <div className={cn(
            "flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/40 p-6 rounded-3xl border-2 border-dashed border-border/5",
            className
        )}>
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                <Input
                    placeholder={placeholder}
                    className="bg-white/50 border-white/5 pl-9 pr-9 rounded-full h-10 transition-all focus:ring-primary/20"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                {search && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                {children}
                {showFilterButton && (
                    <Button
                        variant="outline"
                        className="rounded-full gap-2 relative bg-card/50"
                        onClick={onFilterClick}
                    >
                        <Filter className="h-4 w-4" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
