import { useEffect, useState } from "react";
import { BookOpen, Clock, FileText, LayoutList, Target } from "lucide-react";
import { lessonApi } from "@/api/lessonApi";
import { sessionService } from "@/api/sessionService";
import { courseApi } from "@/api/courseApi";
import type { SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";

interface Props {
  courseId: string;
}

const TYPE_COLORS: Record<string, string> = {
  VIDEO_LECTURE: "#3b82f6", // blue-500
  LIVE_SESSION: "#22c55e", // green-500
  QUIZ: "#f59e0b", // amber-500
  ASSIGNMENT: "#a855f7", // purple-500
  PROJECT: "#f97316", // orange-500
};

const TYPE_BG: Record<string, string> = {
  VIDEO_LECTURE: "bg-blue-100 text-blue-700",
  LIVE_SESSION: "bg-green-100 text-green-700",
  QUIZ: "bg-amber-100 text-amber-700",
  ASSIGNMENT: "bg-purple-100 text-purple-700",
  PROJECT: "bg-orange-100 text-orange-700",
};

interface TypeStat {
  type: string;
  label: string;
  count: number;
  minutes: number;
  color: string;
  bgClass: string;
}

// ── Stacked Bar Segment ────────────────────────────────────────────────────────
function Bar({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label: string;
}) {
  if (pct <= 0) return null;
  return (
    <div
      title={`${label}: ${pct.toFixed(1)}%`}
      style={{ width: `${pct}%`, background: color }}
      className="transition-all"
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export function TimeAllocationTab({ courseId }: Props) {
  const [loading, setLoading] = useState(true);
  const [lessonCount, setLessonCount] = useState(0);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [objectiveCount, setObjectiveCount] = useState(0);
  const [loadedAt] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [lessons, objectives] = await Promise.all([
          lessonApi.getByCourseId(courseId),
          courseApi.getObjectivesByCourse(courseId),
        ]);

        if (cancelled) return;
        setLessonCount(lessons.length);
        setObjectiveCount(objectives.length);

        // fetch sessions for each lesson in parallel
        const sessionArrays = await Promise.all(
          lessons.map((l) => sessionService.getSessionsByLesson(l.id)),
        );
        if (!cancelled) {
          setSessions(sessionArrays.flat());
        }
      } catch {
        // silently fail — leave zeros
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  // ── derived stats ─────────────────────────────────────
  const typeStats: TypeStat[] = SESSION_TYPE_OPTIONS.map(({ value, label }) => {
    const subset = sessions.filter((s) => s.type === value);
    return {
      type: value,
      label,
      count: subset.length,
      minutes: subset.reduce((sum, s) => sum + (s.duration ?? 0), 0),
      color: TYPE_COLORS[value] ?? "#9ca3af",
      bgClass: TYPE_BG[value] ?? "bg-gray-100 text-gray-700",
    };
  });

  const totalSessions = sessions.length;
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);

  const summaryCards = [
    {
      label: "Lessons",
      value: lessonCount,
      icon: <LayoutList className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Sessions",
      value: totalSessions,
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Objectives",
      value: objectiveCount,
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Duration",
      value: `${totalMinutes} min`,
      icon: <Clock className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
        <FileText className="w-4 h-4 animate-pulse" />
        Loading time allocation data…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3"
          >
            <div className={`${card.bg} ${card.color} rounded-lg p-2 shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-lg font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Stacked Bar + Legend ── */}
      <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-800">
              Session Distribution
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
              {totalSessions} sessions
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
              {totalMinutes} min
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {totalSessions === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
              <BookOpen className="w-8 h-8" />
              <p className="text-sm">No sessions found for this course.</p>
            </div>
          ) : (
            <>
              {/* ── Stacked bar ── */}
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                {typeStats.map((s) => (
                  <Bar
                    key={s.type}
                    pct={(s.count / totalSessions) * 100}
                    color={s.color}
                    label={s.label}
                  />
                ))}
              </div>

              {/* ── Legend ── */}
              <div className="space-y-4">
                {typeStats
                  .filter((s) => s.count > 0)
                  .map((s) => {
                    const pct = (s.count / totalSessions) * 100;

                    return (
                      <div key={s.type} className="space-y-1.5">
                        {/* top row */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: s.color }}
                            />

                            <span className="font-medium text-gray-700 truncate">
                              {s.label}
                            </span>

                            <span className="text-xs text-gray-400">
                              {s.minutes > 0 && `• ${s.minutes} min`}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${s.bgClass}`}
                            >
                              {s.count}
                            </span>
                            <span className="w-10 text-right font-semibold text-gray-600">
                              {pct.toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* progress */}
                        <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: s.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="text-xs text-gray-400 text-right">
        Last updated: {loadedAt.toLocaleString()}
      </p>
    </div>
  );
}
