"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";
import { appStore } from "@/lib/store";
import { Template } from "@/lib/types";
import { I18N } from "@/lib/i18n/pt-BR";
import {
    Layout,
    Loader2,
    ChevronRight,
    ArrowUpDown,
    Eye,
    Code,
    ImageIcon,
    ExternalLink,
    X,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumDataTable } from "@/components/datatable/PremiumDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [mockMode, setMockMode] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // View Structure State
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    // Preview Modal State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<Template[]>("/templates");
            setTemplates(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const state = appStore.getState();
        setMockMode(state.mockMode);

        const unsub = appStore.subscribe((newState) => {
            setMockMode(newState.mockMode);
        });

        setIsClient(true);
        fetchTemplates();

        return () => { unsub(); };
    }, []);

    // Refresh when mockMode changes
    useEffect(() => {
        if (isClient) fetchTemplates();
    }, [mockMode, isClient]);

    const handleViewStructure = (template: Template) => {
        setSelectedTemplate(template);
        setIsSheetOpen(true);
    };

    const handleOpenPreview = (template: Template) => {
        setPreviewTemplate(template);
        setIsPreviewOpen(true);
    };

    const columns: ColumnDef<Template>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px] border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    {I18N.COMMON.NAME}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-card border border-border/5 text-muted-foreground">
                        <Layout className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-foreground uppercase">
                        {row.original.name}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "id",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    {I18N.COMMON.ID}
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-[10px] font-mono opacity-40 uppercase">
                    {row.original.id}
                </span>
            ),
        },
        {
            accessorKey: "version",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    Versão
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] px-2 py-0 border-none font-bold">
                    v{row.original.version}
                </Badge>
            ),
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-8 px-0 font-black hover:bg-transparent text-[10px] uppercase tracking-widest"
                >
                    Tipo
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
            ),
            cell: ({ row }) => (
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                    {row.original.type.replace('_', ' ')}
                </span>
            ),
        },
        {
            accessorKey: "preview",
            header: () => <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Preview</div>,
            cell: ({ row }) => {
                const template = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {template.preview ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenPreview(template)}
                                className="h-auto p-0 text-[10px] font-bold text-primary hover:underline hover:bg-transparent flex items-center gap-1"
                            >
                                <ImageIcon className="h-3 w-3" />
                                Sim
                            </Button>
                        ) : (
                            <span className="text-[10px] opacity-20 font-bold uppercase">Não</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{I18N.COMMON.ACTIONS}</div>,
            cell: ({ row }) => (
                <div className="text-center">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full gap-2 text-primary hover:bg-primary/10 transition-all font-black uppercase text-[10px] tracking-tight"
                        onClick={() => handleViewStructure(row.original)}
                    >
                        {I18N.TEMPLATES.VIEW_STRUCTURE}
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                title={I18N.TEMPLATES.TITLE}
                description={I18N.TEMPLATES.SUBTITLE}
            >
                <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${mockMode ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'} border border-current/10`}>
                            {mockMode ? `MODO: ${I18N.COMMON.MOCK_MODE}` : `MODO: ${I18N.COMMON.REAL_MODE}`}
                        </span>
                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full border border-border/50">
                            <Layout className="h-3.5 w-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                {templates.length} Designs
                            </span>
                        </div>
                    </div>
                </div>
            </PageHeader>

            {loading && templates.length === 0 ? (
                <div className="flex justify-center p-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : templates.length === 0 ? (
                <div className="p-20">
                    <EmptyState
                        title={I18N.TEMPLATES.EMPTY_STATE}
                        description="Tente ajustar sua busca ou verifique o status do Engine."
                        icon={Layout}
                    />
                </div>
            ) : (
                <PremiumDataTable
                    title="Biblioteca de Templates"
                    data={templates}
                    columns={columns}
                    searchPlaceholder={I18N.DATATABLE.SEARCH_PLACEHOLDER}
                    enableRowSelection={true}
                    enableColumnVisibility={true}
                    enableDateRange={false}
                    enableFilters={false}
                />
            )}

            {/* Structure Viewer Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[700px] w-full border-l border-border/50 bg-card/95 backdrop-blur-xl flex flex-col p-0">
                    <SheetHeader className="p-8 border-b border-border/40">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Code className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-black uppercase tracking-tighter">
                                    {I18N.TEMPLATES.VIEW_STRUCTURE}
                                </SheetTitle>
                                <SheetDescription className="text-[11px] font-bold uppercase tracking-widest opacity-60">
                                    {selectedTemplate?.name} • v{selectedTemplate?.version}
                                </SheetDescription>
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/50 mt-4 leading-relaxed">
                            {I18N.TEMPLATES.STRUCTURE_DESC}
                        </p>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* Preview Image in Sheet */}
                        {selectedTemplate?.preview && (
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                    <Eye className="h-3.5 w-3.5" />
                                    Visualização do Modelo Base
                                </label>
                                <div className="relative aspect-video rounded-3xl overflow-hidden border border-border/50 shadow-2xl group cursor-pointer" onClick={() => handleOpenPreview(selectedTemplate)}>
                                    <img
                                        src={selectedTemplate.preview}
                                        alt={selectedTemplate.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                            <Eye className="h-6 w-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Slots Content */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                                <Code className="h-3.5 w-3.5" />
                                {I18N.TEMPLATES.STRUCTURE_TITLE}
                            </label>

                            <div className="flex flex-wrap gap-2">
                                {(((selectedTemplate as any)?.slots || (selectedTemplate as any)?.structure) ? (
                                    ((selectedTemplate as any)?.slots || (selectedTemplate as any)?.structure).split(',').map((slot: string) => (
                                        <Badge key={slot} variant="outline" className="rounded-lg bg-primary/5 text-primary border-primary/20 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                                            {slot.trim()}
                                        </Badge>
                                    ))
                                ) : (
                                    <div className="w-full space-y-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                                            {I18N.TEMPLATES.STRUCTURE_PLACEHOLDER}:
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {I18N.TEMPLATES.DEFAULT_SLOTS.map((slot: string) => (
                                                <Badge key={slot} variant="outline" className="rounded-lg bg-muted border-border/50 text-muted-foreground/60 px-3 py-1 font-black uppercase text-[10px] tracking-widest">
                                                    {slot}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mt-4 leading-relaxed">
                                {I18N.TEMPLATES.SLOTS_LEGEND}
                            </p>

                            <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap min-h-[150px] shadow-inner text-foreground/80">
                                {selectedTemplate?.content || "Payload bruto de estrutura não disponível para este modelo base."}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="sm:max-w-[700px] md:max-w-4xl lg:max-w-5xl max-h-[90vh] flex flex-col rounded-[2rem] border-none bg-card/95 backdrop-blur-2xl p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-8 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                                    {previewTemplate?.name}
                                </DialogTitle>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                                    {I18N.TEMPLATES.PREVIEW_TITLE} • v{previewTemplate?.version}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border/50 shadow-inner bg-card">
                            {previewTemplate?.preview && (
                                <img
                                    src={previewTemplate.preview}
                                    alt={previewTemplate.name}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    </div>

                    <DialogFooter className="p-8 border-t border-border/40 bg-muted/30 flex sm:justify-between items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-left flex-1">
                            {previewTemplate?.type.replace('_', ' ')}
                        </p>
                        <div className="flex items-center gap-3">
                            {previewTemplate?.preview && (
                                <Button
                                    variant="outline"
                                    asChild
                                    className="rounded-full font-black uppercase text-[10px] h-10 px-6 border-border/50"
                                >
                                    <a href={previewTemplate.preview} target="_blank" rel="noopener noreferrer" className="gap-2">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        {I18N.TEMPLATES.OPEN_NEW_TAB}
                                    </a>
                                </Button>
                            )}
                            <Button
                                onClick={() => setIsPreviewOpen(false)}
                                className="rounded-full font-black uppercase text-[10px] h-10 px-8 shadow-xl shadow-primary/20"
                            >
                                {I18N.COMMON.CLOSE}
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
