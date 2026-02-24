import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { cohortApi } from "@/api/cohortApi";
import type { Cohort } from "@/api/cohortApi";
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
  Clock,
  Lock,
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────
type LessonType = "video" | "reading" | "quiz" | "assignment";

interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  duration: string;
  completed: boolean;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  locked?: boolean;
}

const MOCK_MODULES: Module[] = [
  {
    id: "m1",
    title: "Course Introduction",
    lessons: [
      {
        id: "l1",
        title: "Course Introduction Video",
        type: "video",
        duration: "37 sec",
        completed: true,
        content: `
## Welcome to the Course!

This is the introductory video that walks you through what you will learn in this course. We cover the overall structure, learning objectives, and how to make the most of your learning experience.

**Key topics covered in this course:**
- Core fundamentals and vocabulary
- Practical application and projects
- Assessment and certification

Get ready for an exciting learning journey!
        `,
      },
      {
        id: "l2",
        title: "Writing Levels Overview",
        type: "reading",
        duration: "10 min",
        completed: true,
        content: `
## Writing Levels Overview

Understanding different levels of writing helps you communicate more effectively. In this reading, we explore the key differences between beginner, intermediate, and advanced levels.

### Beginner Level
- Focus on basic vocabulary and sentence structure
- Simple paragraphs with clear topic sentences
- Understanding audience and purpose

### Intermediate Level
- Complex sentence structures
- Paragraph cohesion and flow
- Introduction to argument and evidence

### Advanced Level
- Nuanced argumentation
- Rhetorical strategies
- Academic and professional writing standards

Take your time with this reading and make notes as you go. This foundation will support everything that follows in the course.
        `,
      },
      {
        id: "l3",
        title: "Message about Opinions",
        type: "reading",
        duration: "10 min",
        completed: false,
        content: `
## Message About Opinions

Forming and expressing opinions is a critical skill in academic writing. This reading introduces key strategies for:

1. **Identifying your position** — What do you believe? Why?
2. **Supporting your view** — Using evidence and reasoning
3. **Acknowledging counter-arguments** — The mark of a sophisticated writer

### Practice Exercise
Think about a topic you feel strongly about. Write 2–3 sentences expressing your opinion, then write 1–2 sentences acknowledging an opposing view.

This will be used in the upcoming peer review assignment.
        `,
      },
      {
        id: "l4",
        title: "Message About Peer Reviews",
        type: "reading",
        duration: "10 min",
        completed: false,
        content: `
## Message About Peer Reviews

Peer review is one of the most valuable parts of this course. Giving and receiving feedback helps everyone improve.

### How Peer Reviews Work
- You submit your assignment by the deadline
- The system assigns you 3 peers to review
- You provide structured feedback using the rubric
- You receive feedback from 3 reviewers

### Tips for Good Peer Reviews
- Be specific and constructive
- Use the rubric criteria
- Offer suggestions, not just criticism
- Be respectful and professional
        `,
      },
    ],
  },
  {
    id: "m2",
    title: "Module 1: Foundations",
    lessons: [
      {
        id: "l5",
        title: "Introduction to Core Concepts",
        type: "video",
        duration: "12 min",
        completed: false,
        content: "Content for Module 1 Lesson 1...",
      },
      {
        id: "l6",
        title: "Key Terminology",
        type: "reading",
        duration: "15 min",
        completed: false,
        content: "Content for Module 1 Lesson 2...",
      },
      {
        id: "l7",
        title: "Practice Quiz",
        type: "quiz",
        duration: "20 min",
        completed: false,
        content: "Quiz content...",
      },
      {
        id: "l8",
        title: "Foundations Assignment",
        type: "assignment",
        duration: "1 hour",
        completed: false,
        content: "Assignment content...",
      },
    ],
  },
  {
    id: "m3",
    title: "Module 2: Core Skills",
    locked: true,
    lessons: [
      {
        id: "l9",
        title: "Applied Techniques",
        type: "video",
        duration: "18 min",
        completed: false,
        content: "",
      },
      {
        id: "l10",
        title: "Case Studies",
        type: "reading",
        duration: "25 min",
        completed: false,
        content: "",
      },
      {
        id: "l11",
        title: "Practical Exercise",
        type: "assignment",
        duration: "2 hours",
        completed: false,
        content: "",
      },
    ],
  },
  {
    id: "m4",
    title: "Module 3: Advanced Topics",
    locked: true,
    lessons: [
      {
        id: "l12",
        title: "Advanced Patterns",
        type: "video",
        duration: "22 min",
        completed: false,
        content: "",
      },
      {
        id: "l13",
        title: "Final Assessment",
        type: "quiz",
        duration: "45 min",
        completed: false,
        content: "",
      },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const LESSON_TYPE_CONFIG: Record<
  LessonType,
  { icon: React.ElementType; color: string; label: string }
> = {
  video: { icon: PlayCircle, color: "text-blue-500", label: "Video" },
  reading: { icon: FileText, color: "text-green-500", label: "Reading" },
  quiz: { icon: CheckSquare, color: "text-orange-500", label: "Quiz" },
  assignment: { icon: BookOpen, color: "text-purple-500", label: "Assignment" },
};

function LessonIcon({ type }: { type: LessonType }) {
  const config = LESSON_TYPE_CONFIG[type];
  const Icon = config.icon;
  return <Icon size={14} className={config.color} />;
}

// ── Sidebar Item ──────────────────────────────────────────────────────────────
interface SidebarModuleProps {
  module: Module;
  activeLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  defaultOpen?: boolean;
}

function SidebarModule({
  module,
  activeLesson,
  onSelectLesson,
  defaultOpen = false,
}: SidebarModuleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = module.lessons.filter((l) => l.completed).length;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => !module.locked && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors group ${
          module.locked ? "cursor-not-allowed opacity-60" : ""
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {module.title}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {module.locked
              ? "Complete previous module to unlock"
              : `${completedCount}/${module.lessons.length} completed`}
          </p>
        </div>
        {module.locked ? (
          <Lock size={14} className="text-gray-300 ml-2 shrink-0" />
        ) : open ? (
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

      {open && !module.locked && (
        <div className="bg-gray-50/50">
          {module.lessons.map((lesson) => {
            const isActive = activeLesson?.id === lesson.id;
            return (
              <button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-l-2 ${
                  isActive
                    ? "bg-blue-50 border-l-blue-500"
                    : "border-l-transparent hover:bg-gray-100"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {lesson.completed ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <Circle size={14} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-snug ${
                      isActive ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {lesson.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <LessonIcon type={lesson.type} />
                    <span className="text-xs text-gray-400 capitalize">
                      {LESSON_TYPE_CONFIG[lesson.type].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      · {lesson.duration}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Content Renderer ──────────────────────────────────────────────────────────
function LessonContent({ lesson }: { lesson: Lesson }) {
  const config = LESSON_TYPE_CONFIG[lesson.type];
  const Icon = config.icon;

  if (lesson.type === "quiz") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 text-center">
          <CheckSquare size={48} className="text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {lesson.title}
          </h2>
          <p className="text-gray-500 mb-6">
            This quiz tests your understanding of the material covered so far.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {lesson.duration}
            </span>
            <span>10 questions</span>
            <span>Multiple choice</span>
          </div>
          <button className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors">
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (lesson.type === "assignment") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={28} className="text-purple-500" />
            <h2 className="text-xl font-bold text-gray-900">{lesson.title}</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Complete this assignment to demonstrate your understanding. Submit
            your work before the deadline and receive peer feedback.
          </p>
          <div className="bg-white rounded-xl p-4 border border-purple-100 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Review all materials from this module</li>
              <li>Complete the written assignment (500–800 words)</li>
              <li>Submit before the deadline</li>
              <li>Review 3 peers' submissions after submitting</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
              Start Assignment
            </button>
            <button className="px-4 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              View Rubric
            </button>
          </div>
        </div>
      </div>
    );
  }

  // video or reading
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
        <Icon size={14} className={config.color} />
        <span className="capitalize">{config.label}</span>
        <span>·</span>
        <Clock size={13} />
        <span>{lesson.duration}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{lesson.title}</h1>

      {lesson.type === "video" && (
        <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center mb-6 shadow-lg">
          <div className="text-center text-white">
            <PlayCircle size={64} className="mx-auto mb-3 text-white/70" />
            <p className="text-white/60 text-sm">
              Video content / {lesson.duration}
            </p>
          </div>
        </div>
      )}

      {lesson.content && (
        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
          {lesson.content
            .trim()
            .split("\n\n")
            .map((block, i) => {
              if (block.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    className="text-lg font-bold text-gray-900 mt-6 mb-2"
                  >
                    {block.slice(3)}
                  </h2>
                );
              }
              if (block.startsWith("### ")) {
                return (
                  <h3
                    key={i}
                    className="text-base font-semibold text-gray-800 mt-4 mb-1"
                  >
                    {block.slice(4)}
                  </h3>
                );
              }
              if (block.startsWith("1. ") || block.startsWith("- ")) {
                const items = block.split("\n").filter(Boolean);
                return (
                  <ul
                    key={i}
                    className="list-disc list-inside space-y-1 text-gray-600"
                  >
                    {items.map((item, j) => (
                      <li key={j}>{item.replace(/^[0-9]+\. |- /, "")}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-gray-600">
                  {block.replace(/\*\*(.+?)\*\*/g, "$1")}
                </p>
              );
            })}
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
        <button className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1.5">
          <ChevronLeft size={14} />
          Previous
        </button>
        <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
          Mark as Complete & Continue
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentCourseContent() {
  const { cohortId } = useParams<{ cohortId: string }>();
  const navigate = useNavigate();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson>(
    MOCK_MODULES[0].lessons[0],
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // compute progress
  const totalLessons = MOCK_MODULES.flatMap((m) => m.lessons).length;
  const completedLessons = MOCK_MODULES.flatMap((m) => m.lessons).filter(
    (l) => l.completed,
  ).length;
  const progressPct = Math.round((completedLessons / totalLessons) * 100);

  useEffect(() => {
    if (!cohortId) return;
    cohortApi
      .getById(cohortId)
      .then(setCohort)
      .catch(() => toast.error("Failed to load cohort"))
      .finally(() => setLoading(false));
  }, [cohortId]);

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

        {/* Progress */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-gray-500">
              {completedLessons}/{totalLessons} completed
            </span>
            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-0.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
            {progressPct}%
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
                  Course Material
                </h2>
              </div>

              {/* Modules */}
              {MOCK_MODULES.map((module, idx) => (
                <SidebarModule
                  key={module.id}
                  module={module}
                  activeLesson={activeLesson}
                  onSelectLesson={(lesson) => {
                    setActiveLesson(lesson);
                    // On mobile close sidebar
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                  defaultOpen={idx === 0}
                />
              ))}
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 sm:p-10">
            <LessonContent lesson={activeLesson} />
          </div>
        </main>
      </div>
    </div>
  );
}
