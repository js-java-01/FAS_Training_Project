import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronDown,
  Eye,
  Loader2,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  DatabaseBackup,
  GripVertical,
} from "lucide-react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { topicApi, type TopicLesson, type TopicObjective } from "@/api/topicApi";
import { topicSessionApi } from "@/api/topicSessionApi";
import {
  topicBatchOutlineApi,
  type TopicLessonBatchItem,
} from "@/api/topicBatchOutlineApi";
import {
  DELIVERY_TYPE_OPTIONS,
  TRAINING_FORMAT_OPTIONS,
  type TopicSessionRequest,
  type TopicSessionResponse,
} from "@/types/topicSession";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

/* ──────────────────────────────────────────────────────────── */
/*  Constants                                                    */
/* ──────────────────────────────────────────────────────────── */

const TYPE_COLORS: Record<string, string> = {
  VIDEO_LECTURE: "bg-blue-100 text-blue-700",
  LIVE_SESSION:  "bg-green-100 text-green-700",
  QUIZ:          "bg-yellow-100 text-yellow-700",
  ASSIGNMENT:    "bg-orange-100 text-orange-700",
  PROJECT:       "bg-purple-100 text-purple-700",
};
const typeLabelMap: Map<string, string> = new Map(DELIVERY_TYPE_OPTIONS.map((o) => [o.value, o.label]));
const inputCls =
  "w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

/* ──────────────────────────────────────────────────────────── */
/*  Types                                                        */
/* ──────────────────────────────────────────────────────────── */

interface Props {
  topicId: string;
  isEditMode: boolean;
}

type DrawerMode =
  | "create-lesson"
  | "edit-lesson"
  | "create-session"
  | "edit-session"
  | null;

/* ──────────────────────────────────────────────────────────── */
/*  Main Component                                               */
/* ──────────────────────────────────────────────────────────── */

export function TopicOutlineTab({ topicId, isEditMode }: Props) {
  /* ── lesson list ── */
  const [lessons, setLessons]   = useState<TopicLesson[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  /* ── sessions per lesson ── */
  const [sessionsMap, setSessionsMap]             = useState<Record<string, TopicSessionResponse[]>>({});
  const [sessionsLoadingMap, setSessionsLoadingMap] = useState<Record<string, boolean>>({});
  const [objectives, setObjectives] = useState<TopicObjective[]>([]);

  /* ── drawer ── */
  const [drawerMode, setDrawerMode]               = useState<DrawerMode>(null);
  const [editLesson, setEditLesson]               = useState<TopicLesson | null>(null);
  const [editSession, setEditSession]             = useState<TopicSessionResponse | null>(null);

  /* ── lesson form ── */
  const [lessonForm, setLessonForm]     = useState({ lessonName: "", description: "" });
  const [lessonSaving, setLessonSaving] = useState(false);
  const [lessonFormError, setLessonFormError] = useState<string | null>(null);

  /* ── session form ── */
  const [sessionForm, setSessionForm]     = useState({
    lessonId: "",
    deliveryType: "",
    trainingFormat: "",
    duration: "",
    sessionOrder: "",
    learningObjectiveIds: [] as string[],
    content: "",
    note: "",
  });
  const [sessionSaving, setSessionSaving]   = useState(false);
  const [sessionFormError, setSessionFormError] = useState<string | null>(null);

  /* ── delete confirms ── */
  const [deletingLesson, setDeletingLesson]   = useState<TopicLesson | null>(null);
  const [deletingSession, setDeletingSession] = useState<TopicSessionResponse | null>(null);
  const [lessonImportExportOpen, setLessonImportExportOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [sessionImportExportOpen, setSessionImportExportOpen] = useState(false);
  const [selectedSessionLessonId, setSelectedSessionLessonId] = useState<string | null>(null);

  /* ─── Fetch lessons ──────────────────────────────────────── */
  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await topicApi.getLessonsByTopicId(topicId);
      setLessons(data);
    } catch {
      setError("Failed to load outline. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const data = await topicApi.getObjectives(topicId, { page: 0, size: 200 });
        setObjectives(data.items);
      } catch {
        setObjectives([]);
      }
    };
    fetchObjectives();
  }, [topicId]);

  /* ─── Fetch sessions for a lesson ───────────────────────── */
  const fetchSessions = useCallback(async (lessonId: string) => {
    setSessionsLoadingMap((p) => ({ ...p, [lessonId]: true }));
    try {
      const data = await topicSessionApi.getSessionsByLesson(lessonId);
      setSessionsMap((p) => ({ ...p, [lessonId]: data }));
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setSessionsLoadingMap((p) => ({ ...p, [lessonId]: false }));
    }
  }, []);

  /* ─── Toggle lesson expand ───────────────────────────────── */
  const toggleExpand = (lessonId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
        if (!sessionsMap[lessonId]) fetchSessions(lessonId);
      }
      return next;
    });
  };

  /* ─── Close drawer ───────────────────────────────────────── */
  const closeDrawer = () => {
    setDrawerMode(null);
    setEditLesson(null);
    setEditSession(null);
    setLessonFormError(null);
    setSessionFormError(null);
  };

  /* ─── Open: create lesson ────────────────────────────────── */
  const openCreateLesson = () => {
    setLessonForm({ lessonName: "", description: "" });
    setLessonFormError(null);
    setDrawerMode("create-lesson");
  };

  /* ─── Open: edit lesson ──────────────────────────────────── */
  const openEditLesson = (lesson: TopicLesson) => {
    setEditLesson(lesson);
    setLessonForm({ lessonName: lesson.lessonName, description: lesson.description ?? "" });
    setLessonFormError(null);
    setDrawerMode("edit-lesson");
  };

  /* ─── Open: create session ───────────────────────────────── */
  const openCreateSession = (lessonId: string) => {
    const existing = sessionsMap[lessonId] ?? [];
    setSessionForm({
      lessonId,
      deliveryType: "",
      trainingFormat: "",
      duration: "",
      sessionOrder: String(existing.length + 1),
      learningObjectiveIds: [],
      content: "",
      note: "",
    });
    setSessionFormError(null);
    setDrawerMode("create-session");
  };

  /* ─── Open: edit session ─────────────────────────────────── */
  const openEditSession = (session: TopicSessionResponse) => {
    setEditSession(session);
    setSessionForm({
      lessonId: session.lessonId,
      deliveryType: session.deliveryType ?? "",
      trainingFormat: session.trainingFormat ?? "",
      duration: session.duration != null ? String(session.duration) : "",
      sessionOrder: session.sessionOrder != null ? String(session.sessionOrder) : "",
      learningObjectiveIds: session.learningObjectiveIds ?? [],
      content: session.content ?? "",
      note: session.note ?? "",
    });
    setSessionFormError(null);
    setDrawerMode("edit-session");
  };

  /* ─── Save lesson ────────────────────────────────────────── */
  const handleSaveLesson = async () => {
    if (!lessonForm.lessonName.trim()) {
      setLessonFormError("Lesson Name is required.");
      return;
    }
    setLessonSaving(true);
    setLessonFormError(null);
    try {
      if (drawerMode === "edit-lesson" && editLesson) {
        await topicApi.updateLesson(topicId, editLesson.id, {
          lessonName:  lessonForm.lessonName.trim(),
          description: lessonForm.description.trim() || undefined,
        });
        toast.success("Lesson updated successfully");
      } else {
        await topicApi.createLesson(topicId, {
          lessonName:  lessonForm.lessonName.trim(),
          description: lessonForm.description.trim() || undefined,
        });
        toast.success("Lesson created successfully");
      }
      closeDrawer();
      fetchLessons();
    } catch {
      setLessonFormError("Failed to save lesson. Please try again.");
    } finally {
      setLessonSaving(false);
    }
  };

  /* ─── Delete lesson ──────────────────────────────────────── */
  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      await topicApi.deleteLesson(topicId, deletingLesson.id);
      toast.success("Lesson deleted");
      setDeletingLesson(null);
      fetchLessons();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  /* ─── Save session ───────────────────────────────────────── */
  const handleSaveSession = async () => {
    if (!sessionForm.lessonId) {
      setSessionFormError("Lesson is required.");
      return;
    }
    if (!sessionForm.deliveryType) {
      setSessionFormError("Delivery type is required.");
      return;
    }
    if (!sessionForm.duration || Number(sessionForm.duration) <= 0) {
      setSessionFormError("Duration must be a positive number.");
      return;
    }
    if (!sessionForm.sessionOrder || Number(sessionForm.sessionOrder) <= 0) {
      setSessionFormError("Session order must be a positive number.");
      return;
    }
    const targetLessonId = sessionForm.lessonId;

    const existingInLesson = sessionsMap[targetLessonId] ?? [];
    const duplicateOrder = existingInLesson.some(
      (session) =>
        session.sessionOrder === Number(sessionForm.sessionOrder) &&
        session.id !== editSession?.id,
    );
    if (duplicateOrder) {
      setSessionFormError("Session order already exists in this lesson.");
      return;
    }

    const payload: TopicSessionRequest = {
      lessonId: targetLessonId,
      deliveryType: sessionForm.deliveryType,
      trainingFormat: sessionForm.trainingFormat || null,
      duration: Number(sessionForm.duration),
      sessionOrder: Number(sessionForm.sessionOrder),
      learningObjectiveIds: sessionForm.learningObjectiveIds,
      content: sessionForm.content.trim() || null,
      note: sessionForm.note.trim() || null,
    };

    setSessionSaving(true);
    setSessionFormError(null);
    try {
      if (drawerMode === "edit-session" && editSession) {
        await topicSessionApi.updateSession(editSession.id, payload);
        toast.success("Session updated");
      } else {
        await topicSessionApi.createSession(payload);
        toast.success("Session created");
      }
      const oldLessonId = editSession?.lessonId;
      closeDrawer();
      fetchSessions(targetLessonId);
      if (oldLessonId && oldLessonId !== targetLessonId) {
        fetchSessions(oldLessonId);
      }
    } catch {
      setSessionFormError("Failed to save session. Please try again.");
    } finally {
      setSessionSaving(false);
    }
  };

  /* ─── Delete session ─────────────────────────────────────── */
  const handleDeleteSession = async () => {
    if (!deletingSession) return;
    const lessonId = deletingSession.lessonId;
    try {
      await topicSessionApi.deleteSession(deletingSession.id);
      toast.success("Session deleted");
      setDeletingSession(null);
      fetchSessions(lessonId);
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSessionImport = async (file: File) => {
    if (!selectedSessionLessonId) {
      throw new Error("Please select a lesson before importing sessions.");
    }
    const result = await topicSessionApi.importSessions(selectedSessionLessonId, file);
    await fetchSessions(selectedSessionLessonId);
    return result;
  };

  const handleSessionExport = async () => {
    if (!selectedSessionLessonId) {
      toast.error("Please select a lesson before exporting sessions.");
      return;
    }

    try {
      const blob = await topicSessionApi.exportSessions(selectedSessionLessonId);
      downloadBlob(blob, `topic-sessions-${selectedSessionLessonId}.xlsx`);
      toast.success("Sessions exported");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to export sessions");
    }
  };

  const handleSessionTemplate = async () => {
    try {
      const blob = await topicSessionApi.downloadSessionTemplate();
      downloadBlob(blob, "topic-sessions-template.xlsx");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const validateImportFile = (file: File): string | null => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return "Invalid file format. Only Excel files (.xlsx, .xls) are allowed.";
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return "File size exceeds 50MB limit.";
    }

    return null;
  };

  const handleLessonImport = async (file: File) => {
    const result = await topicApi.importLessons(topicId, file);
    await fetchLessons();
    return result;
  };

  const handleLessonExport = async () => {
    try {
      const blob = await topicApi.exportLessons(topicId);
      downloadBlob(blob, `topic-lessons-${topicId}.xlsx`);
      toast.success("Lessons exported");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to export lessons");
    }
  };

  const handleLessonTemplate = async () => {
    try {
      const blob = await topicApi.downloadLessonTemplate(topicId);
      downloadBlob(blob, "topic-lessons-template.xlsx");
    } catch {
      toast.error("Failed to download lesson template");
    }
  };

  /* ─── Derived ────────────────────────────────────────────── */
  const isLessonDrawer  = drawerMode === "create-lesson" || drawerMode === "edit-lesson";
  const isSessionDrawer = drawerMode === "create-session" || drawerMode === "edit-session";

  /* ─── Render ─────────────────────────────────────────────── */
  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-700">Topic Outlines</h3>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setBatchModalOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 h-auto"
            >
              Create Batch
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setLessonImportExportOpen(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 h-auto"
            >
              <DatabaseBackup size={14} /> Import / Export
            </Button>
            <Button
              size="sm"
              onClick={openCreateLesson}
              className="flex items-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 text-xs px-3 py-1.5 h-auto"
            >
              <Plus size={14} /> Add Lesson
            </Button>
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">Loading outlines…</span>
        </div>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-20 text-red-400 gap-3">
          <span className="text-sm">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchLessons} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && !error && lessons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-gray-50 text-gray-400 gap-3">
          <BookOpen size={40} className="opacity-20" />
          <p className="text-sm">No outline configured for this topic yet.</p>
          {isEditMode && (
            <Button size="sm" onClick={openCreateLesson} className="bg-blue-600 text-white hover:bg-blue-700 text-xs">
              <Plus size={14} className="mr-1" /> Add First Lesson
            </Button>
          )}
        </div>
      )}

      {/* ── Lesson list ── */}
      {!loading && !error && lessons.length > 0 && (
        <div className="space-y-2">
          {lessons.map((lesson, idx) => {
            const isExpanded       = expandedIds.has(lesson.id);
            const sessions         = sessionsMap[lesson.id] ?? [];
            const sessionsLoading  = sessionsLoadingMap[lesson.id] ?? false;

            return (
              <div key={lesson.id} className="border border-gray-200 rounded-xl overflow-hidden">

                {/* ── Lesson header ── */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-colors group
                    ${isExpanded ? "bg-blue-50 border-b border-blue-100" : "bg-white hover:bg-gray-50"}`}
                  onClick={() => toggleExpand(lesson.id)}
                >
                  <span
                    className="text-gray-400 shrink-0 transition-transform duration-200"
                    style={{ display: "inline-block", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                  >
                    <ChevronRight size={16} />
                  </span>

                  <span className="text-xs text-gray-400 shrink-0 w-5">{idx + 1}.</span>
                  <span className="flex-1 font-semibold text-gray-900 text-sm truncate">
                    {lesson.lessonName}
                  </span>

                  {/* Action icons — visible on hover */}
                  <div
                    className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEditLesson(lesson)}
                      className="p-1.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View / Edit"
                    >
                      <Eye size={14} />
                    </button>
                    {isEditMode && (
                      <>
                        <button
                          onClick={() => openEditLesson(lesson)}
                          className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingLesson(lesson)}
                          className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ── Sessions panel (expanded) ── */}
                {isExpanded && (
                  <div className="bg-white px-4 pt-3 pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-600 tracking-wide">Sessions</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSessionLessonId(lesson.id);
                            setSessionImportExportOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <DatabaseBackup size={12} /> Import / Export
                        </button>
                        {isEditMode && (
                          <button
                            onClick={() => openCreateSession(lesson.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Plus size={12} /> Add Session
                          </button>
                        )}
                      </div>
                    </div>

                    {sessionsLoading ? (
                      <div className="text-xs text-gray-400 py-4 text-center flex items-center justify-center gap-1.5">
                        <Loader2 size={14} className="animate-spin" /> Loading sessions…
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 rounded-lg">
                        No sessions yet.{isEditMode ? " Click \"+ Add Session\" to start." : ""}
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-lg border border-gray-100">
                        {/* Table header */}
                        <div className={`grid bg-gray-50 border-b border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide ${isEditMode ? "grid-cols-[56px_1fr_148px_88px]" : "grid-cols-[56px_1fr_148px]"}`}>
                          <span>Session</span>
                          <span>Content</span>
                          <span>Type</span>
                          {isEditMode && <span className="text-right">Actions</span>}
                        </div>
                        {[...sessions]
                          .sort((a, b) => (a.sessionOrder ?? 0) - (b.sessionOrder ?? 0))
                          .map((session) => {
                            const typeLabel = session.deliveryType
                              ? (typeLabelMap.get(session.deliveryType) ?? session.deliveryType)
                              : null;
                            const typeColor = session.deliveryType
                              ? (TYPE_COLORS[session.deliveryType] ?? "bg-gray-100 text-gray-600")
                              : "";
                            return (
                              <div
                                key={session.id}
                                className={`grid items-center px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 text-sm ${isEditMode ? "grid-cols-[56px_1fr_148px_88px]" : "grid-cols-[56px_1fr_148px]"}`}
                              >
                                <span className="text-center text-xs font-medium text-gray-400">
                                  {session.sessionOrder}
                                </span>
                                <span className="truncate text-gray-800 pr-3" title={session.content ?? ""}>
                                  {session.content || "—"}
                                </span>
                                <span>
                                  {typeLabel
                                    ? <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>{typeLabel}</span>
                                    : <span className="text-gray-300 text-xs">—</span>}
                                </span>
                                {isEditMode && (
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openEditSession(session)}
                                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                      title="View session"
                                    >
                                      <Eye size={12} />
                                    </button>
                                    <button
                                      onClick={() => openEditSession(session)}
                                      className="p-1.5 rounded hover:bg-blue-100 text-gray-400 hover:text-blue-600 transition-colors"
                                      title="Edit session"
                                    >
                                      <FiEdit size={12} />
                                    </button>
                                    <button
                                      onClick={() => setDeletingSession(session)}
                                      className="p-1.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                      title="Delete session"
                                    >
                                      <FiTrash2 size={12} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════════ */}
      {/* Lesson Drawer (Create / Edit)                */}
      {/* ════════════════════════════════════════════ */}
      <Sheet open={isLessonDrawer} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="border-b px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">
                  {drawerMode === "edit-lesson" ? "Edit Lesson" : "Create Lesson"}
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-400 mt-0.5">
                  {drawerMode === "edit-lesson" ? "Update lesson information" : "Add a new lesson to this topic"}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={closeDrawer} disabled={lessonSaving} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveLesson}
                  disabled={lessonSaving}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {lessonSaving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Saving…</> : "Save"}
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lesson Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={lessonForm.lessonName}
                onChange={(e) => { setLessonForm((p) => ({ ...p, lessonName: e.target.value })); if (lessonFormError) setLessonFormError(null); }}
                placeholder="Enter lesson name"
                className={inputCls}
              />
              {lessonFormError && <p className="text-xs text-red-500">{lessonFormError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={6}
                value={lessonForm.description}
                onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Enter description (optional)"
                className={inputCls + " resize-none"}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ════════════════════════════════════════════ */}
      {/* Session Drawer (Create / Edit)               */}
      {/* ════════════════════════════════════════════ */}
      <Sheet open={isSessionDrawer} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px] flex flex-col p-0">
          <SheetHeader className="border-b px-6 py-4 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold">
                  {drawerMode === "edit-session" ? "Edit Session" : "Create Session"}
                </SheetTitle>
                <SheetDescription className="text-xs text-gray-400 mt-0.5">
                  {drawerMode === "edit-session" ? "Update session information" : "Add a new session to this lesson"}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={closeDrawer} disabled={sessionSaving} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveSession}
                  disabled={sessionSaving}
                  className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  {sessionSaving ? <><Loader2 size={13} className="animate-spin mr-1.5" />Saving…</> : "Save"}
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Lesson */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Lesson <span className="text-red-500">*</span>
              </label>
              <select
                value={sessionForm.lessonId}
                onChange={(e) => setSessionForm((p) => ({ ...p, lessonId: e.target.value }))}
                className={inputCls + " bg-white"}
              >
                <option value="">— Select lesson —</option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>{lesson.lessonName}</option>
                ))}
              </select>
            </div>

            {/* Delivery Type */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Delivery Type <span className="text-red-500">*</span>
              </label>
              <select
                value={sessionForm.deliveryType}
                onChange={(e) => {
                  setSessionForm((p) => ({ ...p, deliveryType: e.target.value }));
                  if (sessionFormError) setSessionFormError(null);
                }}
                className={inputCls + " bg-white"}
              >
                <option value="">— Select delivery type —</option>
                {DELIVERY_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {sessionFormError && <p className="text-xs text-red-500">{sessionFormError}</p>}
            </div>

            {/* Training Format */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Training Format</label>
              <select
                value={sessionForm.trainingFormat}
                onChange={(e) => setSessionForm((p) => ({ ...p, trainingFormat: e.target.value }))}
                className={inputCls + " bg-white"}
              >
                <option value="">— Select training format —</option>
                {TRAINING_FORMAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* Session Order */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">
                Session Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={sessionForm.sessionOrder}
                onChange={(e) => setSessionForm((p) => ({ ...p, sessionOrder: e.target.value }))}
                placeholder="e.g. 1"
                className={inputCls}
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                min={1}
                value={sessionForm.duration}
                onChange={(e) => setSessionForm((p) => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 60"
                className={inputCls}
              />
            </div>

            {/* Learning Objectives */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Learning Objectives</label>
              <div className="border rounded-md px-3 py-2 max-h-40 overflow-y-auto space-y-2">
                {objectives.length === 0 ? (
                  <p className="text-xs text-gray-400">No learning objectives available for this topic.</p>
                ) : (
                  objectives.map((objective) => {
                    const checked = sessionForm.learningObjectiveIds.includes(objective.id);
                    return (
                      <label key={objective.id} className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSessionForm((prev) => {
                              const next = new Set(prev.learningObjectiveIds);
                              if (e.target.checked) next.add(objective.id);
                              else next.delete(objective.id);
                              return { ...prev, learningObjectiveIds: Array.from(next) };
                            });
                          }}
                        />
                        <span>{objective.code} - {objective.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <textarea
                rows={3}
                value={sessionForm.content}
                onChange={(e) => setSessionForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Enter session content (optional)"
                className={inputCls + " resize-none"}
              />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Note</label>
              <textarea
                rows={3}
                value={sessionForm.note}
                onChange={(e) => setSessionForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="Enter note (optional)"
                className={inputCls + " resize-none"}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* ════════════════════════════════════════════ */}
      {/* Delete Confirms                              */}
      {/* ════════════════════════════════════════════ */}
      <ConfirmDeleteModal
        open={!!deletingLesson}
        title="Delete lesson?"
        message={<>Are you sure you want to delete <strong>{deletingLesson?.lessonName}</strong>? This cannot be undone.</>}
        onCancel={() => setDeletingLesson(null)}
        onConfirm={handleDeleteLesson}
      />
      <ConfirmDeleteModal
        open={!!deletingSession}
        title="Confirm delete"
        message="Are you sure you want to delete this session? This action cannot be undone."
        onCancel={() => setDeletingSession(null)}
        onConfirm={handleDeleteSession}
      />

      <ImportExportModal
        title="Topic Lessons"
        open={lessonImportExportOpen}
        setOpen={setLessonImportExportOpen}
        onImport={handleLessonImport}
        onExport={handleLessonExport}
        onDownloadTemplate={handleLessonTemplate}
        acceptedFileTypes=".xlsx,.xls"
        validateFile={validateImportFile}
      />

      <ImportExportModal
        title="Topic Sessions"
        open={sessionImportExportOpen}
        setOpen={setSessionImportExportOpen}
        onImport={handleSessionImport}
        onExport={handleSessionExport}
        onDownloadTemplate={handleSessionTemplate}
        acceptedFileTypes=".xlsx,.xls"
        validateFile={validateImportFile}
      />

      <BatchTopicOutlineModal
        open={batchModalOpen}
        topicId={topicId}
        objectives={objectives}
        onClose={() => setBatchModalOpen(false)}
        onSuccess={async () => {
          await fetchLessons();
          setExpandedIds(new Set());
          setSessionsMap({});
        }}
      />
    </div>
  );
}

type TopicBatchSessionFormItem = {
  deliveryType: string;
  trainingFormat: string;
  duration: string;
  learningObjectiveIds: string[];
  content: string;
  note: string;
};

type TopicBatchLessonFormItem = {
  lessonName: string;
  description: string;
  sessions: TopicBatchSessionFormItem[];
};

function BatchTopicOutlineModal({
  open,
  topicId,
  objectives,
  onClose,
  onSuccess,
}: {
  open: boolean;
  topicId: string;
  objectives: TopicObjective[];
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}) {
  const defaultSession = (): TopicBatchSessionFormItem => ({
    deliveryType: "",
    trainingFormat: "",
    duration: "",
    learningObjectiveIds: [],
    content: "",
    note: "",
  });

  const [lessons, setLessons] = useState<TopicBatchLessonFormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLessons([
      {
        lessonName: "",
        description: "",
        sessions: [defaultSession()],
      },
    ]);
    setCollapsed({});
    setSubmitted(false);
  }, [open]);

  if (!open) return null;

  const toggleCollapse = (idx: number) => {
    setCollapsed((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        lessonName: "",
        description: "",
        sessions: [defaultSession()],
      },
    ]);
  };

  const removeLesson = (idx: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLesson = (
    idx: number,
    field: keyof Omit<TopicBatchLessonFormItem, "sessions">,
    value: string,
  ) => {
    setLessons((prev) =>
      prev.map((lesson, i) => (i === idx ? { ...lesson, [field]: value } : lesson)),
    );
  };

  const addSession = (lessonIdx: number) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === lessonIdx
          ? { ...lesson, sessions: [...lesson.sessions, defaultSession()] }
          : lesson,
      ),
    );
  };

  const removeSession = (lessonIdx: number, sessionIdx: number) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === lessonIdx
          ? {
              ...lesson,
              sessions: lesson.sessions.filter((_, si) => si !== sessionIdx),
            }
          : lesson,
      ),
    );
  };

  const updateSession = (
    lessonIdx: number,
    sessionIdx: number,
    field: keyof TopicBatchSessionFormItem,
    value: string | string[],
  ) => {
    setLessons((prev) =>
      prev.map((lesson, i) =>
        i === lessonIdx
          ? {
              ...lesson,
              sessions: lesson.sessions.map((session, si) =>
                si === sessionIdx ? { ...session, [field]: value } : session,
              ),
            }
          : lesson,
      ),
    );
  };

  const isLessonInvalid = (lesson: TopicBatchLessonFormItem) =>
    submitted && !lesson.lessonName.trim();

  const isSessionInvalid = (session: TopicBatchSessionFormItem) =>
    submitted && (!session.deliveryType || !session.duration || Number(session.duration) <= 0);

  const handleSubmit = async () => {
    setSubmitted(true);

    if (lessons.length === 0) {
      toast.error("At least one lesson is required.");
      return;
    }

    for (const lesson of lessons) {
      if (!lesson.lessonName.trim()) {
        toast.error("Lesson Name is required for all lessons.");
        return;
      }
      if (!lesson.sessions.length) {
        toast.error("Each lesson must contain at least one session.");
        return;
      }
      for (const session of lesson.sessions) {
        if (!session.deliveryType) {
          toast.error("Delivery type is required for each session.");
          return;
        }
        if (!session.duration || Number(session.duration) <= 0) {
          toast.error("Duration must be a positive number for each session.");
          return;
        }
      }
    }

    const payloadLessons: TopicLessonBatchItem[] = lessons.map((lesson) => ({
      lessonName: lesson.lessonName.trim(),
      description: lesson.description.trim() || null,
      sessions: lesson.sessions.map((session) => ({
        deliveryType: session.deliveryType,
        trainingFormat: session.trainingFormat || null,
        duration: Number(session.duration),
        learningObjectiveIds: session.learningObjectiveIds,
        content: session.content.trim() || null,
        note: session.note.trim() || null,
      })),
    }));

    try {
      setLoading(true);
      await topicBatchOutlineApi.createBatch({
        topicId,
        lessons: payloadLessons,
      });
      toast.success("Batch lessons and sessions created successfully.");
      await onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create batch lessons and sessions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Create Batch Lessons with Sessions</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Create multiple lessons and their sessions at once. Order numbers are calculated from existing data.
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

      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-[1300px] mx-auto space-y-4">
          {lessons.map((lesson, lessonIndex) => {
            const isCollapsed = !!collapsed[lessonIndex];
            const sessionCount = lesson.sessions.length;

            return (
              <div key={lessonIndex} className="border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="px-5 py-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCollapse(lessonIndex)}
                      className="mt-1 text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Lesson Name *</label>
                          <input
                            value={lesson.lessonName}
                            onChange={(e) => updateLesson(lessonIndex, "lessonName", e.target.value)}
                            placeholder="Enter lesson name"
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              isLessonInvalid(lesson) ? "border-red-500" : "border-gray-200"
                            }`}
                          />
                        </div>
                        <div className="text-center shrink-0">
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Sessions</label>
                          <span className="inline-block text-sm font-semibold text-gray-700 py-2">
                            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                          </span>
                        </div>
                        <div className="shrink-0 flex items-end pb-0.5 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addSession(lessonIndex)}
                            className="gap-1 h-9"
                          >
                            <Plus size={14} />
                            Add Session
                          </Button>
                          {lessons.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLesson(lessonIndex)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <>
                      <div className="pl-8">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                        <input
                          value={lesson.description}
                          onChange={(e) => updateLesson(lessonIndex, "description", e.target.value)}
                          placeholder="Enter description (optional)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {sessionCount > 0 && (
                        <div className="pl-8">
                          <div className="grid grid-cols-[28px_140px_140px_120px_220px_1fr_56px] gap-3 mb-2">
                            <span />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Format</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Objectives</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</span>
                            <span />
                          </div>

                          <div className="space-y-2">
                            {lesson.sessions.map((session, sessionIndex) => (
                              <div
                                key={sessionIndex}
                                className="grid grid-cols-[28px_140px_140px_120px_220px_1fr_56px] gap-3 items-start"
                              >
                                <div className="h-9 flex items-center justify-center text-gray-400" title="Drag to reorder">
                                  <GripVertical size={14} />
                                </div>

                                <select
                                  value={session.deliveryType}
                                  onChange={(e) =>
                                    updateSession(lessonIndex, sessionIndex, "deliveryType", e.target.value)
                                  }
                                  className={`border rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isSessionInvalid(session) && !session.deliveryType ? "border-red-500" : "border-gray-200"
                                  }`}
                                >
                                  <option value="">Select delivery</option>
                                  {DELIVERY_TYPE_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  value={session.trainingFormat}
                                  onChange={(e) =>
                                    updateSession(lessonIndex, sessionIndex, "trainingFormat", e.target.value)
                                  }
                                  className="border border-gray-200 rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Optional</option>
                                  {TRAINING_FORMAT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>

                                <input
                                  type="number"
                                  min={1}
                                  value={session.duration}
                                  onChange={(e) =>
                                    updateSession(lessonIndex, sessionIndex, "duration", e.target.value)
                                  }
                                  placeholder="Minutes"
                                  className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    isSessionInvalid(session) && (!session.duration || Number(session.duration) <= 0)
                                      ? "border-red-500"
                                      : "border-gray-200"
                                  }`}
                                />

                                <select
                                  multiple
                                  value={session.learningObjectiveIds}
                                  onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
                                    updateSession(lessonIndex, sessionIndex, "learningObjectiveIds", selected);
                                  }}
                                  className="border border-gray-200 rounded-lg px-2 py-2 text-xs h-20 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {objectives.map((objective) => (
                                    <option key={objective.id} value={objective.id}>
                                      {objective.code} - {objective.name}
                                    </option>
                                  ))}
                                </select>

                                <div className="space-y-2">
                                  <input
                                    value={session.content}
                                    onChange={(e) =>
                                      updateSession(lessonIndex, sessionIndex, "content", e.target.value)
                                    }
                                    placeholder="Content"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <input
                                    value={session.note}
                                    onChange={(e) =>
                                      updateSession(lessonIndex, sessionIndex, "note", e.target.value)
                                    }
                                    placeholder="Note (optional)"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeSession(lessonIndex, sessionIndex)}
                                  className="h-9 inline-flex items-center justify-center rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
                                  disabled={lesson.sessions.length === 1}
                                  title="Delete session"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
