import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cohortApi } from "@/api/cohortApi";
import type { Cohort } from "@/api/cohortApi";
import { lessonApi } from "@/api/lessonApi";
import type { Lesson } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import type { SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";
import { materialApi } from "@/api/materialApi";
import type { Material } from "@/types/material";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  BookOpen,
  PlayCircle,
  FileText,
  CheckSquare,
  CheckCircle2,
  Circle,
  Loader2,
  Menu,
  X,
  Video,
  Radio,
  FolderKanban,
  ExternalLink,
  Film,
  Music,
  Image,
  Link as LinkIcon,
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

// ── localStorage helpers for completion tracking ──────────────────────────────
const storageKey = (cohortId: string, materialId: string) =>
  `fas_done_${cohortId}_${materialId}`;

function isMatDone(cohortId: string, materialId: string): boolean {
  return localStorage.getItem(storageKey(cohortId, materialId)) === "1";
}

function setMatDone(cohortId: string, materialId: string, done: boolean) {
  if (done) localStorage.setItem(storageKey(cohortId, materialId), "1");
  else localStorage.removeItem(storageKey(cohortId, materialId));
}

// ── URL resolver for relative backend paths ───────────────────────────────────
function resolveUrl(url: string): string {
  if (url.startsWith("/")) {
    const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
    return apiBase.replace(/\/api$/, "") + url;
  }
  return url;
}

// ── YouTube embed helper ──────────────────────────────────────────────────────
function getYouTubeEmbed(url: string): string | null {
  try {
    if (url.includes("youtube.com/watch")) {
      const v = new URL(url).searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes("youtu.be/")) {
      const v = url.split("youtu.be/")[1]?.split(/[?#]/)[0];
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes("youtube.com/shorts/")) {
      const v = url.split("youtube.com/shorts/")[1]?.split(/[?#]/)[0];
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (url.includes("youtube.com/embed/")) return url;
  } catch { /* ignore */ }
  return null;
}

// ── Single Material Item ──────────────────────────────────────────────────────
function MaterialItem({
  material,
  cohortId,
  done,
  onToggle,
}: {
  material: Material;
  cohortId: string;
  done: boolean;
  onToggle: (id: string, val: boolean) => void;
}) {
  const resolved = resolveUrl(material.sourceUrl);
  const ytEmbed = getYouTubeEmbed(resolved);

  const renderPreview = () => {
    if (ytEmbed) {
      return (
        <div className="w-full rounded-xl overflow-hidden bg-black mb-3">
          <iframe
            width="100%"
            src={ytEmbed}
            title={material.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      );
    }
    switch (material.type) {
      case "VIDEO":
        return (
          <div className="w-full rounded-xl overflow-hidden bg-black mb-3">
            <video
              controls
              className="w-full aspect-video"
              src={resolved}
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "IMAGE":
        return (
          <div className="w-full rounded-xl overflow-hidden bg-gray-100 mb-3">
            <img
              src={resolved}
              alt={material.title}
              className="w-full h-auto object-contain max-h-96"
            />
          </div>
        );
      case "AUDIO":
        return (
          <div className="w-full mb-3">
            <audio controls className="w-full" src={resolved}>
              Your browser does not support the audio tag.
            </audio>
          </div>
        );
      case "DOCUMENT":
        if (resolved.toLowerCase().endsWith(".pdf") || resolved.includes("/pdf")) {
          return (
            <div className="w-full mb-3 rounded-xl overflow-hidden border" style={{ height: 480 }}>
              <iframe src={resolved} title={material.title} className="w-full h-full" frameBorder="0" />
            </div>
          );
        }
        return (
          <a
            href={resolved}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-3 text-blue-600 hover:underline text-sm"
          >
            <ExternalLink size={14} /> Open document
          </a>
        );
      case "LINK":
        return (
          <a
            href={resolved}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-3 text-blue-600 hover:underline text-sm break-all"
          >
            <ExternalLink size={14} /> {material.sourceUrl}
          </a>
        );
      default:
        return null;
    }
  };

  const typeIconMap: Record<string, React.ElementType> = {
    VIDEO: Film,
    AUDIO: Music,
    IMAGE: Image,
    DOCUMENT: FileText,
    LINK: LinkIcon,
  };
  const TypeIcon = typeIconMap[material.type] ?? FileText;

  return (
    <div className={`rounded-xl border p-4 transition-all ${done ? "border-green-200 bg-green-50/40" : "border-gray-200 bg-white"}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TypeIcon size={16} className="text-gray-400 shrink-0" />
          <span className="font-semibold text-sm text-gray-800 truncate">{material.title}</span>
          <span className="text-xs text-gray-400 shrink-0 bg-gray-100 px-2 py-0.5 rounded-full">{material.type}</span>
        </div>
        {/* Complete toggle */}
        <button
          onClick={() => onToggle(material.id, !done)}
          className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            done
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
          }`}
        >
          {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
          {done ? "Completed" : "Mark complete"}
        </button>
      </div>

      {/* Description */}
      {material.description && (
        <p className="text-xs text-gray-500 mb-3">{material.description}</p>
      )}

      {/* Preview */}
      {renderPreview()}

      {/* Tags */}
      {material.tags && (
        <div className="flex flex-wrap gap-1 mt-2">
          {material.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
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
  completedSessionIds: Set<string>;
}

function SidebarLesson({
  item,
  idx,
  activeSessionId,
  onSelectSession,
  onExpand,
  expanded,
  completedSessionIds,
}: SidebarLessonProps) {
  const doneCount = item.sessions.filter((s) => completedSessionIds.has(s.id)).length;
  const allDone = item.sessions.length > 0 && doneCount === item.sessions.length;

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
            {doneCount}/{item.sessions.length} session{item.sessions.length !== 1 ? "s" : ""}
            {allDone && <span className="ml-1 text-green-500 font-medium">✓</span>}
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
              const isDone = completedSessionIds.has(session.id);
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
                    {isDone
                      ? <CheckCircle2 size={14} className="text-green-500" />
                      : <Circle size={14} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-medium leading-snug ${
                        isActive ? "text-blue-700" : isDone ? "text-gray-400 line-through" : "text-gray-700"
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
function SessionContent({
  session,
  cohortId,
  completedMaterials,
  onToggleMaterial,
  onMaterialsLoaded,
}: {
  session: SessionResponse;
  cohortId: string;
  completedMaterials: Set<string>;
  onToggleMaterial: (materialId: string, done: boolean) => void;
  onMaterialsLoaded: (sessionId: string, materials: Material[]) => void;
}) {
  const typeConfig = session.type ? SESSION_TYPE_CONFIG[session.type] : null;
  const Icon = typeConfig?.icon ?? FileText;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  useEffect(() => {
    if (!session.id) return;
    setLoadingMaterials(true);
    materialApi
      .getActiveMaterialsBySession(session.id)
      .then((mats) => {
        setMaterials(mats);
        onMaterialsLoaded(session.id, mats);
      })
      .catch(() => toast.error("Failed to load materials"))
      .finally(() => setLoadingMaterials(false));
  }, [session.id]);

  const doneCount = materials.filter((m) => completedMaterials.has(m.id)).length;

  const renderMaterials = () => {
    if (loadingMaterials) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
          <Loader2 size={16} className="animate-spin" /> Loading materials...
        </div>
      );
    }
    if (materials.length === 0) {
      return (
        <div className="text-sm text-gray-400 text-center py-8 border border-dashed rounded-xl">
          No materials for this session yet.
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${materials.length > 0 ? (doneCount / materials.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 shrink-0">
            {doneCount}/{materials.length} completed
          </span>
        </div>

        {materials.map((mat) => (
          <MaterialItem
            key={mat.id}
            material={mat}
            cohortId={cohortId}
            done={completedMaterials.has(mat.id)}
            onToggle={onToggleMaterial}
          />
        ))}
      </div>
    );
  };

  if (session.type === "QUIZ") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
          <span>{typeConfig?.label ?? "Session"}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{session.topic}</h1>
        {session.studentTasks && (
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{session.studentTasks}</p>
          </div>
        )}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center mb-6">
          <CheckSquare size={40} className="text-orange-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-4">This quiz tests your understanding of the material covered so far.</p>
          <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
            Start Quiz
          </button>
        </div>
        <h2 className="text-base font-bold text-gray-800 mb-3">Materials</h2>
        {renderMaterials()}
      </div>
    );
  }

  if (session.type === "ASSIGNMENT") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
          <span>{typeConfig?.label ?? "Session"}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{session.topic}</h1>
        {session.studentTasks && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{session.studentTasks}</p>
          </div>
        )}
        <button className="mb-6 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
          Start Assignment
        </button>
        <h2 className="text-base font-bold text-gray-800 mb-3">Materials</h2>
        {renderMaterials()}
      </div>
    );
  }

  if (session.type === "PROJECT") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
          <span>{typeConfig?.label ?? "Session"}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{session.topic}</h1>
        {session.studentTasks && (
          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 mb-4">
            <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{session.studentTasks}</p>
          </div>
        )}
        <button className="mb-6 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors">
          Start Project
        </button>
        <h2 className="text-base font-bold text-gray-800 mb-3">Materials</h2>
        {renderMaterials()}
      </div>
    );
  }

  // VIDEO_LECTURE, LIVE_SESSION, default
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Icon size={14} className={typeConfig?.color ?? "text-gray-400"} />
        <span>{typeConfig?.label ?? "Session"}</span>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{session.topic}</h1>
      {session.studentTasks && (
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Student Tasks</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{session.studentTasks}</p>
        </div>
      )}
      <h2 className="text-base font-bold text-gray-800 mb-3">Materials</h2>
      {renderMaterials()}
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
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Lessons + Sessions data
  const [lessonItems, setLessonItems] = useState<LessonWithSessions[]>([]);
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SessionResponse | null>(null);

  // Material completion tracking (persisted in localStorage)
  const [completedMaterialIds, setCompletedMaterialIds] = useState<Set<string>>(new Set());
  // Track which materials belong to which session (populated lazily as sessions are viewed)
  const [sessionMaterialsMap, setSessionMaterialsMap] = useState<Map<string, Material[]>>(new Map());

  // Initialize completedMaterialIds from localStorage when cohortId is known
  useEffect(() => {
    if (!cohortId) return;
    const saved = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(`fas_done_${cohortId}_`) && localStorage.getItem(k) === "1") {
        saved.add(k.replace(`fas_done_${cohortId}_`, ""));
      }
    }
    setCompletedMaterialIds(saved);
  }, [cohortId]);

  // Derive completed session IDs: a session is complete when all its materials are done (min 1 material)
  const completedSessionIds = useCallback((): Set<string> => {
    const result = new Set<string>();
    sessionMaterialsMap.forEach((mats, sessionId) => {
      if (mats.length > 0 && mats.every((m) => completedMaterialIds.has(m.id))) {
        result.add(sessionId);
      }
    });
    return result;
  }, [sessionMaterialsMap, completedMaterialIds])();

  const handleToggleMaterial = useCallback((materialId: string, done: boolean) => {
    if (!cohortId) return;
    setMatDone(cohortId, materialId, done);
    setCompletedMaterialIds((prev) => {
      const next = new Set(prev);
      if (done) next.add(materialId);
      else next.delete(materialId);
      return next;
    });
  }, [cohortId]);

  // Called by SessionContent when it loads materials for a session
  const handleMaterialsLoaded = useCallback((sessionId: string, materials: Material[]) => {
    setSessionMaterialsMap((prev) => {
      const next = new Map(prev);
      next.set(sessionId, materials);
      return next;
    });
  }, []);

  // Load cohort
  useEffect(() => {
    if (!cohortId) return;
    cohortApi
      .getById(cohortId)
      .then(setCohort)
      .catch(() => toast.error("Failed to load cohort"))
      .finally(() => setLoading(false));
  }, [cohortId]);

  // Load lessons when cohort is loaded (courseId available)
  useEffect(() => {
    if (!cohort?.courseId) return;
    lessonApi
      .getByCourseId(cohort.courseId)
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
  }, [cohort?.courseId]);

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

  const courseName = cohort?.courseName || "Course Learning";

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
          {cohort?.code && (
            <span className="text-xs text-gray-400 ml-2">{cohort.code}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500">
            {lessonItems.length} lesson{lessonItems.length !== 1 ? "s" : ""} ·{" "}
            {totalSessions} session{totalSessions !== 1 ? "s" : ""}
          </span>
          {completedSessionIds.size > 0 && (
            <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              {completedSessionIds.size}/{totalSessions} done
            </span>
          )}
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
                    completedSessionIds={completedSessionIds}
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
              <SessionContent
                session={activeSession}
                cohortId={cohortId!}
                completedMaterials={completedMaterialIds}
                onToggleMaterial={handleToggleMaterial}
                onMaterialsLoaded={handleMaterialsLoaded}
              />
            ) : (
              <EmptyContent />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
