import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { courseApi } from "@/api/courseApi";
import type { Course } from "@/types/course";
import { lessonApi } from "@/api/lessonApi";
import type { Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import type { SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PlayCircle,
  FileText,
  CheckSquare,
  Circle,
  Loader2,
  Menu,
  X,
  Video,
  Radio,
  FolderKanban,
} from "lucide-react";

// ── Type helpers ──────────────────────────────────────────────────────────────
const SESSION_TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  VIDEO_LECTURE: {
    icon: Video,
    color: "text-blue-500",
    label: "Video Lecture",
  },
  LIVE_SESSION: {
    icon: Radio,
    color: "text-emerald-500",
    label: "Live Session",
  },
  QUIZ: { icon: CheckSquare, color: "text-orange-500", label: "Quiz" },
  ASSIGNMENT: { icon: BookOpen, color: "text-purple-500", label: "Assignment" },
  PROJECT: {
    icon: FolderKanban,
    color: "text-indigo-500",
    label: "Project",
  },
};

const typeLabelMap = new Map<string, string>(
  SESSION_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

function SessionIcon({ type }: { type: string | null }) {
  const config = type ? SESSION_TYPE_CONFIG[type] : null;
  const Icon = config?.icon ?? FileText;
  return <Icon size={14} className={config?.color ?? "text-gray-400"} />;
}

// ── Lesson + Sessions combined type ───────────────────────────────────────────
interface LessonWithSessions {
  lesson: Lesson;
  sessions: SessionResponse[];
  loadingSessions: boolean;
}

// ── Sidebar Lesson Accordion ──────────────────────────────────────────────────
interface SidebarLessonProps {
  item: LessonWithSessions;
  idx: number;
  activeSessionId: string | null;
  onSelectSession: (session: SessionResponse) => void;
  onExpand: () => void;
  expanded: boolean;
}

function SidebarLesson({
  item,
  idx,
  activeSessionId,
  onSelectSession,
  onExpand,
  expanded,
}: SidebarLessonProps) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onExpand}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {idx + 1}. {item.lesson.lessonName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {item.sessions.length} session
            {item.sessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        {expanded ? (
          <ChevronDown
            size={15}
            className="text-gray-400 ml-2 shrink-0 transition-transform"
          />
        ) : (
          <ChevronRight
            size={15}
            className="text-gray-400 ml-2 shrink-0 transition-transform"
          />
        )}
      </button>

      {expanded && (
        <div className="bg-gray-50/50">
          {item.loadingSessions ? (
            <div className="flex items-center gap-2 px-6 py-3 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" /> Loading sessions...
            </div>
          ) : item.sessions.length === 0 ? (
            <div className="px-6 py-3 text-xs text-gray-400">
              No sessions yet
            </div>
          ) : (
            item.sessions.map((session) => {
              const isActive = activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                    isActive
                      ? "bg-blue-50 border-l-blue-500"
                      : "border-l-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <Circle size={14} className="text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug ${
                        isActive ? "text-blue-700" : "text-gray-700"
                      }`}
                    >
                      {session.topic || "Untitled Session"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <SessionIcon type={session.type} />
                      <span className="text-xs text-gray-400">
                        {session.type
                          ? (typeLabelMap.get(session.type) ?? session.type)
                          : "Session"}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ── Session Content Renderer ──────────────────────────────────────────────────
function SessionContent({ session }: { session: SessionResponse }) {
  const typeConfig = session.type ? SESSION_TYPE_CONFIG[session.type] : null;
  const Icon = typeConfig?.icon ?? FileText;

  if (session.type === "QUIZ") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <CheckSquare size={48} className="text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {session.topic}
          </h2>
          <p className="text-gray-500 mb-6">
            This quiz tests your understanding of the material covered so far.
          </p>
          <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (session.type === "ASSIGNMENT") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={28} className="text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">{session.topic}</h2>
          </div>
          {session.studentTasks && (
            <div className="bg-white rounded-xl p-4 border border-purple-100 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Student Tasks
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {session.studentTasks}
              </p>
            </div>
          )}
          <button className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
            Start Assignment
          </button>
        </div>
      </div>
    );
  }

  if (session.type === "PROJECT") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <FolderKanban size={28} className="text-indigo-500" />
            <h2 className="text-xl font-bold text-gray-900">{session.topic}</h2>
          </div>
          {session.studentTasks && (
            <div className="bg-white rounded-xl p-4 border border-indigo-100 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">
                Student Tasks
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {session.studentTasks}
              </p>
            </div>
          )}
          <button className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
            Start Project
          </button>
        </div>
      </div>
    );
  }

  if (session.type === "VIDEO_LECTURE") {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
          <span>{typeConfig?.label ?? "Session"}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {session.topic}
        </h1>
        <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center mb-6 shadow-lg">
          <div className="text-center text-white">
            <PlayCircle size={64} className="mx-auto mb-3 text-white/70" />
            <p className="text-white/60 text-sm">Video Lecture</p>
          </div>
        </div>
        {session.studentTasks && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {session.studentTasks}
            </p>
          </div>
        )}
      </div>
    );
  }

  // LIVE_SESSION or default
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
        <span>{typeConfig?.label ?? "Session"}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{session.topic}</h1>
      {session.studentTasks && (
        <div className="bg-gray-50 rounded-xl p-6 border">
          <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {session.studentTasks}
          </p>
        </div>
      )}
      {!session.studentTasks && (
        <div className="text-sm text-gray-400 text-center py-12">
          No content available for this session yet.
        </div>
      )}
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyContent() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <BookOpen size={48} className="mb-4 text-gray-300" />
      <p className="text-lg font-semibold text-gray-500">
        Select a session to start learning
      </p>
      <p className="text-sm mt-1">
        Choose a lesson from the sidebar and click on a session
      </p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentCourseContent() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Lessons + Sessions data
  const [lessonItems, setLessonItems] = useState<LessonWithSessions[]>([]);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SessionResponse | null>(
    null,
  );

  // Load course
  useEffect(() => {
    if (!courseId) return;
    courseApi
      .getCourseById(courseId)
      .then(setCourse)
      .catch(() => toast.error("Failed to load course"))
      .finally(() => setLoading(false));
  }, [courseId]);

  // Load lessons when course is loaded (courseId available)
  useEffect(() => {
    if (!courseId) return;
    lessonApi
      .getByCourseId(courseId)
      .then((lessons) => {
        const items: LessonWithSessions[] = lessons.map((l) => ({
          lesson: l,
          sessions: [],
          loadingSessions: false,
        }));
        setLessonItems(items);
        // Auto-expand first lesson
        if (items.length > 0) {
          setExpandedLessonId(items[0].lesson.id);
          loadSessionsForLesson(items[0].lesson.id);
        }
      })
      .catch(() => toast.error("Failed to load course lessons"));
  }, [courseId]);

  const loadSessionsForLesson = async (lessonId: string) => {
    setLessonItems((prev) =>
      prev.map((it) =>
        it.lesson.id === lessonId ? { ...it, loadingSessions: true } : it,
      ),
    );
    try {
      const sessions = await sessionService.getSessionsByLesson(lessonId);
      setLessonItems((prev) =>
        prev.map((it) =>
          it.lesson.id === lessonId
            ? { ...it, sessions, loadingSessions: false }
            : it,
        ),
      );
      // Auto-select first session if none active
      setActiveSession((cur) => {
        if (!cur && sessions.length > 0) return sessions[0];
        return cur;
      });
    } catch {
      setLessonItems((prev) =>
        prev.map((it) =>
          it.lesson.id === lessonId ? { ...it, loadingSessions: false } : it,
        ),
      );
    }
  };

  const handleExpandLesson = (lessonId: string) => {
    const next = expandedLessonId === lessonId ? null : lessonId;
    setExpandedLessonId(next);
    if (next) {
      const item = lessonItems.find((it) => it.lesson.id === next);
      if (item && item.sessions.length === 0 && !item.loadingSessions) {
        loadSessionsForLesson(next);
      }
    }
  };

  const totalSessions = lessonItems.reduce(
    (acc, it) => acc + it.sessions.length,
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        <Loader2 className="animate-spin mr-2" size={24} />
        Loading course...
      </div>
    );
  }

  const courseName = course?.courseName || "Course Learning";

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      {/* ── Top bar ── */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 shadow-sm z-20">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm transition-colors shrink-0"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Catalog</span>
        </button>

        <div className="h-5 w-px bg-gray-200 shrink-0" />

        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-900 text-sm truncate">
            {courseName}
          </span>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">
            {lessonItems.length} lesson{lessonItems.length !== 1 ? "s" : ""} ·{" "}
            {totalSessions} session{totalSessions !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`shrink-0 bg-white border-r border-gray-100 overflow-y-auto transition-all duration-200 ${
            sidebarOpen ? "w-72" : "w-0 border-0"
          }`}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar header */}
              <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-sm font-bold text-gray-700">
                  Course Content
                </h2>
              </div>

              {/* Lessons */}
              {lessonItems.length === 0 ? (
                <div className="px-4 py-6 text-xs text-gray-400 text-center">
                  No lessons available yet.
                </div>
              ) : (
                lessonItems.map((item, idx) => (
                  <SidebarLesson
                    key={item.lesson.id}
                    item={item}
                    idx={idx}
                    activeSessionId={activeSession?.id ?? null}
                    onSelectSession={(session) => {
                      setActiveSession(session);
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    onExpand={() => handleExpandLesson(item.lesson.id)}
                    expanded={expandedLessonId === item.lesson.id}
                  />
                ))
              )}
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-10">
            {activeSession ? (
              <SessionContent session={activeSession} />
            ) : (
              <EmptyContent />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
