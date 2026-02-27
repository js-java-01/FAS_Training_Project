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

// ── SVG Donut Chart ────────────────────────────────────────────────────────────
function DonutChart({ stats, total }: { stats: TypeStat[]; total: number }) {
  const R = 80;
  const CX = 110;
  const CY = 110;
  const STROKE = 30;

  // compute arcs
  let cumAngle = -90; // start from top
  const arcs: { d: string; color: string; type: string }[] = [];

  for (const s of stats) {
    if (s.count === 0) continue;
    const pct = s.count / total;
    const angle = pct * 360;

    // prevent full-circle degenerate arc
    const sweep = angle >= 360 ? 359.999 : angle;
    const start = (cumAngle * Math.PI) / 180;
    const end = ((cumAngle + sweep) * Math.PI) / 180;

    const x1 = CX + R * Math.cos(start);
    const y1 = CY + R * Math.sin(start);
    const x2 = CX + R * Math.cos(end);
    const y2 = CY + R * Math.sin(end);
    const largeArc = sweep > 180 ? 1 : 0;

    arcs.push({
      d: `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: s.color,
      type: s.type,
    });
    cumAngle += angle;
  }

  if (arcs.length === 0) {
    return (
      <svg width={220} height={220} viewBox="0 0 220 220">
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE}
        />
        <text
          x={CX}
          y={CY + 5}
          textAnchor="middle"
          className="text-sm fill-gray-400"
        >
          No data
        </text>
      </svg>
    );
  }

  return (
    <svg width={220} height={220} viewBox="0 0 220 220">
      {/* background circle */}
      <circle
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke="#f3f4f6"
        strokeWidth={STROKE}
      />
      {arcs.map((arc) => (
        <path
          key={arc.type}
          d={arc.d}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE}
          strokeLinecap="butt"
        />
      ))}
      {/* center label */}
      <text
        x={CX}
        y={CY - 8}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        fill="#111827"
      >
        {total}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize={11} fill="#6b7280">
        Sessions
      </text>
    </svg>
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

      {/* ── Chart + Legend ── */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">
          Session Distribution by Type
        </h3>

        {totalSessions === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
            <BookOpen className="w-8 h-8" />
            <p className="text-sm">No sessions found for this course.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Donut */}
            <div className="shrink-0">
              <DonutChart stats={typeStats} total={totalSessions} />
            </div>

            {/* Legend */}
            <div className="flex-1 w-full space-y-3">
              {typeStats.map((s) => {
                const pct =
                  totalSessions > 0
                    ? ((s.count / totalSessions) * 100).toFixed(1)
                    : "0.0";
                return (
                  <div key={s.type} className="flex items-center gap-3">
                    {/* color dot */}
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    {/* label */}
                    <span className="flex-1 text-sm text-gray-700">
                      {s.label}
                    </span>
                    {/* count badge */}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.bgClass}`}
                    >
                      {s.count} session{s.count !== 1 ? "s" : ""}
                    </span>
                    {/* minutes */}
                    <span className="text-xs text-gray-400 w-16 text-right">
                      {s.minutes > 0 ? `${s.minutes} min` : "—"}
                    </span>
                    {/* pct bar */}
                    <div className="w-24 hidden sm:block">
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
                    {/* pct label */}
                    <span className="text-xs text-gray-500 w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <p className="text-xs text-gray-400 text-right">
        Last updated: {loadedAt.toLocaleString()}
      </p>
    </div>
  );
}
