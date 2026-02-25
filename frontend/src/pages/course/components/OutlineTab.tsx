import { useEffect, useRef, useState } from "react";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import { toast } from "sonner";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import {
  GripVertical,
  Plus,
  ChevronDown,
  ChevronRight,
  DatabaseBackup,
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
import ImportExportModal from "@/components/modal/ImportExportModal";

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

  // ── Import/Export stubs ────────────────────────────────────
  const stubImport = async (_file: File) => {
    toast.info("Lesson import coming soon");
  };
  const stubExport = async () => {
    toast.info("Lesson export coming soon");
  };
  const stubTemplate = async () => {
    toast.info("Template download coming soon");
  };
  const stubSessionImport = async (_file: File) => {
    toast.info("Session import coming soon");
  };
  const stubSessionExport = async () => {
    toast.info("Session export coming soon");
  };
  const stubSessionTemplate = async () => {
    toast.info("Session template coming soon");
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

      {/* Lesson Import/Export */}
      <ImportExportModal
        title="Lessons"
        open={lessonImportExportOpen}
        setOpen={setLessonImportExportOpen}
        onImport={stubImport}
        onExport={stubExport}
        onDownloadTemplate={stubTemplate}
      />

      {/* Session Import/Export */}
      <ImportExportModal
        title="Sessions"
        open={sessionImportExportOpen}
        setOpen={setSessionImportExportOpen}
        onImport={stubSessionImport}
        onExport={stubSessionExport}
        onDownloadTemplate={stubSessionTemplate}
      />
    </div>
  );
}
