import { DataTable } from "@/components/data_table/DataTable";
import { getColumns } from "@/pages/modules/module_groups/column";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType, SVGProps, ReactNode } from "react";
import type {ColumnDef, SortingState} from "@tanstack/react-table";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ModuleGroupDto | null>(null);
  const [deleting, setDeleting] = useState<ModuleGroup | null>(null);

  const [viewingGroup, setViewingGroup] = useState<ModuleGroup | null>(null);
  const [viewingModules, setViewingModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isModulesOpen, setIsModulesOpen] = useState(false);

  // Toast
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
    reload();
  }, [reload]);

  /* ================= LOAD DATA FOR VIEW DETAIL ================= */
  useEffect(() => {
    if (viewingGroup?.id) {
      let mounted = true;

      const fetchData = async () => {
        setLoadingModules(true);
        try {
          const id = viewingGroup.id;
          const modulesPromise = moduleApi.getModulesByModuleGroup(id);
          const groupPromise = moduleGroupApi.getModuleGroupById(id);

          const [modules, groupDetail] = await Promise.all([modulesPromise, groupPromise]);

          if (mounted) {
            setViewingModules(modules);
            setViewingGroup(prev => prev ? ({...prev, ...groupDetail}) : groupDetail);
          }
        } catch (error) {
          console.error("Failed to load details", error);
          if (mounted) setViewingModules([]);
        } finally {
          if (mounted) setLoadingModules(false);
        }
      };

      setIsModulesOpen(true);
      fetchData();

      return () => { mounted = false; };
    } else {
      setViewingModules([]);
      setIsModulesOpen(false);
    }
  }, [viewingGroup?.id]);

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
        showToast("Updated successfully");
      } else {
        // create
        await moduleGroupApi.createModuleGroup({
          name: saved.name,
          description: saved.description,
          displayOrder: saved.displayOrder,
        });
        showToast("Created successfully");
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
      showToast("Deleted successfully");
      await reload();
    } catch (err) {
      console.error("Delete failed", err);
      showToast("Delete failed");
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

  const [pageIndex, setPageIndex] = useState(1);
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
    return tableData ?? {
      content: [],
      number: 0,
      size: pageSize,
      totalPages: 1,
      totalElements: 0,
    };
  }, [tableData, pageSize]);

  return (
    <div className="relative space-y-4 h-full flex-1">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg z-[100] animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Main Table */}
      <DataTable<ModuleGroup, unknown>
        columns={columns as ColumnDef<ModuleGroup, unknown>[]}
        data={safeTableData.content}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination
        pageIndex={safeTableData.number ?? 1}
        pageSize={safeTableData.size ?? 10}
        totalPage={safeTableData.totalPages ?? 1}
        onPageChange={(newPage) => setPageIndex(newPage)}
        onPageSizeChange={setPageSize}
        isSearch
        manualSearch
        searchPlaceholder={"module group name"}
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

      {/* --- Dialog View Detail --- */}
      <Dialog open={!!viewingGroup} onOpenChange={(open) => !open && setViewingGroup(null)}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-4 border-b bg-gray-50/50">
            <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Module Group Details
            </DialogTitle>
            <DialogDescription>
              Information about <strong>{viewingGroup?.name}</strong> and its modules.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Group Info Section */}
            <div className="space-y-5">
              <DetailRow icon={Network} label="Module Group Name" value={viewingGroup?.name} />
              <DetailRow icon={FileText} label="Description" value={viewingGroup?.description} />
              <div className="grid grid-cols-2 gap-5">
                <DetailRow icon={Layers} label="Display Order" value={viewingGroup?.displayOrder} />
                <DetailRow icon={ToggleLeft} label="Status" value={viewingGroup?.isActive} isBadge />
              </div>
            </div>

            <div className="border-t border-gray-100 my-4" />

            {/* Modules Dropdown Section */}
            <div className="border rounded-lg overflow-hidden border-gray-200">
              <button
                onClick={() => setIsModulesOpen(!isModulesOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                type="button"
              >
                <div className="flex items-center gap-2 font-bold text-gray-700 text-sm">
                  <Package className="w-4 h-4 text-gray-500" />
                  Included Modules
                  {!loadingModules && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {viewingModules.length}
                    </Badge>
                  )}
                </div>
                {isModulesOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {isModulesOpen && (
                <div className="bg-white animate-in slide-in-from-top-2 duration-200">
                  {loadingModules ? (
                    <div className="p-4 flex justify-center text-gray-400 text-sm items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading modules...
                    </div>
                  ) : viewingModules.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm italic">
                      No modules found in this group.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {viewingModules.map((mod: Module) => (
                        <li key={mod.id} className="p-3 pl-4 hover:bg-gray-50 transition flex justify-between items-center group">
                          <div className="flex items-center gap-3">
                             {/* Icon */}
                             <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                                <Box className="w-4 h-4"/>
                             </div>
                             <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700">{mod.title}</span>
                                {mod.description && <span className="text-xs text-gray-500 line-clamp-1">{mod.description}</span>}
                             </div>
                          </div>

                          <div className="flex items-center gap-2">
                             {/* Order */}
                             <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                #{mod.displayOrder}
                             </span>
                             {/* Status dot */}
                             {mod.isActive !== undefined && (
                                <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm ${mod.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                             )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-gray-50/50">
            <Button onClick={() => setViewingGroup(null)} className="bg-blue-600 hover:bg-blue-700 text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
