import { useEffect, useState, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import MainHeader from "@/components/layout/MainHeader";
import { courseApi } from "@/api/courseApi";
import { cohortApi } from "@/api/cohortApi";
import type { Course } from "@/types/course";
import type { Cohort } from "@/api/cohortApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import { toast } from "sonner";
import {
  Search,
  BookOpen,
  Clock,
  User,
  Tag,
  X,
  Calendar,
  Users,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// ── Level badge ──────────────────────────────────────────────────────────────
const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-100 text-green-700 border border-green-200",
  INTERMEDIATE: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  ADVANCED: "bg-red-100 text-red-700 border border-red-200",
};

function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${LEVEL_COLORS[level] ?? "bg-gray-100 text-gray-600"}`}
    >
      {level}
    </span>
  );
}

// ── Status badge for cohort ──────────────────────────────────────────────────
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

// ── Date util ────────────────────────────────────────────────────────────────
function fmtDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// ── Price util ───────────────────────────────────────────────────────────────
function fmtPrice(price?: number, discount?: number) {
  if (!price) return "Free";
  const final = discount ? price * (1 - discount / 100) : price;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(final);
}

// ── Cohort Modal ─────────────────────────────────────────────────────────────
interface CohortModalProps {
  course: Course;
  onClose: () => void;
}

function CohortModal({ course, onClose }: CohortModalProps) {
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
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Enrollment failed";
      toast.error(String(msg));
      // If already enrolled, mark it visually
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
        <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex items-center justify-between">
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

// ── Course Card ───────────────────────────────────────────────────────────────
interface CourseCardProps {
  course: Course;
  onSelectCourse: (course: Course) => void;
}

function CourseCard({ course, onSelectCourse }: CourseCardProps) {
  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="h-40 bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.courseName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={48} className="text-white/70" />
        </div>
        <div className="absolute top-3 left-3">
          <LevelBadge level={course.level} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2">
          {course.courseName}
        </h3>
        <p className="text-xs text-gray-400 font-mono mb-2">
          {course.courseCode}
        </p>

        {course.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
            {course.description}
          </p>
        )}

        <div className="space-y-1.5 mt-auto">
          {course.trainerName && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User size={12} />
              <span>{course.trainerName}</span>
            </div>
          )}
          {hours !== null && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} />
              <span>{hours} hours</span>
            </div>
          )}
          {course.price !== undefined && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <Tag size={12} />
              <span>{fmtPrice(course.price, course.discount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <button
          onClick={() => onSelectCourse(course)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          View Cohorts & Enroll
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TraineeCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const debouncedKeyword = useDebounce(keyword, 300);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const data = await courseApi.getCourses(page, 12, {
        keyword: debouncedKeyword || undefined,
        status: "ACTIVE",
      });
      // Filter by level client-side (API doesn't have level filter)
      const content: Course[] = data.content ?? data;
      const filtered = levelFilter
        ? content.filter((c: Course) => c.level === levelFilter)
        : content;
      setCourses(filtered);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedKeyword, levelFilter]);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, levelFilter]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return (
    <MainLayout>
      <MainHeader title="Course Catalog" />

      <div className="p-6 space-y-6">
        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search courses by name or code..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Level filter */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-40"
          >
            <option value="">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* ── Results count ── */}
        {!loading && (
          <p className="text-sm text-gray-500">
            {courses.length} course{courses.length !== 1 ? "s" : ""} found
            {debouncedKeyword && ` for "${debouncedKeyword}"`}
          </p>
        )}

        {/* ── Course Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={24} />
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No courses available</p>
            <p className="text-sm mt-1">Check back later for new courses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelectCourse={setSelectedCourse}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ── Cohort Modal ── */}
      {selectedCourse && (
        <CohortModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </MainLayout>
  );
}
