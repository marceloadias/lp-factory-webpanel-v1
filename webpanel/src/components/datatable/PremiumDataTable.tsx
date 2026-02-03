"use client";

import * as React from "react";
import { I18N } from "@/lib/i18n/pt-BR";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Settings2,
    Search,
    Filter,
    Calendar as CalendarIcon,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

interface PremiumDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    title: string;
    searchPlaceholder?: string;
    searchColumn?: string;
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    enableFilters?: boolean;
    enableDateRange?: boolean;
    highlightedRowId?: string;
}

export function PremiumDataTable<TData, TValue>({
    columns,
    data,
    title,
    searchPlaceholder = I18N.DATATABLE.SEARCH_PLACEHOLDER,
    searchColumn = "name",
    enableRowSelection = false,
    enableColumnVisibility = true,
    enableFilters = true,
    enableDateRange = true,
    highlightedRowId,
}: PremiumDataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    const allColumns = table.getAllColumns();
    const searchColumnId =
        allColumns.some((column) => column.id === searchColumn)
            ? searchColumn
            : allColumns.find((column) => column.getCanFilter())?.id;

    return (
        <div className="space-y-4">
            {/* TOOLBAR */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
                <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-foreground">
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {enableDateRange && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-9 rounded-full px-4 text-[10px] font-black uppercase border-border/50 bg-background/50 backdrop-blur-sm",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "dd/MM/yy")} - {format(date.to, "dd/MM/yy")}
                                            </>
                                        ) : (
                                            format(date.from, "dd/MM/yy")
                                        )
                                    ) : (
                                        <span>{I18N.DATATABLE.SELECT_PERIOD}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    )}

                    {enableFilters && (
                        <Button
                            variant="default"
                            className="h-9 rounded-full px-6 text-[10px] font-black uppercase bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                        >
                            <Filter className="mr-2 h-3.5 w-3.5" />
                            {I18N.DATATABLE.FILTERS}
                        </Button>
                    )}
                </div>
            </div>

            {/* SEARCH & VISIBILITY */}
            <div className="flex items-center justify-between gap-4 px-1">
                <div className="relative flex-1 max-w-sm group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder={I18N.DATATABLE.SEARCH_PLACEHOLDER}
                        value={
                            searchColumnId
                                ? ((table.getColumn(searchColumnId)?.getFilterValue() as string) ?? "")
                                : ""
                        }
                        onChange={(event) =>
                            searchColumnId &&
                            table.getColumn(searchColumnId)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm premium-search-input pl-10 h-10 rounded-xl"
                        disabled={!searchColumnId}
                    />
                </div>

                <div className="flex items-center gap-2">
                    {enableColumnVisibility && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 rounded-full bg-background/50 border-border/50 backdrop-blur-sm text-[10px] font-black uppercase"
                                >
                                    <Settings2 className="mr-2 h-3.5 w-3.5" />
                                    {I18N.DATATABLE.COLUMNS}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[180px] rounded-xl glass border-white/10 shadow-2xl">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-60 px-3 py-2">
                                    {I18N.DATATABLE.COLUMNS}
                                </DropdownMenuLabel>
                                {table
                                    .getAllColumns()
                                    .filter((column) => column.getCanHide())
                                    .map((column) => {
                                        return (
                                            <DropdownMenuCheckboxItem
                                                key={column.id}
                                                className="capitalize text-[10px] font-black rounded-lg"
                                                checked={column.getIsVisible()}
                                                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                            >
                                                {column.id}
                                            </DropdownMenuCheckboxItem>
                                        );
                                    })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className={cn(
                "rounded-xl border overflow-hidden backdrop-blur-md transition-all duration-300 shadow-large",
                "bg-white border-slate-200", // Light Mode
                "dark:bg-[rgba(255,255,255,0.06)] dark:border-[rgba(255,255,255,0.10)]" // Dark Mode
            )}>
                <div className="relative overflow-x-auto">
                    <Table>
                        <TableHeader className={cn(
                            "sticky top-0 z-10 border-b transition-colors",
                            "bg-[#F4F7F9]/95 border-slate-200", // Light Mode
                            "dark:bg-[#080909]/80 dark:border-[rgba(255,255,255,0.10)] dark:backdrop-blur-md" // Dark Mode
                        )}>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className="h-12 px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className={cn(
                                            "border-b last:border-0 transition-colors group relative",
                                            "border-slate-100 hover:bg-slate-50 data-[state=selected]:bg-blue-50", // Light Mode
                                            "dark:border-[rgba(255,255,255,0.06)] dark:hover:bg-[rgba(255,255,255,0.06)] dark:data-[state=selected]:bg-[rgba(0,90,255,0.14)]", // Dark Mode
                                            // Highlight logic
                                            (highlightedRowId && (row.original as any).id === highlightedRowId) && "bg-primary/5 dark:bg-primary/10 animate-pulse z-10 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3)]"
                                        )}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-8 py-5">
                                                <div className={cn(
                                                    "transition-colors",
                                                    "text-slate-900 group-hover:text-black", // Light Mode
                                                    "dark:text-[rgba(243,251,255,0.92)]" // Dark Mode
                                                )}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center text-muted-foreground font-medium"
                                    >
                                        {I18N.COMMON.NO_DATA}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex-1 text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {I18N.DATATABLE.SELECTED_ROWS(table.getFilteredSelectedRowModel().rows.length)}
                </div>
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            {I18N.DATATABLE.ROWS_PER_PAGE}
                        </p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] rounded-full bg-transparent border-border/50 text-[10px] font-black">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top" className="rounded-xl border-none shadow-2xl">
                                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-[10px] font-black uppercase rounded-lg">
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-xs font-black uppercase tracking-widest text-muted-foreground min-w-[120px] text-center">
                        {I18N.DATATABLE.PAGE_X_OF_Y(table.getState().pagination.pageIndex + 1, table.getPageCount())}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex rounded-full border-border/50"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">{I18N.DATATABLE.FIRST_PAGE}</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full border-border/50"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">{I18N.DATATABLE.PREVIOUS}</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-full border-border/50"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">{I18N.DATATABLE.NEXT}</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex rounded-full border-border/50"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">{I18N.DATATABLE.LAST_PAGE}</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
