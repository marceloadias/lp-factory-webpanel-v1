"use client";

import * as React from "react";
import { useEngineStatus } from "@/hooks/use-engine-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Settings, LogOut, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { I18N } from "@/lib/i18n/pt-BR"

function GreetingWithDate() {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const formattedDate = currentTime.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).toLowerCase();

    const greeting = getGreeting();

    return (
        <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-muted-foreground capitalize">
                <span className="text-primary font-bold">{greeting}</span>
                <span> • {formattedDate}</span>
            </span>
        </div>
    );
}

export function AppTopbar() {
    const engineOnline = useEngineStatus();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = React.useState("");

    const handleSearch = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 w-full bg-[hsl(var(--header)/0.8)] backdrop-blur-xl shadow-lg transition-all border-none">
            <div className="h-20 w-full max-w-[1920px] mx-auto flex items-center justify-between px-4 md:px-8 lg:px-12 xl:px-16">
                <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform">
                            LP
                        </div>
                        <span className="font-bold text-xl tracking-tighter uppercase hidden md:block">FACTORY</span>
                    </Link>
                </div>

                {/* Greeting and Date - Center */}
                <div className="hidden lg:flex flex-col items-center justify-center flex-1">
                    <GreetingWithDate />
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    {/* Search Bar - Hidden on mobile */}
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            type="search"
                            placeholder={I18N.COMMON.SEARCH}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="w-[400px] pl-10 bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary h-11 rounded-2xl transition-all"
                        />
                    </div>

                    {/* Create Cluster Button */}
                    <Button asChild size="lg" className="hidden md:flex gap-2 h-11 bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md shadow-emerald-600/20 rounded-2xl px-6 font-bold uppercase tracking-tighter text-xs transition-all hover:scale-[1.02] active:scale-95">
                        <Link href="/clusters/new">
                            <Plus className="h-5 w-5" />
                            {I18N.CLUSTERS.CREATE}
                        </Link>
                    </Button>

                    <div className="flex items-center gap-3">
                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-11 min-w-[44px] rounded-2xl flex items-center gap-2 p-1 hover:bg-muted/50">
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            JD
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:flex flex-col items-start pr-2">
                                        <span className="text-sm font-bold leading-none">John Doe</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-0.5">Admin</span>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-64 p-2 rounded-2xl glass border-white/10 shadow-2xl" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal p-3">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-bold">{I18N.COMMON.PROFILE}</p>
                                        <p className="text-xs text-muted-foreground">
                                            user@lpfactory.com
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild className="rounded-xl h-10 focus:bg-primary/10 transition-colors">
                                    <Link href="/settings">
                                        <User className="mr-2 h-4 w-4 text-primary" />
                                        <span className="font-medium">{I18N.COMMON.PROFILE}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="rounded-xl h-10 focus:bg-primary/10 transition-colors">
                                    <Link href="/settings">
                                        <Settings className="mr-2 h-4 w-4 text-primary" />
                                        <span className="font-medium">{I18N.COMMON.SETTINGS}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem className="text-rose-500 rounded-xl h-10 focus:bg-rose-500/10 focus:text-rose-500 transition-colors">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span className="font-bold">{I18N.COMMON.LOGOUT}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        </header>
    );
}
