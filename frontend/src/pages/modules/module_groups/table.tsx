import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Package,
  Network,
  FileText,
  Layers,
  ToggleLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Box
} from "lucide-react";
import type { ModuleGroup, Module } from "@/types/module";
import { moduleGroupApi, moduleApi } from "@/api/moduleApi";

import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import ConfirmDialog from "@/components/ui/confirmdialog";
import {useGetAllModuleGroups} from "@/pages/modules/module_groups/queries";
import { useDebounce } from "@uidotdev/usehooks";

// --- Component DetailRow ---
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
          <Badge className="bg-green-100 text-green-700 border-green-200 shadow-none hover:bg-green-200">
            Active
          </Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        )
      ) : (
        value || <span className="text-gray-400 italic">No data</span>
      )}
    </div>
  </div>
);

export default function ModuleGroupsTable() {
  const [data, setData] = useState<ModuleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
  const [deleting, setDeleting] = useState<ModuleGroup | null>(null);

  const [viewingGroup, setViewingGroup] = useState<ModuleGroup | null>(null);

  /* ---------- load / reload ---------- */
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await moduleGroupApi.getAllModuleGroupsList();
      setData(res ?? []);
    } catch (err) {
      console.error("Failed to load module groups", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ================= COLUMNS & ACTIONS ================= */
  const columns = useMemo(
    () =>
      getColumns({
        onView: (group: ModuleGroup) => {
          setViewingGroup(group);
        },
        onEdit: (group: ModuleGroup) => {
          setEditing({
            id: group.id,
            name: group.name,
            description: group.description ?? "",
            displayOrder: group.displayOrder,
            isActive: group.isActive,
          });
          setOpenForm(true);
        },
        onDelete: (group: ModuleGroup) => {
          setDeleting(group);
        },
      }),
    []
  );

  /* ---------- save (create / update) ---------- */
  const handleSaved = async (saved: ModuleGroupDto) => {
    try {
      if (saved.id) {
        // update
        await moduleGroupApi.updateModuleGroup(saved.id, {
          name: saved.name,
          description: saved.description,
          displayOrder : saved.displayOrder,
          isActive: saved.isActive,
        });
        toast.success("Updated successfully");
      } else {
        // create
        await moduleGroupApi.createModuleGroup({
          name: saved.name,
          description: saved.description,
          displayOrder: saved.displayOrder,
        });
        toast.success("Created successfully");
      }

      await reload();
      setOpenForm(false);
      setEditing(null);
    } catch (err) {
      console.error("Save module group failed", err);
      toast.error("Save failed");
    }
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await moduleGroupApi.deleteModuleGroup(deleting.id);
      toast.success("Deleted successfully");
      await reload();
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };
    /* ================= TABLE DATA FETCHING ================= */
  const sortParam = useMemo(() => {
    if (!sorting || sorting.length === 0) {
      return "displayOrder,asc"; // default sort
    }

    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const {
    data: tableData,
    isLoading,
    isFetching
  } = useGetAllModuleGroups({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
  });

  const safeTableData = useMemo(() => {
    return {
      items: tableData?.items ?? [],
      page: tableData?.pagination?.page ?? pageIndex + 1,
      pageSize: tableData?.pagination?.pageSize ?? pageSize,
      totalPages: tableData?.pagination?.totalPages ?? 0,
      totalElements: tableData?.pagination?.totalElements ?? 0,
    };
  }, [tableData, pageIndex, pageSize]);

  return (
    <div className="relative space-y-4 h-full flex-1">
      {/* Main Table */}
      <DataTable<ModuleGroup, unknown>
          columns={columns as ColumnDef<ModuleGroup, unknown>[]}
          data={safeTableData.items}
          isLoading={isLoading}
          isFetching={isFetching}
          manualPagination
          pageIndex={safeTableData.page - 1}
          pageSize={safeTableData.pageSize}
          totalPage={safeTableData.totalPages}
          onPageChange={(page) => setPageIndex(page)}
          onPageSizeChange={setPageSize}
          isSearch
          manualSearch
          searchPlaceholder="module group name"
          onSearchChange={setSearchValue}
          sorting={sorting}
          onSortingChange={setSorting}
          manualSorting
        headerActions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpenForm(true);
            }}
            className="justify-self-end w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Group
          </Button>
        }
      />

      {/* --- Dialog Add/Edit --- */}
      <ModuleGroupForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={handleSaved}
      />

      {/* --- Dialog Delete --- */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete Module Group"
        description={`Are you sure you want to delete "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />

      {/* --- Dialog View Detail (Giờ chỉ còn 1 dòng) --- */}
      <ModuleGroupDetailDialog
        open={!!viewingGroup}
        group={viewingGroup}
        onClose={() => setViewingGroup(null)}
      />
    </div>
  );
}
