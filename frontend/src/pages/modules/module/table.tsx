// src/pages/modules/module/table.tsx

import { useMemo, useState, useCallback } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

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

import { moduleApi } from "@/api/moduleApi";
import type { Module, CreateModuleRequest } from "@/types/module";
import { ModuleForm } from "./ModuleForm";
import { iconMap } from "@/constants/iconMap";
import { useDebounce } from "@uidotdev/usehooks";
import { useGetAllModules } from "./queries";

import {
    FileCode,
    Link as LinkIcon,
    ToggleLeft,
    Layers,
    FileText,
    Fingerprint,
    Hash,
} from "lucide-react";
import type { ComponentType, SVGProps, ReactNode } from "react";
import {queryClient} from "@/main.tsx";

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
                value ? (
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
export default function ModulesTable() {
    /* ---------- modal & view ---------- */
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [viewingModule, setViewingModule] = useState<Module | null>(null);

    /* ---------- table state ---------- */
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    /* ---------- search ---------- */
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 300);

    /* ---------- sort param (server side) ---------- */
    const sortParam = useMemo(() => {
        if (!sorting.length) return "displayOrder,asc";
        const { id, desc } = sorting[0];
        return `${id},${desc ? "desc" : "asc"}`;
    }, [sorting]);

    /* ---------- query ---------- */
    const {
        data: tableData,
        isLoading,
        isFetching,
        refetch,
    } = useGetAllModules({
        page: pageIndex ,
        pageSize,
        sort: sortParam,
        keyword: debouncedSearch,
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
    const invalidateModuleGroups = async () => {
        await queryClient.invalidateQueries({
            queryKey: ["module-groups"],
        });
    };
    const handleCreate = async (formData: Partial<Module>) => {
        await moduleApi.createModule(formData as CreateModuleRequest);
        setIsFormOpen(false);
        await refetch();
        await invalidateModuleGroups();
    };

    const handleUpdate = async (formData: Partial<Module>) => {
        if (!editingModule?.id) return;
        await moduleApi.updateModule(editingModule.id, formData);
        setIsFormOpen(false);
        await refetch();
        await invalidateModuleGroups();
    };

    const handleDelete = useCallback(
        async (module: Module) => {
            if (!confirm(`Delete "${module.title}"?`)) return;
            await moduleApi.deleteModule(module.id);
            await refetch();
            await invalidateModuleGroups();
        },
        [refetch],
    );

    /* ---------- columns ---------- */
    const columns = useMemo(
        () =>
            getColumns({
                onView: setViewingModule,
                onEdit: (m) => {
                    setEditingModule(m);
                    setIsFormOpen(true);
                },
                onDelete: handleDelete,
            }),
        [handleDelete],
    );

    const IconComponent =
        viewingModule?.icon && viewingModule.icon in iconMap
            ? iconMap[viewingModule.icon as keyof typeof iconMap]
            : FileCode;

    /* ===================== RENDER ===================== */
    return (
        <>
            <DataTable<Module, unknown>
                columns={columns as ColumnDef<Module, unknown>[]}
                data={safeTableData.items}

                /* Loading states */
                isLoading={isLoading}        // initial load
                isFetching={isFetching}      // background refetch

                /* Pagination (manual) */
                manualPagination
                pageIndex={safeTableData.page} // DataTable dùng index-based
                pageSize={safeTableData.pageSize}
                totalPage={safeTableData.totalPages}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}

                /* Search */
                isSearch
                manualSearch
                searchPlaceholder="module group name"
                onSearchChange={setSearchValue}

                /* Sorting */
                sorting={sorting}
                onSortingChange={setSorting}
                manualSorting


                /* Header */
                headerActions={
                    <Button
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => {
                            setEditingModule(null);
                            setIsFormOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New
                    </Button>
                }
            />

            {/* ===== Create / Update ===== */}
            <ModuleForm
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={editingModule ? handleUpdate : handleCreate}
                initialData={editingModule}
            />

            {/* ===== View detail ===== */}
            <Dialog open={!!viewingModule} onOpenChange={() => setViewingModule(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5" />
                            Module Details
                        </DialogTitle>
                        <DialogDescription>
                            {viewingModule?.title}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <DetailRow icon={Hash} label="ID" value={viewingModule?.id} />
                        <DetailRow icon={FileText} label="Description" value={viewingModule?.description} />
                        <DetailRow icon={LinkIcon} label="URL" value={viewingModule?.url} />
                        <DetailRow icon={Fingerprint} label="Permission" value={viewingModule?.requiredPermission} />
                        <DetailRow icon={Layers} label="Display Order" value={viewingModule?.displayOrder} />
                        <DetailRow icon={ToggleLeft} label="Status" value={viewingModule?.isActive} isBadge />
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setViewingModule(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
