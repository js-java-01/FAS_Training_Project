import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {ColumnDef, SortingState} from "@tanstack/react-table";
import { encodeBase64 } from "@/utils/base64.utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import type { ModuleGroup } from "@/types/module";
import { moduleGroupApi } from "@/api/moduleApi";

import { ModuleGroupForm } from "./form";
import type { ModuleGroupDto } from "./form";
import ConfirmDialog from "@/components/ui/confirmdialog";

export default function ModuleGroupsTable() {
  const navigate = useNavigate();
  const [data, setData] = useState<ModuleGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
  const [deleting, setDeleting] = useState<ModuleGroup | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, []);
  const [sorting, setSorting] = useState<SortingState>([]);

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
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await reload();
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);
  
  const columns = useMemo(
    () =>
      getColumns({
        onView: (group: ModuleGroup) => {
          navigate(`/moduleGroups/${encodeBase64(group.id)}`);
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
    [navigate]
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
        showToast("Updated");
      } else {
        // create
        await moduleGroupApi.createModuleGroup({
          name: saved.name,
          description: saved.description,
          displayOrder: saved.displayOrder,
        });
        showToast("Created");
      }

      await reload();
      setOpenForm(false);
      setEditing(null);
    } catch (err) {
      console.error("Save module group failed", err);
      showToast("Save failed");
    }
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await moduleGroupApi.deleteModuleGroup(deleting.id);
      showToast("Deleted");
      await reload();
    } catch (err) {
      console.error("Delete module group failed", err);
      showToast("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  console.log("Rendering ModuleGroupsTable", data);
  
  return (
    <div className="relative space-y-4 h-full flex-1">
      {/* toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 bg-black text-white px-4 py-2 rounded shadow
                     animate-[fadeIn_.2s_ease-out] z-50"
        >
          {toast}
        </div>
      )}

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
            className="justify-self-end w-full lg:w-30 bg-blue-600 text-white"
            variant="outline"
            autoFocus={false}
          >
            Add New
            <Plus className="h-4 w-4" />
          </Button>
        }
      />

      {/* modal add / edit */}
      <ModuleGroupForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        initial={editing}
        onSaved={handleSaved}
      />

      {/* confirm delete */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete module group?"
        description={`Are you sure you want to delete "${deleting?.name}"?`}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
