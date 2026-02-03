import { CacheStats } from "@/components/cache/CacheStats";
import { CacheTable } from "@/components/cache/CacheTable";
import { Button } from "@/components/ui/button";
import { Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CachePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Page Cache</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage CDN and Edge cache for all clusters.
                    </p>
                </div>
                <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Purge Global Cache
                </Button>
            </div>

            {/* Stats */}
            <CacheStats />

            {/* Table Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Filter by path or cluster..." className="pl-10" />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none">All Clusters</Button>
                        <Button variant="outline" className="flex-1 md:flex-none">Status: Hit</Button>
                    </div>
                </div>

                <CacheTable />
            </div>
        </div>
    );
}
