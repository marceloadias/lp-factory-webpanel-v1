"use client"

import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination"

export interface DataTableColumn<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T, index: number) => React.ReactNode
    className?: string
    sortable?: boolean
}

export interface DataTableProps<T> {
    data: T[]
    columns: DataTableColumn<T>[]
    searchPlaceholder?: string
    searchKeys?: (keyof T)[]
    pageSize?: number
    className?: string
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    searchPlaceholder = "Pesquisar...",
    searchKeys = [],
    pageSize = 10,
    className = "",
}: DataTableProps<T>) {
    const [search, setSearch] = React.useState("")
    const [currentPage, setCurrentPage] = React.useState(1)
    const [sortKey, setSortKey] = React.useState<keyof T | null>(null)
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")

    // Filter data based on search
    const filteredData = React.useMemo(() => {
        if (!search || searchKeys.length === 0) return data

        const searchLower = search.toLowerCase()
        return data.filter((item) =>
            searchKeys.some((key) => {
                const value = item[key]
                if (value == null) return false
                return String(value).toLowerCase().includes(searchLower)
            })
        )
    }, [data, search, searchKeys])

    // Sort data
    const sortedData = React.useMemo(() => {
        if (!sortKey) return filteredData

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortKey]
            const bVal = b[sortKey]

            if (aVal == null) return 1
            if (bVal == null) return -1

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
            return sortDirection === "asc" ? comparison : -comparison
        })
    }, [filteredData, sortKey, sortDirection])

    // Paginate data
    const totalPages = Math.ceil(sortedData.length / pageSize)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    )

    // Reset to page 1 when search changes
    React.useEffect(() => {
        setCurrentPage(1)
    }, [search])

    const handleSort = (key: keyof T) => {
        if (sortKey === key) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
        } else {
            setSortKey(key)
            setSortDirection("asc")
        }
    }

    // Generate page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = []
        const showEllipsis = totalPages > 7

        if (!showEllipsis) {
            return Array.from({ length: totalPages }, (_, i) => i + 1)
        }

        // Always show first page
        pages.push(1)

        if (currentPage > 3) {
            pages.push('ellipsis')
        }

        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i)
        }

        if (currentPage < totalPages - 2) {
            pages.push('ellipsis')
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className={className}>
            {/* Search Bar */}
            {searchKeys.length > 0 && (
                <div className="px-6 py-4 border-b border-border/10">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-muted/30 border-border/20 h-10"
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <Table className="lp-table">
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-none">
                        {columns.map((column, idx) => (
                            <TableHead
                                key={idx}
                                className={`px-6 py-3 text-xs font-semibold text-muted-foreground/70 ${column.sortable ? "cursor-pointer select-none hover:text-foreground/80" : ""
                                    } ${column.className || ""}`}
                                onClick={() => {
                                    if (column.sortable && column.accessorKey) {
                                        handleSort(column.accessorKey)
                                    }
                                }}
                            >
                                <div className="flex items-center gap-2">
                                    {column.header}
                                    {column.sortable && (
                                        <span className={column.accessorKey === sortKey ? "text-primary" : "text-muted-foreground/50"}>
                                            {column.accessorKey === sortKey ? (
                                                sortDirection === "asc" ? (
                                                    <ArrowUp className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDown className="h-3 w-3" />
                                                )
                                            ) : (
                                                <ArrowUpDown className="h-3 w-3" />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell
                                colSpan={columns.length}
                                className="text-center py-12 text-muted-foreground"
                            >
                                Nenhum resultado encontrado
                            </TableCell>
                        </TableRow>
                    ) : (
                        paginatedData.map((item, idx) => (
                            <TableRow key={idx} className="group">
                                {columns.map((column, colIdx) => (
                                    <TableCell
                                        key={colIdx}
                                        className={`px-6 py-6 ${column.className || ""}`}
                                    >
                                        {column.cell
                                            ? column.cell(item, (currentPage - 1) * pageSize + idx)
                                            : column.accessorKey
                                                ? String(item[column.accessorKey] ?? "")
                                                : ""}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/10">
                    <div className="text-sm text-muted-foreground">
                        Mostrando {(currentPage - 1) * pageSize + 1} a{" "}
                        {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length}{" "}
                        resultados
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    aria-disabled={currentPage === 1}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            {getPageNumbers().map((page, idx) =>
                                page === 'ellipsis' ? (
                                    <PaginationItem key={`ellipsis-${idx}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                ) : (
                                    <PaginationItem key={page}>
                                        <PaginationLink
                                            onClick={() => setCurrentPage(page)}
                                            isActive={currentPage === page}
                                            className="cursor-pointer"
                                        >
                                            {page}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    aria-disabled={currentPage === totalPages}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
