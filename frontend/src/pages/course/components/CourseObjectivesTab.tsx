import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash, Eye, DatabaseBackup } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data_table/DataTable";
import ActionBtn from "@/components/data_table/ActionBtn";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ImportExportModal from "@/components/modal/ImportExportModal";

import { courseApi } from "@/api/courseApi";
import type { CourseObjective } from "@/types/courseObjective";
import { SideFormPanel } from "./SideFormPanel";

// ─── Types ─────────────────────────────────────────────────
interface Props {
  courseId: string;
}

type FormState = {
  name: string;
  description: string;
};

const EMPTY_FORM: FormState = { name: "", description: "" };

// ─── Component ─────────────────────────────────────────────
const CourseObjectivesTab = ({ courseId }: Props) => {
  const [objectives, setObjectives] = useState<CourseObjective[]>([]);
  const [loading, setLoading] = useState(false);

  // Side panel (add / edit)
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // View detail
  const [viewOpen, setViewOpen] = useState(false);
  const [viewObj, setViewObj] = useState<CourseObjective | null>(null);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CourseObjective | null>(
    null,
  );

  // ─── Fetch ───────────────────────────────────────────────
  const fetchObjectives = useCallback(async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await courseApi.getObjectivesByCourse(courseId);
      setObjectives(data);
    } catch {
      toast.error("Failed to load objectives");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchObjectives();
  }, [fetchObjectives]);

  // ─── Open helpers ────────────────────────────────────────
  const openCreate = () => {
    setPanelMode("create");
    setForm(EMPTY_FORM);
    setEditingId(null);
    setPanelOpen(true);
  };

  const openEdit = (obj: CourseObjective) => {
    setPanelMode("edit");
    setForm({ name: obj.name, description: obj.description ?? "" });
    setEditingId(obj.id);
    setPanelOpen(true);
  };

  const openView = (obj: CourseObjective) => {
    setViewObj(obj);
    setViewOpen(true);
  };

  const openDelete = (obj: CourseObjective) => {
    setDeleteTarget(obj);
    setDeleteOpen(true);
  };

  // ─── Save (create / edit) ───────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Objective name is required");
      return;
    }

    try {
      setSaving(true);
      if (panelMode === "edit" && editingId) {
        await courseApi.updateObjective(courseId, editingId, {
          name: form.name,
          description: form.description,
        });
        toast.success("Objective updated successfully");
      } else {
        await courseApi.createObjective(courseId, {
          name: form.name,
          description: form.description,
        });
        toast.success("Objective created successfully");
      }
      setPanelOpen(false);
      fetchObjectives();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (panelMode === "edit"
          ? "Failed to update objective"
          : "Failed to create objective");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete ──────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await courseApi.deleteObjective(courseId, deleteTarget.id);
      toast.success("Deleted successfully");
      fetchObjectives();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  // ─── Columns ─────────────────────────────────────────────
  const columns: ColumnDef<CourseObjective>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "description", header: "Description" },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const obj = row.original;
        return (
          <div className="flex gap-2">
            <ActionBtn
              icon={<Eye size={16} />}
              tooltipText="View"
              onClick={() => openView(obj)}
            />
            <ActionBtn
              icon={<Pencil size={16} />}
              tooltipText="Edit"
              onClick={() => openEdit(obj)}
            />
            <ActionBtn
              icon={<Trash size={16} />}
              tooltipText="Delete"
              onClick={() => openDelete(obj)}
            />
          </div>
        );
      },
    },
  ];

  // ─── Import / Export ──────────────────────────────────
  const [importExportOpen, setImportExportOpen] = useState(false);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      await courseApi.importObjectives(courseId, file);
      toast.success("Objectives imported successfully");
      setImportExportOpen(false);
      fetchObjectives();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ?? "Failed to import objectives",
      );
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await courseApi.exportObjectives(courseId);
      downloadBlob(blob, "objectives_export.xlsx");
      toast.success("Exported successfully");
    } catch {
      toast.error("Failed to export objectives");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await courseApi.downloadObjectivesTemplate(courseId);
      downloadBlob(blob, "objectives_template.xlsx");
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-md font-semibold text-gray-800">
          Course Objectives
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setImportExportOpen(true)}>
            <DatabaseBackup className="h-4 w-4" />
            Import / Export
          </Button>
          <Button
            onClick={openCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Objective
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={objectives}
        isLoading={loading}
        isSearch
        searchValue={["name", "description"]}
        searchPlaceholder="name"
      />

      {/* ── Add / Edit Side Panel ── */}
      <SideFormPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        title={
          panelMode === "edit"
            ? "Edit Course Objective"
            : "Add Course Objective"
        }
        saving={saving}
        onSave={handleSave}
        saveText={panelMode === "edit" ? "Update" : "Save"}
      >
        <div className="grid gap-2">
          <Label htmlFor="obj-name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="obj-name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Objective name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="obj-desc">Description</Label>
          <textarea
            id="obj-desc"
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            placeholder="Objective description"
            rows={4}
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </SideFormPanel>

      {/* ── View Detail Sheet ── */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent className="p-0 sm:max-w-md" side="right">
          <SheetHeader className="border-b">
            <SheetTitle>Objective Detail</SheetTitle>
          </SheetHeader>
          {viewObj && (
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="text-sm font-medium">{viewObj.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">
                  Description
                </Label>
                <p className="text-sm">{viewObj.description || "—"}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Delete Confirm ── */}
      <ConfirmDeleteModal
        open={deleteOpen}
        message={
          <>
            Are you sure you want to delete "
            <strong>{deleteTarget?.name}</strong>"? This action cannot be
            undone.
          </>
        }
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
      />

      {/* ── Import / Export ── */}
      <ImportExportModal
        title="Objectives"
        open={importExportOpen}
        setOpen={setImportExportOpen}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </>
  );
};

export default CourseObjectivesTab;
