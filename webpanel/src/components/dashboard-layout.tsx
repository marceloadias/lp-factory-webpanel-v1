"use client"

import { AppTopbar } from "@/components/app-topbar"
import { Dock } from "@/components/layout/Dock"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen w-full relative bg-background transition-colors duration-500">
            <AppTopbar />
            <main className="flex-1 overflow-y-auto pb-32 pt-8 w-full max-w-[1920px] mx-auto 
                px-4 
                md:px-8 
                lg:px-12 
                xl:px-16">
                {children}
            </main>
            <Dock />
        </div>
    )
}
