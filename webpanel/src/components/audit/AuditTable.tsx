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
import { Eye, Clock, User, Package } from "lucide-react";
import { auditLogs } from "@/lib/mock-data";

export function AuditTable() {
    return (
        <div className="rounded-md border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Cluster</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {log.timestamp}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-primary" />
                                    {log.user}
                                </span>
                            </TableCell>
                            <TableCell>
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-semibold">
                                    {log.action}
                                </code>
                            </TableCell>
                            <TableCell>
                                <span className="flex items-center gap-2">
                                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                    {log.cluster}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        log.status === "success"
                                            ? "success"
                                            : log.status === "warning"
                                                ? "warning"
                                                : "destructive"
                                    }
                                >
                                    {log.status.toUpperCase()}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
