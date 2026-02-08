import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import type { ModuleGroup } from "@/types/module";
import { moduleGroupApi } from "@/api/moduleApi";
import { useGetAllModuleGroups } from "@/pages/modules/module_groups/queries";

import { getColumns } from "./column";
import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import { ModuleGroupDetailDialog } from "./DetailDialog";

/* ======================================================= */

export default function ModuleGroupsTable() {
  /* ===================== STATE ===================== */
  const [sorting, setSorting] = useState<SortingState>([]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
  const [deleting, setDeleting] = useState<ModuleGroup | null>(null);
  const [viewingGroup, setViewingGroup] = useState<ModuleGroup | null>(null);

  const queryClient = useQueryClient();

  /* ===================== SORT ===================== */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "displayOrder,asc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ===================== DATA ===================== */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllModuleGroups({
    page: pageIndex,
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

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(
      () =>
          getColumns({
            onView: setViewingGroup,
            onEdit: (group) => {
              setEditing({
                id: group.id,
                name: group.name,
                description: group.description ?? "",
                displayOrder: group.displayOrder,
                isActive: group.isActive,
              });
              setOpenForm(true);
            },
            onDelete: setDeleting,
          }),
      []
  );

  /* ===================== HANDLERS ===================== */
  const invalidateModuleGroups = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["module-groups"],
    });
  };

  const handleSaved = async (saved: ModuleGroupDto) => {
    try {
      if (saved.id) {
        await moduleGroupApi.updateModuleGroup(saved.id, saved);
        toast.success("Updated successfully");
      } else {
        await moduleGroupApi.createModuleGroup(saved);
        toast.success("Created successfully");
      }

      await invalidateModuleGroups();
      await reload();

      setOpenForm(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;

    try {
      await moduleGroupApi.deleteModuleGroup(deleting.id);
      toast.success("Deleted successfully");

      await invalidateModuleGroups();
      await reload();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  /* ===================== RENDER ===================== */
  return (
      <div className="relative space-y-4 h-full flex-1">
        {/* ===================== TABLE ===================== */}
        <DataTable<ModuleGroup, unknown>
            /* Table structure */
            columns={columns as ColumnDef<ModuleGroup, unknown>[]}
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

            /* Header action */
            headerActions={
              <Button
                  onClick={() => {
                    setEditing(null);
                    setOpenForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Group
              </Button>
            }
        />

        {/* ===================== DIALOGS ===================== */}
        <ModuleGroupForm
            open={openForm}
            initial={editing}
            onClose={() => {
              setOpenForm(false);
              setEditing(null);
            }}
            onSaved={handleSaved}
            totalRecords={safeTableData.totalElements}
        />

        <ConfirmDialog
            open={!!deleting}
            title="Delete Module Group"
            description={`Are you sure you want to delete "${deleting?.name}"?`}
            onCancel={() => setDeleting(null)}
            onConfirm={() => void handleDelete()}
        />

        <ModuleGroupDetailDialog
            open={!!viewingGroup}
            group={viewingGroup}
            onClose={() => setViewingGroup(null)}
        />
      </div>
  );
}
