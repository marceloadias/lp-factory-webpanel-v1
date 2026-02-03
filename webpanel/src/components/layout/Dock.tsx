"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ListTodo,
    Layers,
    FileCode,
    Zap,
    ShieldCheck,
    History,
    Settings,
    Sparkles,
    ChevronDown,
    ChevronUp,
    Network,
    Folder,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { AssistantWindow } from "./AssistantWindow"
import { ModeToggle } from "@/components/mode-toggle"
import { I18N } from "@/lib/i18n/pt-BR"

const dockItems = [
    { title: I18N.COMMON.DASHBOARD, url: "/overview", icon: LayoutDashboard },
    { title: I18N.COMMON.PROJECTS, url: "/projects", icon: Folder },
    { title: I18N.COMMON.JOBS, url: "/jobs", icon: ListTodo },
    { title: I18N.COMMON.CLUSTERS, url: "/clusters", icon: Layers },
    { title: I18N.COMMON.TEMPLATES, url: "/templates", icon: FileCode },
    { title: I18N.COMMON.CACHE, url: "/cache", icon: Zap },
    { title: I18N.COMMON.API_AGENTS, url: "/providers", icon: ShieldCheck },
    { title: I18N.COMMON.AUDIT, url: "/admin/audit", icon: History },
    { title: I18N.COMMON.MINDMAP, url: "/mindmap", icon: Network },
]

export function Dock() {
    const pathname = usePathname()
    const [isAssistantOpen, setIsAssistantOpen] = React.useState(false)
    const [isHidden, setIsHidden] = React.useState(false)

    return (
        <TooltipProvider delayDuration={0}>
            <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-4">
                <nav className={cn(
                    "bg-[hsl(var(--dock-bg))] backdrop-blur-xl rounded-[2.5rem] flex items-center transition-all duration-500 ease-in-out shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/10 dark:border-black/5",
                    isHidden ? "p-1" : "p-2 gap-1.5"
                )}>
                    {!isHidden && (
                        <>
                            {dockItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.url || (item.url === "/overview" && pathname === "/")

                                return (
                                    <Tooltip key={item.url}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.url}
                                                className={cn(
                                                    "relative group p-3.5 rounded-[1.75rem] transition-all duration-300 hover:scale-110 hover:-translate-y-2 flex items-center justify-center",
                                                    isActive
                                                        ? "bg-primary text-white shadow-lg shadow-primary/40 active:scale-95"
                                                        : "text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-zinc-950 hover:bg-white/10 dark:hover:bg-black/5 active:scale-90"
                                                )}
                                            >
                                                <Icon className="h-6 w-6" />
                                                {isActive && (
                                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
                                                )}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-[hsl(var(--dock-tooltip-bg))] text-[hsl(var(--dock-tooltip-foreground))] border-white/10 mb-4 py-2 px-3 rounded-xl shadow-2xl">
                                            <p className="text-xs font-semibold">{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}


                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => setIsAssistantOpen(true)}
                                        className={cn(
                                            "relative group p-3.5 rounded-[1.75rem] transition-all duration-300 hover:scale-110 hover:-translate-y-2 flex items-center justify-center",
                                            isAssistantOpen
                                                ? "bg-primary text-white shadow-lg shadow-primary/40"
                                                : "text-primary hover:text-primary/80 hover:bg-primary/10"
                                        )}
                                    >
                                        <Sparkles className={cn("h-6 w-6", !isAssistantOpen && "animate-pulse")} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-[hsl(var(--dock-tooltip-bg))] text-[hsl(var(--dock-tooltip-foreground))] border-white/10 mb-4 py-2 px-3 rounded-xl shadow-2xl">
                                    <p className="text-xs font-semibold">IA Assistant</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/settings"
                                        className={cn(
                                            "relative group p-3.5 rounded-[1.75rem] transition-all duration-300 hover:scale-110 hover:-translate-y-2 flex items-center justify-center",
                                            pathname === "/settings"
                                                ? "bg-primary text-white shadow-lg shadow-primary/40"
                                                : "text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-zinc-950 hover:bg-white/10 dark:hover:bg-black/5"
                                        )}
                                    >
                                        <Settings className="h-6 w-6" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-[hsl(var(--dock-tooltip-bg))] text-[hsl(var(--dock-tooltip-foreground))] border-white/10 mb-4 py-2 px-3 rounded-xl shadow-2xl">
                                    <p className="text-xs font-semibold">{I18N.COMMON.SETTINGS}</p>
                                </TooltipContent>
                            </Tooltip>


                            <ModeToggle />
                        </>
                    )}

                    <button
                        onClick={() => setIsHidden(!isHidden)}
                        className={cn(
                            "p-3.5 transition-all duration-300 hover:scale-110 flex items-center justify-center",
                            isHidden
                                ? "bg-primary text-white rounded-full shadow-lg shadow-primary/40"
                                : "rounded-[1.75rem] text-zinc-400 dark:text-zinc-500 hover:text-white dark:hover:text-zinc-950 hover:bg-white/10 dark:hover:bg-black/5"
                        )}
                    >
                        {isHidden ? (
                            <ChevronUp className="h-6 w-6" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                </nav>
            </div>

            <AssistantWindow open={isAssistantOpen} onOpenChange={setIsAssistantOpen} />
        </TooltipProvider >
    )
}
