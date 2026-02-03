"use client";

import { useEffect, useState } from "react";
import { appStore, AppState } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MOCK_JOBS, MOCK_CLUSTERS, MOCK_TEMPLATES } from "@/lib/mock/datasets";

export default function UIDebugPage() {
    const [isClient, setIsClient] = useState(false);
    const [storeState, setStoreState] = useState<AppState>({
        mockMode: true,
        baseUrl: "http://localhost:8000",
        apiKey: "",
        selectedProject: "all",
        uiPreferences: {
            sidebarExpanded: true,
            theme: 'light',
            accentColor: '#0057ff'
        },
        isOnline: true,
        providers: [],
        agents: [],
        agentSuggestions: []
    });

    // Counts
    const [mockCounts, setMockCounts] = useState({ jobs: 0, clusters: 0, templates: 0 });

    useEffect(() => {
        setIsClient(true);
        setStoreState(appStore.getState());
        const unsub = appStore.subscribe(setStoreState);

        // Load counts
        setMockCounts({
            jobs: MOCK_JOBS.length,
            clusters: MOCK_CLUSTERS.length,
            templates: MOCK_TEMPLATES.length
        });

        return () => { unsub(); };
    }, []);

    const handleResetStore = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("lp_factory_store");
            window.location.reload();
        }
    };

    const setProject = (proj: string) => {
        appStore.setState({ selectedProject: proj });
    };

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title="UI Debug Mode"
                description="Diagnóstico de componentes de interface e estado global."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* STATUS CARD */}
                <Card className="p-6 space-y-4">
                    <h3 className="font-bold uppercase text-sm text-muted-foreground">System Status</h3>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">Is Client Component:</span>
                        <span className={`font-black uppercase ${isClient ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isClient ? "OK" : "NO"}
                        </span>
                    </div>
                </Card>

                {/* STORE CARD */}
                <Card className="p-6 space-y-4 md:col-span-2">
                    <h3 className="font-bold uppercase text-sm text-muted-foreground">Store State</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                        <div className="flex flex-col">
                            <span className="opacity-50">mockMode</span>
                            <span className="font-bold text-primary">{String(storeState.mockMode)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="opacity-50">selectedProject</span>
                            <span className="font-bold text-primary">{storeState.selectedProject}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="opacity-50">baseUrl</span>
                            <span className="font-bold">{storeState.baseUrl}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="opacity-50">apiKey</span>
                            <span className="font-bold text-foreground overflow-hidden text-ellipsis">
                                {storeState.apiKey || "(empty)"}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* MOCK COUNTS CARD */}
                <Card className="p-6 space-y-4">
                    <h3 className="font-bold uppercase text-sm text-muted-foreground">Mock Counts</h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Jobs</span>
                            <span className="font-bold">{mockCounts.jobs}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Clusters</span>
                            <span className="font-bold">{mockCounts.clusters}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Templates</span>
                            <span className="font-bold">{mockCounts.templates}</span>
                        </div>
                    </div>
                </Card>

                {/* CONTROLS CARD */}
                <Card className="p-6 space-y-4 md:col-span-2">
                    <h3 className="font-bold uppercase text-sm text-muted-foreground">Store Controls</h3>
                    <div className="flex flex-wrap gap-4">
                        <Button variant="destructive" size="sm" onClick={handleResetStore}>
                            Reset Store (Clear & Reload)
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setProject("all")}>
                            Set Project = all
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setProject("proj_demo")}>
                            Set Project = proj_demo
                        </Button>
                    </div>
                </Card>

                {/* SELECT TEST CARD */}
                <Card className="p-6 space-y-4 overflow-visible z-50">
                    <h3 className="font-bold uppercase text-sm text-muted-foreground">Select / Dropdown Test</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <p className="text-xs font-bold opacity-50">SHADCN SELECT (z-50 forced)</p>
                            <Select>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Teste de Select" />
                                </SelectTrigger>
                                <SelectContent className="z-50" position="popper">
                                    <SelectItem value="item1">Item 1</SelectItem>
                                    <SelectItem value="item2">Item 2</SelectItem>
                                    <SelectItem value="item3">Item 3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold opacity-50">DROPDOWN MENU</p>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full">Open Dropdown</Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="z-50 w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Billing</DropdownMenuItem>
                                    <DropdownMenuItem>Team</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
