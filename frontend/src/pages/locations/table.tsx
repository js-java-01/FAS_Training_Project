import { useMemo, useState, useCallback } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus, Download, Upload, FileText } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "./column";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ui/confirmdialog";

import { locationApi } from "@/api/locationApi";
import type { Location, CreateLocationRequest, UpdateLocationRequest } from "@/types/location";
import { LocationStatus } from "@/types/location";
import { LocationForm } from "./form";
import { useGetAllLocations } from "./queries";
import {
    MapPin,
    Home,
    Hash,
    ToggleLeft,
    Calendar,
} from "lucide-react";
import type { ComponentType, SVGProps, ReactNode } from "react";

/* ===================== DETAIL ROW ===================== */
const DetailRow = ({
    icon: Icon,
    label,
    value,
    isBadge = false,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value?: ReactNode;
    isBadge?: boolean;
}) => (
    <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Icon className="w-4 h-4 text-gray-500" /> {label}
        </label>
        <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 min-h-[42px] flex items-center">
            {isBadge ? (
                value === LocationStatus.ACTIVE ? (
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                ) : (
                    <Badge variant="destructive">Inactive</Badge>
                )
            ) : (
                value || <span className="text-gray-400 italic">No data</span>
            )}
        </div>
    </div>
);

/* ===================== MAIN ===================== */
export default function LocationsTable() {
    /* ---------- modal & view ---------- */
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [viewingLocation, setViewingLocation] = useState<Location | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

    /* ---------- import/export ---------- */
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    /* ---------- table state ---------- */
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    /* ---------- search ---------- */
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 300);

    /* ---------- sort param (server side) ---------- */
    const sortParam = useMemo(() => {
        if (!sorting.length) return "createdAt,desc";
        const { id, desc } = sorting[0];
        return `${id},${desc ? "desc" : "asc"}`;
    }, [sorting]);

    /* ---------- query ---------- */
    const {
        data: tableData,
        isLoading,
        isFetching,
        refetch,
    } = useGetAllLocations({
        page: pageIndex,
        pageSize,
        sort: sortParam,
        keyword: debouncedSearch,
        status: "",
    });

    const safeTableData = useMemo(
        () => ({
            items: tableData?.items ?? [],
            page: tableData?.pagination?.page ?? pageIndex,
            pageSize: tableData?.pagination?.pageSize ?? pageSize,
            totalPages: tableData?.pagination?.totalPages ?? 0,
            totalElements: tableData?.pagination?.totalElements ?? 0,
        }),
        [tableData, pageIndex, pageSize]
    );

    /* ---------- CRUD ---------- */
    const handleCreate = async (formData: CreateLocationRequest | UpdateLocationRequest) => {
        try {
            await locationApi.createLocation(formData as CreateLocationRequest);
            toast.success("Location created successfully");
            setIsFormOpen(false);
            await refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create location");
        }
    };

    const handleUpdate = async (formData: CreateLocationRequest | UpdateLocationRequest) => {
        if (!editingLocation?.id) return;
        try {
            await locationApi.updateLocation(editingLocation.id, formData as UpdateLocationRequest);
            toast.success("Location updated successfully");
            setIsFormOpen(false);
            setEditingLocation(null);
            await refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update location");
        }
    };

    const handleDelete = useCallback(
        async () => {
            if (!deletingLocation) return;
            try {
                await locationApi.deleteLocation(deletingLocation.id);
                toast.success("Location deleted successfully");
                setDeletingLocation(null);
                await refetch();
            } catch (error: any) {
                toast.error(error.response?.data?.message || "Failed to delete location");
            }
        },
        [deletingLocation, refetch]
    );

    /* ---------- import/export ---------- */
    const handleExport = async (format: 'csv' | 'xlsx') => {
        try {
            const blob = await locationApi.exportLocations(format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `locations.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(`Locations exported as ${format.toUpperCase()}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to export locations");
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const blob = await locationApi.downloadLocationImportTemplate();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'location_import_template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success("Template downloaded successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to download template");
        }
    };

    const handleImport = async () => {
        if (!importFile) {
            toast.error("Please select a file");
            return;
        }

        try {
            setIsImporting(true);
            const result = await locationApi.importLocations(importFile);
            
            if (result.errors && result.errors.length > 0) {
                toast.warning(
                    `Import completed with ${result.success} success and ${result.errors.length} errors`
                );
            } else {
                toast.success(`Successfully imported ${result.success} locations`);
            }

            setIsImportOpen(false);
            setImportFile(null);
            await refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to import locations");
        } finally {
            setIsImporting(false);
        }
    };

    /* ---------- columns ---------- */
    const columns = useMemo(
        () =>
            getColumns({
                onView: setViewingLocation,
                onEdit: (location) => {
                    setEditingLocation(location);
                    setIsFormOpen(true);
                },
                onDelete: setDeletingLocation,
            }),
        []
    );

    /* ===================== RENDER ===================== */
    return (
        <>
            <DataTable<Location, unknown>
                columns={columns as ColumnDef<Location, unknown>[]}
                data={safeTableData.items}

                /* Loading states */
                isLoading={isLoading}
                isFetching={isFetching}

                /* Pagination (manual) */
                manualPagination
                pageIndex={safeTableData.page}
                pageSize={safeTableData.pageSize}
                totalPage={safeTableData.totalPages}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}

                /* Search */
                isSearch
                manualSearch
                searchPlaceholder="Search locations..."
                onSearchChange={setSearchValue}

                /* Sorting */
                sorting={sorting}
                onSortingChange={setSorting}
                manualSorting

                /* Header */
                headerActions={
                    <div className="flex gap-2">
                        {/* Export Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-300"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                                    Export as Excel (.xlsx)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('csv')}>
                                    Export as CSV (.csv)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Import Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300"
                            onClick={() => setIsImportOpen(true)}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>

                        {/* Add New Button */}
                        <Button
                            size="sm"
                            className="bg-blue-600 text-white hover:bg-blue-700"
                            onClick={() => {
                                setEditingLocation(null);
                                setIsFormOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New
                        </Button>
                    </div>
                }
            />

            {/* ===== Create / Update ===== */}
            <LocationForm
                open={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setEditingLocation(null);
                }}
                onSubmit={editingLocation ? handleUpdate : handleCreate}
                initialData={editingLocation}
            />

            {/* ===== Delete Confirmation ===== */}
            <ConfirmDialog
                open={!!deletingLocation}
                title="Delete Location"
                description={`Are you sure you want to delete "${deletingLocation?.name}"?`}
                onCancel={() => setDeletingLocation(null)}
                onConfirm={handleDelete}
            />

            {/* ===== View detail ===== */}
            <Dialog open={!!viewingLocation} onOpenChange={() => setViewingLocation(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Location Details
                        </DialogTitle>
                        <DialogDescription>
                            {viewingLocation?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <DetailRow icon={Hash} label="ID" value={viewingLocation?.id} />
                        <DetailRow icon={MapPin} label="Location Name" value={viewingLocation?.name} />
                        <DetailRow icon={Home} label="Address" value={viewingLocation?.address} />
                        <DetailRow icon={MapPin} label="Province" value={viewingLocation?.provinceName} />
                        <DetailRow icon={MapPin} label="Commune" value={viewingLocation?.communeName} />
                        <DetailRow icon={ToggleLeft} label="Status" value={viewingLocation?.status} isBadge />
                        <DetailRow 
                            icon={Calendar} 
                            label="Created At" 
                            value={viewingLocation?.createdAt ? new Date(viewingLocation.createdAt).toLocaleString() : "-"} 
                        />
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setViewingLocation(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ===== Import Modal ===== */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Import Locations</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file to import locations
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDownloadTemplate}
                                className="w-full"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="import-file"
                            />
                            <label
                                htmlFor="import-file"
                                className="cursor-pointer flex flex-col items-center gap-2"
                            >
                                <Upload className="h-8 w-8 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    {importFile ? importFile.name : "Click to select file"}
                                </span>
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsImportOpen(false);
                                setImportFile(null);
                            }}
                            disabled={isImporting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleImport}
                            disabled={!importFile || isImporting}
                        >
                            {isImporting ? "Importing..." : "Import"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
