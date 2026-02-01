import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

import { moduleGroupApi } from "@/api/moduleApi";
import type { ModuleGroup } from "@/types/module";

import { getColumns } from "@/pages/modules/module_groups/column";
import { ModuleGroupForm, type ModuleGroupDto } from "./form";
import { ModuleGroupDetailDialog } from "./DetailDialog"; 

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
            displayOrder: group.totalModules,
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
          totalModules: saved.displayOrder,
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

  return (
    <div className="relative space-y-4 h-full flex-1">
      {/* Main Table */}
      <DataTable<ModuleGroup, unknown>
        columns={columns as ColumnDef<ModuleGroup, unknown>[]}
        data={data}
        isSearch
        isLoading={loading}
        searchPlaceholder={"module group name"}
        searchValue={["name"]}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={false}
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