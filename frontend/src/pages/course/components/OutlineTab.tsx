import { useEffect, useRef, useState } from "react";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import {
  batchOutlineApi,
  type LessonBatchItem,
  type SessionBatchItem,
} from "@/api/batchOutlineApi";
import { toast } from "sonner";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import {
  GripVertical,
  Plus,
  ChevronDown,
  ChevronRight,
  DatabaseBackup,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ActionBtn from "@/components/data_table/ActionBtn";
import type { SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import {
  SessionSidePanel,
  type SessionSidePanelMode,
} from "./SessionSidePanel";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

// ─── Type badge ────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  VIDEO_LECTURE: "bg-blue-100 text-blue-700",
  LIVE_SESSION: "bg-green-100 text-green-700",
  QUIZ: "bg-yellow-100 text-yellow-700",
  ASSIGNMENT: "bg-orange-100 text-orange-700",
  PROJECT: "bg-purple-100 text-purple-700",
};
const typeLabelMap = new Map(
  SESSION_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

// ─── Lesson Form Modal ─────────────────────────────────────────
interface FormModalProps {
  open: boolean;
  courseId: string;
  initial?: Lesson | null;
  onClose: () => void;
  onSuccess: () => void;
}

function LessonFormModal({
  open,
  courseId,
  initial,
  onClose,
  onSuccess,
}: FormModalProps) {
  const isEdit = !!initial;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ lessonName: "", description: "" });

  useEffect(() => {
    if (open)
      setForm({
        lessonName: initial?.lessonName ?? "",
        description: initial?.description ?? "",
      });
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
        await lessonApi.update(initial!.id, {
          lessonName: form.lessonName,
          description: form.description,
        });
        toast.success("Lesson updated");
      } else {
        await lessonApi.create({
          lessonName: form.lessonName,
          description: form.description,
          courseId,
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

  const cls =
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
            {isEdit ? "Edit Lesson" : "Add Lesson"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Lesson Name *
            </label>
            <input
              value={form.lessonName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lessonName: e.target.value }))
              }
              placeholder="e.g. Introduction to Programming"
              className={cls}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Brief description of the lesson"
              rows={3}
              className={cls}
            />
          </div>
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

// ─── Session Row ───────────────────────────────────────────────
function SessionRow({
  session,
  idx,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onEdit,
  onDelete,
}: {
  session: SessionResponse;
  idx: number;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const typeLabel = session.type
    ? (typeLabelMap.get(session.type as never) ?? session.type)
    : null;
  const typeColor = session.type
    ? (TYPE_COLORS[session.type] ?? "bg-gray-100 text-gray-600")
    : "";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm transition-colors select-none
        ${isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-100 bg-white hover:bg-gray-50"}`}
    >
      <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />
      <span className="w-6 text-center text-xs font-medium text-gray-400 shrink-0">
        {idx + 1}
      </span>
      <span className="flex-1 truncate text-gray-800">
        {session.topic || "—"}
      </span>
      {typeLabel && (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${typeColor}`}
        >
          {typeLabel}
        </span>
      )}
      <div
        className="flex items-center gap-1 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionBtn
          icon={<FiEdit size={12} />}
          tooltipText="Edit"
          onClick={onEdit}
        />
        <ActionBtn
          icon={<FiTrash2 size={12} />}
          tooltipText="Delete"
          onClick={onDelete}
        />
      </div>
    </div>
  );
}

// ─── Lesson Row ────────────────────────────────────────────────
function LessonRow({
  lesson,
  idx,
  expanded,
  isDragOver,
  sessions,
  sessionsLoading,
  onToggle,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  onAddSession,
  onSessionImportExport,
  onEditSession,
  onDeleteSession,
  onSessionDragStart,
  onSessionDragOver,
  onSessionDragEnd,
  onSessionDrop,
  sessionDragOverIdx,
}: {
  lesson: Lesson;
  idx: number;
  expanded: boolean;
  isDragOver: boolean;
  sessions: SessionResponse[];
  sessionsLoading: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  onAddSession: () => void;
  onSessionImportExport: () => void;
  onEditSession: (s: SessionResponse) => void;
  onDeleteSession: (s: SessionResponse) => void;
  onSessionDragStart: (i: number) => void;
  onSessionDragOver: (i: number) => void;
  onSessionDragEnd: () => void;
  onSessionDrop: (i: number) => void;
  sessionDragOverIdx: number | null;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragEnd={onDragEnd}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      className={`border rounded-xl overflow-hidden transition-colors
        ${isDragOver ? "border-blue-400 shadow-md" : "border-gray-200"}`}
    >
      {/* Lesson header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none
          ${expanded ? "bg-blue-50 border-b border-blue-100" : "bg-white hover:bg-gray-50"}`}
        onClick={onToggle}
      >
        <GripVertical
          size={16}
          className="text-gray-300 cursor-grab shrink-0"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          className="text-gray-400 hover:text-gray-600 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <span className="text-xs text-gray-400 shrink-0 w-5">{idx + 1}.</span>
        <span className="flex-1 font-semibold text-gray-900 truncate">
          {lesson.lessonName}
        </span>
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionBtn
            icon={<FiEye size={13} />}
            tooltipText="View"
            onClick={() => {}}
          />
          <ActionBtn
            icon={<FiEdit size={13} />}
            tooltipText="Edit"
            onClick={onEdit}
          />
          <ActionBtn
            icon={<FiTrash2 size={13} />}
            tooltipText="Delete"
            onClick={onDelete}
          />
        </div>
      </div>

      {/* Sessions (expanded) */}
      {expanded && (
        <div className="bg-white px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600 tracking-wide">
              Sessions
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onSessionImportExport}
                className="h-7 text-xs gap-1.5"
              >
                <DatabaseBackup className="h-3.5 w-3.5" />
                Import / Export
              </Button>
              <button
                onClick={onAddSession}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={12} /> Add Session
              </button>
            </div>
          </div>

          {sessionsLoading ? (
            <div className="text-xs text-gray-400 py-3 text-center">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded-lg">
              No sessions yet. Click "+ Add Session" to start.
            </div>
          ) : (
            <div className="space-y-1.5">
              {sessions.map((s, i) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  idx={i}
                  isDragOver={sessionDragOverIdx === i}
                  onDragStart={() => onSessionDragStart(i)}
                  onDragOver={() => onSessionDragOver(i)}
                  onDragEnd={onSessionDragEnd}
                  onDrop={() => onSessionDrop(i)}
                  onEdit={() => onEditSession(s)}
                  onDelete={() => onDeleteSession(s)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Batch Outline Modal ───────────────────────────────────────
function BatchOutlineModal({
  open,
  courseId,
  onClose,
  onSuccess,
}: {
  open: boolean;
  courseId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [lessons, setLessons] = useState<LessonBatchItem[]>([
    { lessonName: "", description: "", sessions: [] },
  ]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (open) {
      setLessons([
        {
          lessonName: "",
          description: "",
          sessions: [
            {
              topic: "",
              type: "VIDEO_LECTURE",
              studentTasks: "",
              sessionOrder: 1,
            },
          ],
        },
      ]);
      setCollapsed({});
    }
  }, [open]);

  if (!open) return null;

  const toggleCollapse = (idx: number) =>
    setCollapsed((p) => ({ ...p, [idx]: !p[idx] }));

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        lessonName: "",
        description: "",
        sessions: [
          {
            topic: "",
            type: "VIDEO_LECTURE",
            studentTasks: "",
            sessionOrder: 1,
          },
        ],
      },
    ]);
  };

  const removeLesson = (idx: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLesson = (
    idx: number,
    field: keyof LessonBatchItem,
    value: string,
  ) => {
    setLessons((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    );
  };

  const addSession = (lessonIdx: number) => {
    setLessons((prev) =>
      prev.map((l, i) =>
        i === lessonIdx
          ? {
              ...l,
              sessions: [
                ...(l.sessions ?? []),
                {
                  topic: "",
                  type: "VIDEO_LECTURE",
                  studentTasks: "",
                  sessionOrder: (l.sessions?.length ?? 0) + 1,
                },
              ],
            }
          : l,
      ),
    );
  };

  const removeSession = (lessonIdx: number, sessionIdx: number) => {
    setLessons((prev) =>
      prev.map((l, i) =>
        i === lessonIdx
          ? {
              ...l,
              sessions: (l.sessions ?? []).filter((_, si) => si !== sessionIdx),
            }
          : l,
      ),
    );
  };

  const updateSession = (
    lessonIdx: number,
    sessionIdx: number,
    field: keyof SessionBatchItem,
    value: string | number,
  ) => {
    setLessons((prev) =>
      prev.map((l, i) =>
        i === lessonIdx
          ? {
              ...l,
              sessions: (l.sessions ?? []).map((s, si) =>
                si === sessionIdx ? { ...s, [field]: value } : s,
              ),
            }
          : l,
      ),
    );
  };

  const handleSubmit = async () => {
    const validLessons = lessons.filter((l) => l.lessonName.trim());
    if (validLessons.length === 0) {
      toast.error("At least one lesson with a name is required");
      return;
    }
    try {
      setLoading(true);
      await batchOutlineApi.createBatch({
        courseId,
        lessons: validLessons,
      });
      toast.success("Batch outline created successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create batch outline",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Top Header Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Create Batch Lessons with Sessions
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Create multiple lessons and sessions at once for this course.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={addLesson} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
          >
            {loading ? "Creating..." : "Create Batch"}
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-[1200px] mx-auto space-y-4">
          {lessons.map((lesson, li) => {
            const isCollapsed = !!collapsed[li];
            const sessionCount = (lesson.sessions ?? []).length;
            return (
              <div
                key={li}
                className="border border-gray-200 rounded-xl bg-white shadow-sm"
              >
                {/* Lesson Header */}
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(li)}
                      className="mt-1 text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      {isCollapsed ? (
                        <ChevronRight size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Lesson Name *
                          </label>
                          <input
                            value={lesson.lessonName}
                            onChange={(e) =>
                              updateLesson(li, "lessonName", e.target.value)
                            }
                            placeholder="Enter lesson name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="text-center shrink-0">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Sessions
                          </label>
                          <span className="inline-block text-sm font-semibold text-gray-700 py-2">
                            {sessionCount}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-end pb-0.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSession(li)}
                            className="gap-1 h-9"
                          >
                            <Plus size={14} />
                            Add Session
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <>
                      <div className="pl-8">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Description
                        </label>
                        <input
                          value={lesson.description ?? ""}
                          onChange={(e) =>
                            updateLesson(li, "description", e.target.value)
                          }
                          placeholder="Enter description (optional)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Sessions Table */}
                      {sessionCount > 0 && (
                        <div className="pl-8">
                          {/* Table Header */}
                          <div className="grid grid-cols-[160px_1fr_1fr_48px] gap-3 mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Type
                            </span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Topic
                            </span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              Student Tasks
                            </span>
                            <span />
                          </div>

                          {/* Session Rows */}
                          <div className="space-y-2">
                            {(lesson.sessions ?? []).map((session, si) => (
                              <div
                                key={si}
                                className="grid grid-cols-[160px_1fr_1fr_48px] gap-3 items-center"
                              >
                                <select
                                  value={session.type ?? "VIDEO_LECTURE"}
                                  onChange={(e) =>
                                    updateSession(
                                      li,
                                      si,
                                      "type",
                                      e.target.value,
                                    )
                                  }
                                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="" disabled>
                                    Select type
                                  </option>
                                  {SESSION_TYPE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  value={session.topic ?? ""}
                                  onChange={(e) =>
                                    updateSession(
                                      li,
                                      si,
                                      "topic",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Topic"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                  value={session.studentTasks ?? ""}
                                  onChange={(e) =>
                                    updateSession(
                                      li,
                                      si,
                                      "studentTasks",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="Tasks"
                                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeSession(li, si)}
                                  className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Lesson Footer - delete */}
                {lessons.length > 1 && !isCollapsed && (
                  <div className="px-5 py-2 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeLesson(li)}
                      className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Remove Lesson
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add lesson dashed button */}
          <button
            type="button"
            onClick={addLesson}
            className="w-full py-3 text-sm border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Add Another Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main OutlineTab ───────────────────────────────────────────
export function OutlineTab({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // lesson drag
  const lessonDragIdx = useRef<number | null>(null);
  const [lessonDragOverIdx, setLessonDragOverIdx] = useState<number | null>(
    null,
  );

  // session drag per lesson
  const sessionDragIdx = useRef<number | null>(null);
  const [sessionDragOverByLesson, setSessionDragOverByLesson] = useState<
    Record<string, number | null>
  >({});

  // Lesson modal
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [deleteLessonId, setDeleteLessonId] = useState<string | null>(null);

  // Session panel
  const [sessionsByLesson, setSessionsByLesson] = useState<
    Record<string, SessionResponse[]>
  >({});
  const [sessionLoadingByLesson, setSessionLoadingByLesson] = useState<
    Record<string, boolean>
  >({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<SessionSidePanelMode>("create");
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(
    null,
  );
  const [sessionLessonId, setSessionLessonId] = useState<string | null>(null);
  const [deleteSession, setDeleteSession] = useState<SessionResponse | null>(
    null,
  );

  // Import/export modals
  const [lessonImportExportOpen, setLessonImportExportOpen] = useState(false);
  const [sessionImportExportOpen, setSessionImportExportOpen] = useState(false);

  // Batch outline modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // ── Data loading ───────────────────────────────────────────
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

  const loadSessions = async (lessonId: string) => {
    setSessionLoadingByLesson((p) => ({ ...p, [lessonId]: true }));
    try {
      const list = await sessionService.getSessionsByLesson(lessonId);
      setSessionsByLesson((p) => ({ ...p, [lessonId]: list }));
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionLoadingByLesson((p) => ({ ...p, [lessonId]: false }));
    }
  };

  const handleToggle = (lessonId: string) => {
    const next = expandedId === lessonId ? null : lessonId;
    setExpandedId(next);
    if (next && !sessionsByLesson[next]) void loadSessions(next);
  };

  // ── Lesson CRUD ────────────────────────────────────────────
  const handleDeleteLesson = async () => {
    if (!deleteLessonId) return;
    try {
      await lessonApi.delete(deleteLessonId);
      toast.success("Lesson deleted");
      if (expandedId === deleteLessonId) setExpandedId(null);
      setDeleteLessonId(null);
      loadData();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  // ── Lesson DnD ─────────────────────────────────────────────
  const handleLessonDrop = (targetIdx: number) => {
    const fromIdx = lessonDragIdx.current;
    if (fromIdx === null || fromIdx === targetIdx) {
      lessonDragIdx.current = null;
      setLessonDragOverIdx(null);
      return;
    }
    const next = [...lessons];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(targetIdx, 0, moved);
    setLessons(next);
    lessonDragIdx.current = null;
    setLessonDragOverIdx(null);
  };

  // ── Session DnD ────────────────────────────────────────────
  const handleSessionDrop = (lessonId: string, targetIdx: number) => {
    const fromIdx = sessionDragIdx.current;
    if (fromIdx === null || fromIdx === targetIdx) {
      sessionDragIdx.current = null;
      setSessionDragOverByLesson((p) => ({ ...p, [lessonId]: null }));
      return;
    }
    const prev = sessionsByLesson[lessonId] ?? [];
    const next = [...prev];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(targetIdx, 0, moved);
    setSessionsByLesson((p) => ({ ...p, [lessonId]: next }));
    sessionDragIdx.current = null;
    setSessionDragOverByLesson((p) => ({ ...p, [lessonId]: null }));
  };

  // ── Session CRUD ───────────────────────────────────────────
  const handleDeleteSession = async () => {
    if (!deleteSession) return;
    try {
      await sessionService.deleteSession(deleteSession.id);
      toast.success("Session deleted");
      void loadSessions(deleteSession.lessonId);
      setDeleteSession(null);
    } catch {
      toast.error("Failed to delete session");
    }
  };

  // ── Import/Export handlers ─────────────────────────────────
  const handleOutlineImport = async (file: File) => {
    try {
      await batchOutlineApi.importOutline(courseId, file);
      toast.success("Outline imported successfully");
      await loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to import outline");
    }
  };

  const handleOutlineExport = async () => {
    try {
      const blob = await batchOutlineApi.exportOutline(courseId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `outline_${courseId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Outline exported");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export outline");
    }
  };

  const handleOutlineTemplate = async () => {
    try {
      const blob = await batchOutlineApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "outline_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleSessionImport = async (file: File) => {
    if (!sessionLessonId) return;
    try {
      await sessionService.importSessions(sessionLessonId, file);
      toast.success("Sessions imported successfully");
      await loadSessions(sessionLessonId);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to import sessions");
    }
  };

  const handleSessionExport = async () => {
    if (!sessionLessonId) return;
    try {
      const blob = await sessionService.exportSessions(sessionLessonId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sessions_${sessionLessonId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Sessions exported");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to export sessions");
    }
  };

  const handleSessionTemplate = async () => {
    try {
      const blob = await sessionService.downloadSessionTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sessions_template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="text-md font-semibold text-gray-800">
          Course Outlines
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setLessonImportExportOpen(true)}
          >
            <DatabaseBackup className="h-4 w-4" />
            Import / Export
          </Button>
          <Button
            variant="secondary"
            onClick={() => setBatchModalOpen(true)}
            className="gap-2"
          >
            <Layers className="h-4 w-4" />
            Batch Create
          </Button>
          <Button
            onClick={() => {
              setEditLesson(null);
              setShowLessonForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        </div>
      </div>

      {/* Lessons list */}
      {loading ? (
        <div className="text-sm text-gray-400 p-4">Loading lessons...</div>
      ) : lessons.length === 0 ? (
        <div className="text-sm text-gray-400 p-4 border border-dashed border-gray-200 rounded-xl text-center">
          No lessons yet. Click "+ Add Lesson" to create the first one.
        </div>
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, idx) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              idx={idx}
              expanded={expandedId === lesson.id}
              isDragOver={lessonDragOverIdx === idx}
              sessions={sessionsByLesson[lesson.id] ?? []}
              sessionsLoading={!!sessionLoadingByLesson[lesson.id]}
              onToggle={() => handleToggle(lesson.id)}
              onEdit={() => {
                setEditLesson(lesson);
                setShowLessonForm(true);
              }}
              onDelete={() => setDeleteLessonId(lesson.id)}
              onDragStart={() => {
                lessonDragIdx.current = idx;
              }}
              onDragOver={() => setLessonDragOverIdx(idx)}
              onDragEnd={() => {
                lessonDragIdx.current = null;
                setLessonDragOverIdx(null);
              }}
              onDrop={() => handleLessonDrop(idx)}
              onAddSession={() => {
                setSessionLessonId(lesson.id);
                setPanelMode("create");
                setEditingSession(null);
                setPanelOpen(true);
              }}
              onEditSession={(s) => {
                setSessionLessonId(s.lessonId);
                setPanelMode("edit");
                setEditingSession(s);
                setPanelOpen(true);
              }}
              onSessionImportExport={() => {
                setSessionLessonId(lesson.id);
                setSessionImportExportOpen(true);
              }}
              onDeleteSession={(s) => setDeleteSession(s)}
              onSessionDragStart={(i) => {
                sessionDragIdx.current = i;
              }}
              onSessionDragOver={(i) =>
                setSessionDragOverByLesson((p) => ({ ...p, [lesson.id]: i }))
              }
              onSessionDragEnd={() => {
                sessionDragIdx.current = null;
                setSessionDragOverByLesson((p) => ({
                  ...p,
                  [lesson.id]: null,
                }));
              }}
              onSessionDrop={(i) => handleSessionDrop(lesson.id, i)}
              sessionDragOverIdx={sessionDragOverByLesson[lesson.id] ?? null}
            />
          ))}
        </div>
      )}

      {/* Lesson form modal */}
      <LessonFormModal
        open={showLessonForm}
        courseId={courseId}
        initial={editLesson}
        onClose={() => {
          setShowLessonForm(false);
          setEditLesson(null);
        }}
        onSuccess={loadData}
      />

      {/* Session side panel */}
      <SessionSidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        mode={panelMode}
        courseId={courseId}
        initialSession={editingSession}
        defaultLessonId={sessionLessonId}
        onSaved={(saved) => {
          void loadSessions(saved.lessonId);
        }}
      />

      {/* Delete lesson confirm */}
      <ConfirmDeleteModal
        open={!!deleteLessonId}
        title="Delete lesson?"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        onCancel={() => setDeleteLessonId(null)}
        onConfirm={handleDeleteLesson}
      />

      {/* Delete session confirm */}
      <ConfirmDeleteModal
        open={!!deleteSession}
        title="Delete session?"
        message="Are you sure you want to delete this session? This action cannot be undone."
        onCancel={() => setDeleteSession(null)}
        onConfirm={handleDeleteSession}
      />

      {/* Batch Outline Modal */}
      <BatchOutlineModal
        open={batchModalOpen}
        courseId={courseId}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={loadData}
      />

      {/* Outline Import/Export */}
      <ImportExportModal
        title="Outline"
        open={lessonImportExportOpen}
        setOpen={setLessonImportExportOpen}
        onImport={handleOutlineImport}
        onExport={handleOutlineExport}
        onDownloadTemplate={handleOutlineTemplate}
      />

      {/* Session Import/Export */}
      <ImportExportModal
        title="Sessions"
        open={sessionImportExportOpen}
        setOpen={setSessionImportExportOpen}
        onImport={handleSessionImport}
        onExport={handleSessionExport}
        onDownloadTemplate={handleSessionTemplate}
      />
    </div>
  );
}
