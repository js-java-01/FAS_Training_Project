import { useEffect, useState } from "react";
import { lessonApi, type Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import { toast } from "sonner";
import { FiPlus, FiEdit, FiTrash2, FiBook } from "react-icons/fi";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { SessionResponse } from "@/types/session";
import { SessionList } from "./SessionList";
import { SessionSidePanel, type SessionSidePanelMode } from "./SessionSidePanel";

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

// ─── Main OutlineTab ───────────────────────────────────────
export function OutlineTab({ courseId }: { courseId: string }) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState<Lesson | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Sessions
  const [activeLessonId, setActiveLessonId] = useState<string | undefined>(undefined);
  const [sessionsByLesson, setSessionsByLesson] = useState<Record<string, SessionResponse[]>>({});
  const [sessionLoadingByLesson, setSessionLoadingByLesson] = useState<Record<string, boolean>>({});
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<SessionSidePanelMode>("create");
  const [editingSession, setEditingSession] = useState<SessionResponse | null>(null);

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

  useEffect(() => {
    if (!activeLessonId) return;
    void loadSessions(activeLessonId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLessonId]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await lessonApi.delete(deleteId);
      toast.success("Lesson deleted");
      if (activeLessonId === deleteId) setActiveLessonId(undefined);
      setDeleteId(null);
      loadData();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => {
            setPanelMode("create");
            setEditingSession(null);
            setPanelOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-semibold hover:bg-emerald-700 transition-colors"
        >
          <FiPlus size={14} /> Add Session
        </button>
        <button
          onClick={() => {
            setEditLesson(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <FiPlus size={14} /> Add Lesson
        </button>
      </div>

      <Accordion
        type="single"
        collapsible
        value={activeLessonId}
        onValueChange={(v) => setActiveLessonId(v || undefined)}
        className="w-full rounded-lg border"
      >
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading lessons...</div>
        ) : lessons.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No lessons</div>
        ) : (
          lessons.map((lesson, idx) => (
            <AccordionItem key={lesson.id} value={lesson.id} className="px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex flex-1 items-start justify-between gap-3 pr-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs w-8">{idx + 1}.</span>
                      <FiBook className="text-blue-500" />
                      <span className="text-base font-semibold truncate">{lesson.lessonName}</span>
                    </div>
                    <div className="text-sm text-gray-500 truncate pl-10">{lesson.description || "-"}</div>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <ActionBtn
                      icon={<FiEdit size={14} />}
                      tooltipText="Edit"
                      className="text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditLesson(lesson);
                        setShowForm(true);
                      }}
                    />
                    <ActionBtn
                      icon={<FiTrash2 size={14} />}
                      tooltipText="Delete"
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(lesson.id);
                      }}
                    />
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="rounded-md border bg-background p-2">
                  <SessionList
                    data={sessionsByLesson[lesson.id] ?? []}
                    isLoading={sessionLoadingByLesson[lesson.id]}
                    onEdit={(s) => {
                      setPanelMode("edit");
                      setEditingSession(s);
                      setPanelOpen(true);
                    }}
                    onDeleted={() => void loadSessions(lesson.id)}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>

      <LessonFormModal
        open={showForm}
        courseId={courseId}
        initial={editLesson}
        onClose={() => { setShowForm(false); setEditLesson(null); }}
        onSuccess={loadData}
      />

      <SessionSidePanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        mode={panelMode}
        courseId={courseId}
        initialSession={editingSession}
        defaultLessonId={panelMode === "create" ? activeLessonId ?? null : null}
        onSaved={(saved) => {
          void loadSessions(saved.lessonId);
        }}
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