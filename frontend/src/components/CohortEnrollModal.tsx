import { useEffect, useState } from "react";
import { cohortApi } from "@/api/cohortApi";
import type { Cohort } from "@/api/cohortApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { X, Calendar, Users, CheckCircle, Loader2 } from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const COHORT_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  OPEN: "bg-green-100 text-green-700",
  CLOSED: "bg-red-100 text-red-700",
};

function CohortStatusBadge({ status }: { status?: string }) {
  const s = status ?? "DRAFT";
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${COHORT_STATUS_COLORS[s] ?? COHORT_STATUS_COLORS.DRAFT}`}
    >
      {s}
    </span>
  );
}

function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── component ─────────────────────────────────────────────────────────────────
interface Props {
  course: Course;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CohortEnrollModal({ course, onClose, onSuccess }: Props) {
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    cohortApi
      .getByCourseId(course.id)
      .then(setCohorts)
      .catch(() => toast.error("Failed to load cohorts"))
      .finally(() => setLoading(false));
  }, [course.id]);

  const handleEnroll = async (cohort: Cohort) => {
    try {
      setEnrollingId(cohort.id);
      await enrollmentApi.enroll(cohort.id);
      setEnrolledIds((prev) => new Set(prev).add(cohort.id));
      toast.success(`Enrolled in ${cohort.code} successfully!`);
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Enrollment failed";
      toast.error(String(msg));
      if (String(msg).toLowerCase().includes("already enrolled")) {
        setEnrolledIds((prev) => new Set(prev).add(cohort.id));
      }
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">
              {course.courseName}
            </h2>
            <p className="text-blue-100 text-sm">
              {course.courseCode} · Select a cohort to enroll
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={20} />
              Loading cohorts...
            </div>
          ) : cohorts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-40" />
              <p>No cohorts available for this course yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cohorts.map((cohort) => {
                const isEnrolled = enrolledIds.has(cohort.id);
                const isEnrolling = enrollingId === cohort.id;
                const canEnroll = cohort.status === "OPEN" && !isEnrolled;

                return (
                  <div
                    key={cohort.id}
                    className={`border rounded-xl p-4 transition-colors ${
                      isEnrolled
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">
                            {cohort.code}
                          </span>
                          <CohortStatusBadge status={cohort.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {fmtDate(cohort.startDate)} –{" "}
                            {fmtDate(cohort.endDate)}
                          </span>
                          {cohort.capacity && (
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              Capacity: {cohort.capacity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      {isEnrolled ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 shrink-0">
                          <CheckCircle size={16} />
                          Enrolled
                        </span>
                      ) : (
                        <button
                          disabled={!canEnroll || isEnrolling}
                          onClick={() => handleEnroll(cohort)}
                          className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                            canEnroll
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isEnrolling ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : cohort.status === "OPEN" ? (
                            "Enroll"
                          ) : cohort.status === "CLOSED" ? (
                            "Closed"
                          ) : (
                            "Not Open"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
