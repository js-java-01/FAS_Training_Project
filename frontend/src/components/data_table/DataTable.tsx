import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useMemo } from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type ColumnFiltersState,
    type PaginationState,
    type VisibilityState,
    type SortingState,
    type ColumnDef,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Search,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Loader,
} from "lucide-react";
import "animate.css";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationEllipsis,
} from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    isLoading?: boolean;
    isFetching?: boolean;
    // PAGINATION
    pageIndex?: number;
    pageSize?: number;
    totalPage?: number;
    onPageChange?: (pageIndex: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    manualPagination?: boolean;
    // SEARCH
    isSearch?: boolean;
    manualSearch?: boolean;
    searchValue?: string[];
    searchPlaceholder?: string;
    onSearchChange?: (search: string) => void;
    //SORTED
    sorting?: SortingState;
    onSortingChange?: (sorting: SortingState) => void;
    manualSorting?: boolean;
    // ACTION
    headerActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    isFetching,
    //PAGINATION
    pageIndex,
    pageSize,
    totalPage,
    onPageChange,
    onPageSizeChange,
    manualPagination = false,
    //SEARCH
    isSearch = false,
    searchValue = [],
    searchPlaceholder,
    onSearchChange,
    manualSearch = false,
    //SORTED
    sorting,
    onSortingChange,
    manualSorting = false,
    // ACTION
    headerActions,
}: DataTableProps<TData, TValue>) {
    /** ------------------ SEARCH DATA ------------------ */
    const [searchText, setSearchText] = useState("");
    const filteredData = useMemo(() => {
        if (manualSearch) return data; // if manualSearch is true, return data as is
        if (!searchText) return data; // if searchText is empty, return data as is

        // if searchText is not empty, filter data
        // searchText is string[]
        // example: searchText = ["firstName", "lastName"]
        return data.filter((item) =>
            searchValue.some((key) =>
                String(item[key as keyof TData] ?? "")
                    .toLowerCase()
                    .includes(searchText.toLowerCase()),
            ),
        );
    }, [data, searchText, manualSearch, searchValue]);

    /** ------------------ AUTO RESIZE PAGESIZE based on the container height ------------------ */
    // Create a ref to access the table container DOM element
    const tableContainerRef = useRef<HTMLDivElement>(null);

    // Run after layout to measure the container element
    // Only auto-resize when NOT using manual pagination
    useLayoutEffect(() => {
        // Skip auto-resize when manual pagination is enabled
        if (manualPagination) return;

        // Get the table container element
        const el = tableContainerRef.current;
        if (!el) return;

        // MIN_ROWS of table
        const MIN_ROWS = 5;
        const rowHeight = 48;
        const headerHeight = 48;
        // Observe changes in the container size
        const observer = new ResizeObserver(() => {
            const containerHeight = el.clientHeight;
            const usableHeight = containerHeight - headerHeight;
            const newSize = Math.max(
                1,
                Math.floor(usableHeight / rowHeight),
                MIN_ROWS,
            );
            // Update pagination state with new page size
            setPagination((prev) => {
                if (prev.pageSize === newSize) return prev; // prevent re-render loop
                return { ...prev, pageSize: newSize };
            });
            if (onPageSizeChange) onPageSizeChange(newSize);
        });

        observer.observe(el);
        // Cleanup: stop observing when the component unmounts to prevent memory leaks
        return () => observer.disconnect();
    }, [onPageSizeChange, manualPagination]);

    /** ------------------ PAGINATION, FILTER, SELECTION, VISIBILITY STATE ------------------ */
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: pageIndex ?? 0,
        pageSize: pageSize ?? 10,
    });

    // Synchronize pagination state with props when manualPagination is enabled
    useEffect(() => {
        if (manualPagination) {
            setPagination({
                pageIndex: pageIndex ?? 0,
                pageSize: pageSize ?? 10,
            });
        }
    }, [manualPagination, pageIndex, pageSize]);

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

    /** ------------------ REACT TABLE ------------------ */
    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            columnFilters,
            rowSelection,
            pagination,
            columnVisibility,
            sorting,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        enableColumnResizing: true,
        columnResizeMode: "onChange",
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: manualPagination,
        pageCount: totalPage, // when using manualPagination
        // Handle pagination change - manualPagination = false
        onPaginationChange: (updater) => {
            const next =
                typeof updater === "function" ? updater(pagination) : updater;
            setPagination(next);
            if (onPageChange) onPageChange(next.pageIndex);
            if (onPageSizeChange) onPageSizeChange(next.pageSize);
            if (onSearchChange) onSearchChange(searchText);
        },
        // Handle sorting change - manualSorting = false
        ...(manualSorting ? {} : { getSortedRowModel: getSortedRowModel() }),
        manualSorting: manualSorting,
        onSortingChange: (updaterOrValue) => {
            if (!onSortingChange) return;

            if (typeof updaterOrValue === "function") {
                onSortingChange(updaterOrValue(sorting ?? []));
            } else {
                onSortingChange(updaterOrValue);
            }
        },
    });

    // Search handler: update, reset page
    const handleSearchInput = (value: string) => {
        setSearchText(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        if (onSearchChange) onSearchChange(value);
    };

    /* ---------- PAGINATION UI ---------- */
    const { pages, showLeftEllipsis, showRightEllipsis } =
        usePagination({
            currentPage: table.getState().pagination.pageIndex + 1,
            totalPages: table.getPageCount(),
            paginationItemsToDisplay: 5,
        });

    return (
        <div className="grid gap-4 h-full font-inter grid-rows-[auto_1fr_auto]">
            {/* --- TABLE ACTIONS --- */}
            <div className="grid lg:grid-cols-[1fr_auto] grid-cols-1 items-center gap-2 w-full">
                {/* Left: search */}
                {isSearch && (
                    <div className="relative w-full lg:w-[420px]">
                        <Search
                            size={16}
                            className="absolute text-gray-500 top-[10px] left-2"
                        />
                        <Input
                            placeholder={`Search by ${searchPlaceholder}...`}
                            value={searchText}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="pl-8 w-full"
                        />
                    </div>
                )}

                {/* Right: header actions + columns */}
                <div className="flex flex-col lg:flex-row justify-end items-center gap-2">
                    {headerActions}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full !outline-none lg:w-28"
                            >
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.columnDef.meta?.title ?? column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* --- TABLE --- */}
            <div
                className=" h-full rounded-md border flex flex-col overflow-x-auto w-full table-auto"
                ref={tableContainerRef}
            >
                <Table>
                    {/*--- HEADER ---*/}
                    <TableHeader className="bg-background z-10 sticky top-0 shadow-xs">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            style={{ position: "relative", width: header.getSize() }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                            {header.column.getCanResize() && (
                                                <div
                                                    onMouseDown={header.getResizeHandler()}
                                                    onTouchStart={header.getResizeHandler()}
                                                    className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                                                ></div>
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>

                    {/*--- BODY ---*/}
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="w-full odd:bg-accent even:bg-background"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : isLoading || isFetching ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24">
                                    <Loader className="animate-spin text-gray-500 mx-auto" />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* --- ROWS SELECTED ---*/}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* LEFT: selected rows */}
                {table.getAllColumns().some((col) => col.id === "select") && (
                    <div className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {table.getSelectedRowModel().rows.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {table.getFilteredRowModel().rows.length}
                        </span>{" "}
                        rows selected
                    </div>
                )}

                {/* RIGHT: pagination */}
                <div className="flex flex-col items-end gap-5 sm:flex-row sm:items-center">
                    {/* Page info */}
                    <div
                        className="text-sm text-muted-foreground whitespace-nowrap"
                        aria-live="polite"
                    >
                        Page{" "}
                        <span className="font-medium text-foreground">
                            {table.getState().pagination.pageIndex + 1}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium text-foreground">
                            {table.getPageCount()}
                        </span>
                    </div>

                    {/* Pagination buttons */}
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    <ChevronLeft />
                                </Button>
                            </PaginationItem>

                            {showLeftEllipsis && <PaginationEllipsis />}

                            {pages.map((p) => (
                                <PaginationItem key={p}>
                                    <Button
                                        size="icon"
                                        variant={
                                            p === table.getState().pagination.pageIndex + 1
                                                ? "outline"
                                                : "ghost"
                                        }
                                        onClick={() => table.setPageIndex(p - 1)}
                                    >
                                        {p}
                                    </Button>
                                </PaginationItem>
                            ))}

                            {showRightEllipsis && <PaginationEllipsis />}

                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    <ChevronRight />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

        </div>
    );
}