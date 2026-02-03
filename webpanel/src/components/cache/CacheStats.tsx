"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MousePointer2, Zap, Trash2, Database } from "lucide-react";

export function CacheStats() {
    const stats = [
        {
            title: "Hit Ratio",
            value: "84.2%",
            description: "+2.1% from last hour",
            icon: Zap,
            color: "text-blue-500",
        },
        {
            title: "Total Cached",
            value: "1,248",
            description: "Paths currently in cache",
            icon: Database,
            color: "text-green-500",
        },
        {
            title: "Miss Rate",
            value: "15.8%",
            description: "-0.5% from last hour",
            icon: MousePointer2,
            color: "text-yellow-500",
        },
        {
            title: "Total Purged",
            value: "42",
            description: "Last 24 hours",
            icon: Trash2,
            color: "text-red-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
                <Card key={index} className="bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
