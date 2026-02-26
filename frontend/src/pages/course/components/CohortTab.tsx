import React, { useEffect, useMemo, useState } from "react";
import { cohortApi } from "@/api/cohortApi";
import type {
  Cohort,
  CreateCohortRequest,
  UpdateCohortRequest,
} from "@/api/cohortApi";
import { toast } from "sonner";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { DatabaseBackup, Plus } from "lucide-react";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { DataTable } from "@/components/data_table/DataTable";
import SortHeader from "@/components/data_table/SortHeader";
import ActionBtn from "@/components/data_table/ActionBtn";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import ImportExportModal from "@/components/modal/ImportExportModal";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@uidotdev/usehooks";

// ─── Status badge ─────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status?: string }) {
  const s = status ?? "DRAFT";
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[s] ?? STATUS_COLORS.DRAFT}`}
    >
      {s}
    </span>
  );
}

// ─── Date util ────────────────────────────────────────────
function fmtDate(v?: string | null) {
  if (!v) return "-";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ─── Form modal ───────────────────────────────────────────
interface FormModalProps {
  open: boolean;
  courseId: string;
  initial?: Cohort | null;
  onClose: () => void;
  onSuccess: () => void;
}

function CohortFormModal({
  open,
  courseId,
  initial,
  onClose,
  onSuccess,
}: FormModalProps) {
  const isEdit = !!initial;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    startDate: "",
    endDate: "",
    capacity: "",
    status: "DRAFT" as string,
  });

  useEffect(() => {
    if (open) {
      setForm({
        code: initial?.code ?? "",
        startDate: initial?.startDate?.slice(0, 10) ?? "",
        endDate: initial?.endDate?.slice(0, 10) ?? "",
        capacity: String(initial?.capacity ?? ""),
        status: initial?.status ?? "DRAFT",
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) {
      toast.error("Cohort code is required");
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        const payload: UpdateCohortRequest = {
          code: form.code,
          status: form.status as any,
        };
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
        if (form.capacity) payload.capacity = Number(form.capacity);
        await cohortApi.update(initial!.id, payload);
        toast.success("Cohort updated");
      } else {
        const payload: CreateCohortRequest = {
          code: form.code,
          courseId,
          status: form.status as any,
        };
        if (form.startDate) payload.startDate = form.startDate;
        if (form.endDate) payload.endDate = form.endDate;
        if (form.capacity) payload.capacity = Number(form.capacity);
        await cohortApi.create(payload);
        toast.success("Cohort created");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          (isEdit ? "Update failed" : "Create failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">
            {isEdit ? "Edit Cohort" : "Add Cohort"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Code */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Cohort Code *
            </label>
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="e.g. JBM-01-2026-C1"
              className={inputCls}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Status</label>
            <select
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              className={inputCls + " bg-white"}
            >
              {["DRAFT", "OPEN", "CLOSED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                End Date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Capacity</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="e.g. 30"
              className={inputCls}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────
function getColumns(handlers: {
  onEdit: (c: Cohort) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Cohort, any>[] {
  return [
    {
      id: "number",
      header: "#",
      size: 60,
      cell: ({ row, table }) =>
        row.index +
        1 +
        table.getState().pagination.pageIndex *
          table.getState().pagination.pageSize,
      enableSorting: false,
    },
    {
      accessorKey: "code",
      header: (info) => <SortHeader title="Code" info={info} />,
      cell: (info) => <div className="font-medium">{info.getValue()}</div>,
      meta: { title: "Code" },
    },
    {
      accessorKey: "startDate",
      header: (info) => <SortHeader title="Start Date" info={info} />,
      cell: (info) => <div>{fmtDate(info.getValue())}</div>,
      meta: { title: "Start Date" },
    },
    {
      accessorKey: "endDate",
      header: (info) => <SortHeader title="End Date" info={info} />,
      cell: (info) => <div>{fmtDate(info.getValue())}</div>,
      meta: { title: "End Date" },
    },
    {
      accessorKey: "capacity",
      header: (info) => <SortHeader title="Capacity" info={info} />,
      cell: (info) => <div>{info.getValue() ?? "-"}</div>,
      meta: { title: "Capacity" },
    },
    {
      accessorKey: "status",
      header: (info) => <SortHeader title="Status" info={info} />,
      cell: (info) => <StatusBadge status={info.getValue()} />,
      meta: { title: "Status" },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <ActionBtn
            icon={<FiEdit size={14} />}
            tooltipText="Edit"
            className="text-blue-500"
            onClick={() => handlers.onEdit(row.original)}
          />
          <ActionBtn
            icon={<FiTrash2 size={14} />}
            tooltipText="Delete"
            className="text-red-500"
            onClick={() => handlers.onDelete(row.original.id)}
          />
        </div>
      ),
    },
  ];
}

// ─── Main CohortTab ───────────────────────────────────────
interface Props {
  courseId: string;
}

export function CohortTab({ courseId }: Props) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCohort, setEditCohort] = useState<Cohort | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await cohortApi.getByCourseId(courseId);
      setCohorts(data);
    } catch {
      toast.error("Failed to load cohorts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [courseId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await cohortApi.delete(deleteId);
      toast.success("Cohort deleted");
      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Failed to delete cohort");
    }
  };

  /* ================= IMPORT / EXPORT / TEMPLATE ================= */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      await cohortApi.importCohorts(courseId, file);
      toast.success("Import cohorts successfully");
      setOpenBackupModal(false);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to import cohorts");
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await cohortApi.exportCohorts(courseId);
      downloadBlob(blob, "cohorts_export.xlsx");
      toast.success("Export cohorts successfully");
    } catch {
      toast.error("Failed to export cohorts");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await cohortApi.downloadTemplate();
      downloadBlob(blob, "cohorts_template.xlsx");
      toast.success("Download template successfully");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (c) => {
          setEditCohort(c);
          setShowForm(true);
        },
        onDelete: (id) => setDeleteId(id),
      }),
    [],
  );

  // Filter by search (client-side since API doesn't support keyword search)
  const filteredCohorts = useMemo(() => {
    if (!debouncedSearch) return cohorts;
    const kw = debouncedSearch.toLowerCase();
    return cohorts.filter(
      (c) =>
        c.code?.toLowerCase().includes(kw) ||
        c.status?.toLowerCase().includes(kw),
    );
  }, [cohorts, debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* ─ DataTable ─ */}
      <DataTable
        columns={columns}
        data={filteredCohorts}
        isLoading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        isSearch
        manualSearch
        searchPlaceholder="cohort code"
        onSearchChange={setSearchValue}
        headerActions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpenBackupModal(true)}
            >
              <DatabaseBackup className="h-4 w-4" />
              Import / Export
            </Button>
            <Button
              onClick={() => {
                setEditCohort(null);
                setShowForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Cohort
            </Button>
          </div>
        }
      />

      {/* ─ Modals ─ */}
      <CohortFormModal
        open={showForm}
        courseId={courseId}
        initial={editCohort}
        onClose={() => {
          setShowForm(false);
          setEditCohort(null);
        }}
        onSuccess={loadData}
      />

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete cohort?"
        message={
          <>
            Are you sure you want to delete this cohort? This action cannot be
            undone.
          </>
        }
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />

      <ImportExportModal
        title="Cohorts"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
