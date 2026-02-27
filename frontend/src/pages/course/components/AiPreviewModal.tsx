import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import {
  batchOutlineApi,
  type AiPreviewLessonResponse,
} from "@/api/batchOutlineApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// Session type display labels
const TYPE_COLORS: Record<string, string> = {
  VIDEO_LECTURE: "bg-blue-100 text-blue-700",
  LIVE_SESSION: "bg-green-100 text-green-700",
  QUIZ: "bg-yellow-100 text-yellow-700",
  ASSIGNMENT: "bg-orange-100 text-orange-700",
  PROJECT: "bg-purple-100 text-purple-700",
};

const TYPE_LABELS: Record<string, string> = {
  VIDEO_LECTURE: "Video Lecture",
  LIVE_SESSION: "Live Session",
  QUIZ: "Quiz",
  ASSIGNMENT: "Assignment",
  PROJECT: "Project",
};

interface CourseInfo {
  id: string;
  courseName: string;
  courseCode: string;
  description?: string;
}

interface AiPreviewModalProps {
  open: boolean;
  onClose: () => void;
  onApplied: () => void;
  course: CourseInfo;
}

export function AiPreviewModal({
  open,
  onClose,
  onApplied,
  course,
}: AiPreviewModalProps) {
  const [lessons, setLessons] = useState<AiPreviewLessonResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (open) {
      setLessons([]);
      setExpandedIdx(new Set());
      fetchPreview();
    }
  }, [open]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const data = await batchOutlineApi.generateAiPreview(course.id);
      setLessons(data);
      // Expand all by default
      setExpandedIdx(new Set(data.map((_, i) => i)));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to generate AI preview",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleApply = async () => {
    try {
      setApplying(true);
      await batchOutlineApi.applyAiPreview(course.id, { lessons });
      toast.success("AI-generated outline applied successfully");
      onApplied();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to apply AI preview");
    } finally {
      setApplying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Header ── */}
      <div className="px-8 pt-6 pb-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">
            AI Preview - Auto Generate Learning Path
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Use AI to automatically generate learning path (lessons and sessions)
          for this course.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="h-10 w-10 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <p className="text-sm text-gray-500">
                AI is generating learning path...
              </p>
            </div>
          ) : (
            <>
              {/* Course Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                      {course.courseName}
                    </h2>
                    <p className="text-sm text-gray-500 mb-3">
                      {course.courseCode}
                    </p>
                    {course.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400 mb-1">Total lessons</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {lessons.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {lessons.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-300 rounded-xl">
                  No lessons generated.
                </div>
              ) : (
                lessons.map((lesson, li) => {
                  const isExpanded = expandedIdx.has(li);
                  const sessionCount = lesson.sessions?.length ?? 0;
                  return (
                    <div
                      key={li}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                    >
                      {/* Lesson Header */}
                      <button
                        type="button"
                        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                        onClick={() => toggleLesson(li)}
                      >
                        <span className="text-gray-400 shrink-0">
                          {isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </span>
                        <span className="flex-1 font-semibold text-gray-900">
                          Lesson {li + 1}: {lesson.name}
                        </span>
                        <span className="text-xs text-gray-400 shrink-0">
                          {sessionCount} session{sessionCount !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {/* Lesson description */}
                      {isExpanded && lesson.description && (
                        <div className="px-5 pb-2 text-sm text-gray-500 border-t border-gray-50 pt-2">
                          {lesson.description}
                        </div>
                      )}

                      {/* Sessions */}
                      {isExpanded && sessionCount > 0 && (
                        <div className="px-5 pb-4 space-y-2">
                          {lesson.sessions!.map((session, si) => {
                            const typeColor =
                              TYPE_COLORS[session.type ?? ""] ??
                              "bg-gray-100 text-gray-600";
                            const typeLabel =
                              TYPE_LABELS[session.type ?? ""] ??
                              session.type ??
                              "";
                            return (
                              <div
                                key={si}
                                className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-700">
                                    Session {si + 1}
                                  </span>
                                  {typeLabel && (
                                    <span
                                      className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}
                                    >
                                      {typeLabel}
                                    </span>
                                  )}
                                </div>
                                {session.topic && (
                                  <p className="text-sm text-gray-800 leading-snug">
                                    {session.topic}
                                  </p>
                                )}
                                {session.studentTask && (
                                  <p className="text-xs text-gray-400 italic mt-1">
                                    Tasks: {session.studentTask}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Actions ── */}
      <div className="px-8 py-4 border-t bg-white shrink-0 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={applying}>
          Cancel
        </Button>
        <Button
          onClick={handleApply}
          disabled={loading || applying || lessons.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {applying ? "Applying..." : "Apply Preview"}
        </Button>
      </div>
    </div>
  );
}
