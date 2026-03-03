// TopicObjectivesPage.tsx

import { useState } from "react";
import { toast } from "sonner";
import { Plus, DatabaseBackup } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { getObjectiveColumns } from "@/pages/topic/components/objectiveColumns";
import { useGetTopicObjectives } from "@/pages/topic/services/queries";
import {
  useDeleteObjective,
  useUpdateObjective,
  useCreateObjective,
  useDownloadObjectiveTemplate,
  useExportObjectives,
  useImportObjectives,
} from "@/pages/topic/services/mutations";
import type { TopicObjective } from "@/types/topicObjective";
import { DataTable } from "@/components/data_table/DataTable";
import { ObjectiveForm } from "@/components/ui/ObjectiveForm";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

interface TopicObjectivesPageProps {
  topicId: string;
}

export default function TopicObjectivesPage({
  topicId,
}: TopicObjectivesPageProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] =
    useState<TopicObjective | null>(null);
  const [keyword, setKeyword] = useState("");

  // View detail
  const [viewOpen, setViewOpen] = useState(false);
  const [viewObj, setViewObj] = useState<TopicObjective | null>(null);

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TopicObjective | null>(null);

  // Import / Export modal
  const [importExportOpen, setImportExportOpen] = useState(false);

  const { data, isLoading } = useGetTopicObjectives(topicId!, {
    page: pageIndex,
    pageSize,
    keyword,
  });

  const createMutation = useCreateObjective(topicId!);
  const updateMutation = useUpdateObjective(topicId!);
  const deleteMutation = useDeleteObjective(topicId!);
  const exportMutation = useExportObjectives(topicId!);
  const importMutation = useImportObjectives(topicId!);
  const templateMutation = useDownloadObjectiveTemplate(topicId!);

  // ── Import / Export helpers ──────────────────────────────
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
    await importMutation.mutateAsync(file);
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutation.mutateAsync();
      downloadBlob(blob, `topic_objectives_${topicId}.xlsx`);
      toast.success("Exported successfully");
    } catch {
      toast.error("Failed to export objectives");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await templateMutation.mutateAsync();
      downloadBlob(blob, "objectives_template.xlsx");
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  // ── Handlers ─────────────────────────────────────────────
  const handleView = (row: TopicObjective) => {
    setViewObj(row);
    setViewOpen(true);
  };

  const handleEdit = (row: TopicObjective) => {
    setSelectedObjective(row);
    setOpen(true);
  };

  const handleDelete = (row: TopicObjective) => {
    setDeleteTarget(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        setDeleteTarget(null);
      },
    });
  };

  const columns = getObjectiveColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-md font-semibold text-gray-800">
          Topic Objectives
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setImportExportOpen(true)}>
            <DatabaseBackup className="h-4 w-4" />
            Import / Export
          </Button>
          <Button
            onClick={() => {
              setSelectedObjective(null);
              setOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Objective
          </Button>
        </div>
      </div>

      {/* ── Table ── */}
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        manualPagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalPage={data?.pagination.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchValue={["name", "details"]}
        onSearchChange={(value) => {
          setKeyword(value);
          setPageIndex(0);
        }}
        searchPlaceholder="name"
      />

      {/* ── View Detail Sheet ── */}
      <Sheet open={viewOpen} onOpenChange={setViewOpen}>
        <SheetContent className="p-0 sm:max-w-md" side="right">
          <SheetHeader className="border-b">
            <SheetTitle>Objective Detail</SheetTitle>
          </SheetHeader>
          {viewObj && (
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Code</Label>
                <p className="text-sm font-medium">{viewObj.code}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Name</Label>
                <p className="text-sm font-medium">{viewObj.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Details</Label>
                <p className="text-sm">{viewObj.details || "—"}</p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ── ObjectiveForm (create / edit) ── */}
      <ObjectiveForm
        open={open}
        onClose={() => setOpen(false)}
        showStatus={false}
        loading={createMutation.isPending || updateMutation.isPending}
        initialData={
          selectedObjective
            ? {
                code: selectedObjective.code,
                name: selectedObjective.name,
                description: selectedObjective.details ?? "",
              }
            : null
        }
        onSubmit={(formData) => {
          const payload = {
            code: formData.code,
            name: formData.name,
            details: formData.description,
          };

          if (selectedObjective) {
            updateMutation.mutate(
              { objectiveId: selectedObjective.id, payload },
              { onSuccess: () => setOpen(false) },
            );
          } else {
            createMutation.mutate(payload, {
              onSuccess: () => setOpen(false),
            });
          }
        }}
      />

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
}
