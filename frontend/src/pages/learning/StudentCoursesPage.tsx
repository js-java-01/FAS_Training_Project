import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { Course, CourseLevel } from "@/types/course";
import {
  Search,
  BookOpen,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Filter,
  X,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

const LEVEL_META: Record<
  CourseLevel,
  { label: string; color: string; bg: string }
> = {
  BEGINNER: {
    label: "Beginner",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  ADVANCED: {
    label: "Advanced",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
  },
};

const CARD_GRADIENTS = [
  "from-teal-400 to-cyan-500",
  "from-blue-400 to-indigo-500",
  "from-pink-400 to-rose-500",
  "from-purple-400 to-violet-500",
  "from-orange-400 to-amber-500",
  "from-green-400 to-emerald-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-400 to-pink-500",
];

function getGradient(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length];
}

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({
  course,
  index,
  isEnrolled,
  onView,
}: {
  course: Course;
  index: number;
  isEnrolled: boolean;
  onView: () => void;
}) {
  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;
  const level = course.level ? LEVEL_META[course.level] : null;
  const gradient = course.thumbnailUrl
    ? null
    : getGradient(course.id ?? String(index));

  return (
    <div
      onClick={onView}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden group"
    >
      {/* Thumbnail */}
      <div className="relative h-40 overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.courseName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className={`w-full h-full bg-linear-to-br ${gradient} flex items-center justify-center`}
          >
            <BookOpen size={40} className="text-white/60" />
          </div>
        )}

        {/* Level badge */}
        {level && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${level.bg} ${level.color}`}
          >
            {level.label}
          </span>
        )}

        {/* Enrolled indicator */}
        {isEnrolled && (
          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
            Enrolled
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Topic */}
        {(course.topicName ?? course.topic) && (
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-widest mb-1 truncate">
            {course.topicName ?? course.topic}
          </p>
        )}

        <h3 className="font-bold text-sm text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {course.courseName}
        </h3>

        {course.trainerName && (
          <p className="text-xs text-gray-400 mb-3 truncate">
            {course.trainerName}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-3">
            {hours && (
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {hours}h
              </span>
            )}
            <span className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              4.7
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              isEnrolled
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            <Play size={10} />
            {isEnrolled ? "Continue" : "View"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-3" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StudentCoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [levelFilter, setLevelFilter] = useState<CourseLevel | "">(
    (searchParams.get("level") as CourseLevel) ?? "",
  );
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "0"));

  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

  const debouncedKeyword = useDebounce(keyword, 400);

  // Fetch enrolled courses once
  useEffect(() => {
    enrollmentApi
      .getMyEnrolledCourses()
      .then((list) =>
        setEnrolledIds(new Set(list.map((e) => e.courseId).filter(Boolean))),
      )
      .catch(() => {});
  }, []);

  // Fetch courses whenever filters change
  const fetchCourses = useCallback(() => {
    setLoading(true);
    courseApi
      .getCourses({
        page,
        size: PAGE_SIZE,
        keyword: debouncedKeyword || undefined,
        status: "ACTIVE",
      })
      .then((res) => {
        // Do client-side level filter since API may not support it
        const items = levelFilter
          ? res.items.filter((c) => c.level === levelFilter)
          : res.items;
        setCourses(items);
        setTotalPages(res.pagination.totalPages);
        setTotalElements(res.pagination.totalElements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, debouncedKeyword, levelFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Sync state → URL params
  useEffect(() => {
    const p: Record<string, string> = {};
    if (debouncedKeyword) p.q = debouncedKeyword;
    if (levelFilter) p.level = levelFilter;
    if (page > 0) p.page = String(page);
    setSearchParams(p, { replace: true });
  }, [debouncedKeyword, levelFilter, page]);

  const handleKeywordChange = (v: string) => {
    setKeyword(v);
    setPage(0);
  };

  const handleLevelChange = (l: CourseLevel | "") => {
    setLevelFilter(l);
    setPage(0);
  };

  const clearFilters = () => {
    setKeyword("");
    setLevelFilter("");
    setPage(0);
  };

  const hasFilters = !!keyword || !!levelFilter;

  return (
    <StudentLayout active="/student-courses">
      {/* ── Hero search header ─────────────────────────────────────── */}
      <div className="bg-blue-800 px-4 py-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <GraduationCap size={13} />
            Khám phá kho học liệu
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
            Tìm khóa học phù hợp với bạn
          </h1>
          <p className="text-blue-100 text-sm mb-7">
            Học theo tốc độ của riêng bạn với hàng trăm khóa học chất lượng cao
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="Tìm kiếm khóa học, chủ đề, kỹ năng..."
              className="w-full pl-11 pr-10 py-3.5 rounded-xl text-sm text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400"
            />
            {keyword && (
              <button
                onClick={() => handleKeywordChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters bar ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
            <Filter size={13} />
            Level:
          </div>

          {(["", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((l) => (
            <button
              key={l}
              onClick={() => handleLevelChange(l)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                levelFilter === l
                  ? "bg-blue-700 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {l === "" ? "All Levels" : LEVEL_META[l as CourseLevel].label}
            </button>
          ))}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Result count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              {loading ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  Đang tải...
                </span>
              ) : (
                <>
                  <span className="font-semibold text-gray-800">
                    {totalElements}
                  </span>{" "}
                  khóa học{" "}
                  {debouncedKeyword && (
                    <>
                      cho{" "}
                      <span className="font-semibold text-blue-600">
                        "{debouncedKeyword}"
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <BookOpen size={28} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-600 mb-1">
                Không tìm thấy khóa học
              </p>
              <p className="text-sm text-gray-400 mb-5">
                Thử từ khóa khác hoặc xóa bộ lọc
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((course, i) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  index={i}
                  isEnrolled={enrolledIds.has(course.id)}
                  onView={() => navigate(`/courses/${course.id}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                // Sliding window
                let pageNum = i;
                if (totalPages > 7) {
                  const start = Math.max(0, Math.min(page - 3, totalPages - 7));
                  pageNum = start + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
