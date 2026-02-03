"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cacheItems } from "@/lib/mock-data";

export function CacheTable() {
    return (
        <div className="rounded-md border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Path</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Last Generated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cacheItems.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.path}</TableCell>
                            <TableCell>{item.cluster}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        item.status === "hit"
                                            ? "success"
                                            : item.status === "stale"
                                                ? "warning"
                                                : "secondary"
                                    }
                                >
                                    {item.status.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell>{item.size}</TableCell>
                            <TableCell className="text-muted-foreground">{item.lastGenerated}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem className="gap-2">
                                            <RefreshCw className="h-4 w-4" />
                                            <span>Invalidate</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                            <span>Purge</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
