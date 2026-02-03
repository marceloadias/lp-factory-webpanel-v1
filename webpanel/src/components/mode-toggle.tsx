"use client";

import { Contrast } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";

export function ModeToggle() {
    const { setTheme } = useTheme();
    const [open, setOpen] = React.useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="relative group p-3.5 rounded-[1.75rem] transition-all duration-300 hover:scale-110 hover:-translate-y-2 flex items-center justify-center text-primary bg-primary/10 hover:bg-primary/20 hover:text-primary active:scale-95 outline-none focus-visible:ring-0"
                    onPointerEnter={() => setOpen(true)}
                    onPointerLeave={() => setOpen(false)}
                >
                    <Contrast className="h-7 w-7 stroke-[2.8]" />
                    <span className="sr-only">Alternar tema</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                align="center"
                sideOffset={16}
                className="w-32 p-1.5 rounded-2xl border-none shadow-2xl dark:shadow-black/50 overflow-hidden backdrop-blur-xl outline-none ring-0 focus:ring-0 bg-[hsl(var(--dock-popover-bg))] text-[hsl(var(--dock-popover-foreground))]"
                onPointerEnter={() => setOpen(true)}
                onPointerLeave={() => setOpen(false)}
                onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuItem onClick={() => { setTheme("light"); setOpen(false); }} className="rounded-xl h-9 font-black text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 outline-none ring-0 transition-colors cursor-pointer justify-center gap-2">
                    ☀️ Claro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("dark"); setOpen(false); }} className="rounded-xl h-9 font-black text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 outline-none ring-0 transition-colors cursor-pointer justify-center gap-2">
                    🌙 Escuro
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setTheme("custom"); setOpen(false); }} className="rounded-xl h-9 font-black text-[10px] uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/10 outline-none ring-0 transition-colors cursor-pointer justify-center gap-2">
                    🎨 Editável
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
