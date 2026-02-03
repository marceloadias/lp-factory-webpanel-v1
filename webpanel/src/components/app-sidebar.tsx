"use client"

import * as React from "react"
import {
    LayoutDashboard,
    ListTodo,
    Layers,
    FileCode,
    Zap,
    ShieldCheck,
    Settings,
    History,
    Plus,
    Activity,
    Folder,
    Network,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { appStore } from "@/lib/store"
import { I18N } from "@/lib/i18n/pt-BR"

const items = [
    {
        title: I18N.COMMON.DASHBOARD,
        url: "/overview",
        icon: LayoutDashboard,
    },
    {
        title: I18N.COMMON.PROJECTS,
        url: "/projects",
        icon: Folder,
    },
    {
        title: I18N.COMMON.JOBS,
        url: "/jobs",
        icon: ListTodo,
    },
    {
        title: I18N.COMMON.CLUSTERS,
        url: "/clusters",
        icon: Layers,
    },
    {
        title: I18N.COMMON.TEMPLATES,
        url: "/templates",
        icon: FileCode,
    },
    {
        title: "Scores",
        url: "/scores",
        icon: Activity,
    },
    {
        title: I18N.COMMON.CACHE,
        url: "/cache",
        icon: Zap,
    },
    {
        title: I18N.COMMON.AUDIT,
        url: "/admin/audit",
        icon: History,
    },
    {
        title: I18N.COMMON.API_AGENTS,
        url: "/providers",
        icon: ShieldCheck,
    },
    {
        title: I18N.COMMON.AGENTS,
        url: "/agents",
        icon: Plus,
    },
    {
        title: I18N.COMMON.MINDMAP,
        url: "/mindmap",
        icon: Network,
    },
    {
        title: I18N.COMMON.SETTINGS,
        url: "/settings",
        icon: Settings,
    },
]

const MOCK_PROJECTS = [
    { value: "all", label: "Todos os Projetos" },
    { value: "proj_demo", label: "Projeto Demo" },
    { value: "proj_001", label: "Projeto 001" },
    { value: "proj_002", label: "Projeto 002" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { state } = useSidebar()
    const [selectedProject, setSelectedProject] = React.useState<string>("all")

    React.useEffect(() => {
        const currentState = appStore.getState()
        setSelectedProject(currentState.selectedProject || "all")

        const unsub = appStore.subscribe((newState) => {
            setSelectedProject(newState.selectedProject || "all")
        })
        return () => { unsub(); }
    }, [])

    const handleProjectChange = (value: string) => {
        setSelectedProject(value)
        appStore.setState({ selectedProject: value })
    }

    return (
        <Sidebar collapsible="icon" {...props} className="border-r border-border">
            <SidebarHeader className="border-b border-border p-4 space-y-4">
                {state === "expanded" ? (
                    <>
                        <span className="font-bold text-primary tracking-tight text-xl">FACTORY</span>
                        <Select value={selectedProject} onValueChange={handleProjectChange}>
                            <SelectTrigger className="w-full h-10 rounded-xl border-border/50 bg-card/50 hover:bg-card transition-colors">
                                <div className="flex items-center gap-2">
                                    <Folder className="h-4 w-4 text-primary" />
                                    <SelectValue placeholder="Selecione um projeto" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_PROJECTS.map((project) => (
                                    <SelectItem key={project.value} value={project.value}>
                                        {project.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </>
                ) : (
                    <span className="font-bold text-primary text-xl">LP</span>
                )}
            </SidebarHeader>
            <SidebarContent className="py-4">
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === item.url}
                                tooltip={item.title}
                                className="hover:bg-accent hover:text-accent-foreground data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                            >
                                <Link href={item.url}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-xs">
                        JD
                    </div>
                    {state === "expanded" && (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">John Doe</span>
                            <span className="text-xs text-muted-foreground">Admin</span>
                        </div>
                    )}
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
