// src/pages/modules/module/table.tsx

import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "./column";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import { moduleApi } from "@/api/moduleApi";
import type { Module, CreateModuleRequest } from "@/types/module";
import { ModuleForm } from "./ModuleForm";
import { useDebounce } from "@uidotdev/usehooks";
import { useGetAllModules } from "./queries";
import { ModuleDetailDialog } from "./DetailDialog";

/* ===================== MAIN ===================== */
export default function ModulesTable() {
    /* ---------- modal & view ---------- */
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [viewingModule, setViewingModule] = useState<Module | null>(null);
    const [deletingModule, setDeletingModule] = useState<Module | null>(null);

    /* ---------- table state ---------- */
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const queryClient = useQueryClient();

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
        refetch: reload,
    } = useGetAllModules({
        page: pageIndex ,
        pageSize,
        sort: sortParam,
        keyword: debouncedSearch,
    });

    const safeTableData = useMemo(
        () => ({
            items: tableData?.items ?? [],
            page: tableData?.pagination?.page ?? pageIndex + 1,
            pageSize: tableData?.pagination?.pageSize ?? pageSize,
            totalPages: tableData?.pagination?.totalPages ?? 0,
            totalElements: tableData?.pagination?.totalElements ?? 0,
        }),
        [tableData, pageIndex, pageSize]
    );


    /* ---------- CRUD ---------- */
    const invalidateModules = async () => {
        await queryClient.invalidateQueries({
            queryKey: ["modules"],
        });
    };
    const handleCreate = async (formData: Partial<Module>) => {
        try {
            await moduleApi.createModule(formData as CreateModuleRequest);
            toast.success("Created successfully");
            setIsFormOpen(false);
            await invalidateModules();
            await reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create module");
        }
    };

    const handleUpdate = async (formData: Partial<Module>) => {
        if (!editingModule?.id) return;
        try {
            await moduleApi.updateModule(editingModule.id, formData);
            toast.success("Updated successfully");
            setIsFormOpen(false);
            await invalidateModules();
            await reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update module");
        }
    };

    const handleDelete = async () => {
        if (!deletingModule) return;
        try {
            await moduleApi.deleteModule(deletingModule.id);
            toast.success("Deleted successfully");
            await invalidateModules();
            await reload();
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete module");
        } finally {
            setDeletingModule(null);
        }
    };

    /* ---------- columns ---------- */
    const columns = useMemo(
        () =>
            getColumns({
                onView: setViewingModule,
                onEdit: (m) => {
                    setEditingModule(m);
                    setIsFormOpen(true);
                },
                onDelete: setDeletingModule,
            }),
        [],
    );

    /* ===================== RENDER ===================== */
    return (
        <div className="relative space-y-4 h-full flex-1">
            <DataTable<Module, unknown>
                columns={columns as ColumnDef<Module, unknown>[]}
                data={safeTableData.items}

                /* Loading states */
                isLoading={isLoading}        // initial load
                isFetching={isFetching}      // background refetch

                /* Pagination (manual) */
                manualPagination
                pageIndex={safeTableData.page - 1} // DataTable dùng index-based
                pageSize={safeTableData.pageSize}
                totalPage={safeTableData.totalPages}
                onPageChange={setPageIndex}
                onPageSizeChange={setPageSize}

                /* Search */
                isSearch
                manualSearch
                searchPlaceholder="module name"
                onSearchChange={setSearchValue}

                /* Sorting */
                sorting={sorting}
                onSortingChange={setSorting}
                manualSorting


                /* Header */
                headerActions={
                    <Button
                        onClick={() => {
                            setEditingModule(null);
                            setIsFormOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Module
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
            <ModuleDetailDialog
                open={!!viewingModule}
                module={viewingModule}
                onClose={() => setViewingModule(null)}
            />

            <ConfirmDialog
                open={!!deletingModule}
                title="Delete Module"
                description={`Are you sure you want to delete "${deletingModule?.title}"?`}
                onCancel={() => setDeletingModule(null)}
                onConfirm={() => void handleDelete()}
            />
        </div>
    );
}
