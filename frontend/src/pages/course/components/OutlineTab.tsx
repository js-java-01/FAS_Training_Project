import React, { useEffect, useMemo, useState } from "react";
import { lessonApi, type CreateLessonRequest, type Lesson } from "@/api/lessonApi";
import { toast } from "sonner";
import { FiPlus, FiEdit, FiTrash2, FiBook } from "react-icons/fi";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { DataTable } from "@/components/data_table/DataTable";
import SortHeader from "@/components/data_table/SortHeader";
import ActionBtn from "@/components/data_table/ActionBtn";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";

// ─── Form modal cho Lesson ───────────────────────────────────
interface FormModalProps {
  open: boolean;
  courseId: string;
  initial?: Lesson | null;
  onClose: () => void;
  onSuccess: () => void;
}

function LessonFormModal({ open, courseId, initial, onClose, onSuccess }: FormModalProps) {
  const isEdit = !!initial;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    lessonName: "",
    description: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        lessonName: initial?.lessonName ?? "",
        description: initial?.description ?? "",
      });
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lessonName.trim()) {
      toast.error("Lesson name is required");
      return;
    }
    try {
      setLoading(true);
      if (isEdit) {
        // Chỉ gửi những gì backend cần update
        await lessonApi.update(initial!.id, {
          lessonName: form.lessonName,
          description: form.description,
        });
        toast.success("Lesson updated");
      } else {
        // Gửi kèm courseId khi tạo mới
        await lessonApi.create({
          lessonName: form.lessonName,
          description: form.description,
          courseId: courseId,
        });
        toast.success("Lesson created");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold">{isEdit ? "Edit Lesson" : "Add Lesson"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Lesson Name *</label>
            <input
              value={form.lessonName}
              onChange={(e) => setForm(p => ({ ...p, lessonName: e.target.value }))}
              placeholder="e.g. Introduction to Programming"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Brief description of the lesson"
              rows={4}
              className={inputCls}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
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
  onEdit: (l: Lesson) => void;
  onDelete: (id: string) => void;
}): ColumnDef<Lesson, any>[] {
  return [
    {
      id: "number",
      header: "#",
      size: 60,
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
    },
    {
      accessorKey: "lessonName",
      header: (info) => <SortHeader title="Lesson Name" info={info} />,
      cell: (info) => (
        <div className="flex items-center gap-2 font-medium">
          <FiBook className="text-blue-500" />
          {info.getValue()}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => <div className="text-gray-500 truncate max-w-[350px]">{info.getValue() || "-"}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
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

// ─── Main OutlineTab ───────────────────────────────────────
export function OutlineTab({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await lessonApi.getByCourseId(courseId);
      setLessons(data);
    } catch {
      toast.error("Failed to load outline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) loadData();
  }, [courseId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lessonApi.delete(deleteId);
      toast.success("Lesson deleted");
      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  const columns = useMemo(() => getColumns({
    onEdit: (l) => { setEditLesson(l); setShowForm(true); },
    onDelete: (id) => setDeleteId(id),
  }), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <button
          onClick={() => { setEditLesson(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={14} /> Add Lesson
        </button>
      </div>

      <DataTable
        columns={columns}
        data={lessons}
        isLoading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        isSearch={false}
      />

      <LessonFormModal
        open={showForm}
        courseId={courseId}
        initial={editLesson}
        onClose={() => { setShowForm(false); setEditLesson(null); }}
        onSuccess={loadData}
      />

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete lesson?"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}