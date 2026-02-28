import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { EnrolledCourse } from "@/api/enrollmentApi";
import type { Course } from "@/types/course";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  User,
  Tag,
  Loader2,
  GraduationCap,
  Play,
  Search,
  RotateCcw,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermissions } from "@/hooks/usePermissions";
import CourseTable from "./CourseTable";

// ── Student card sub-components ───────────────────────────────────────────────
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

function fmtPrice(price?: number, discount?: number) {
  if (!price) return "Free";
  const final = discount ? price * (1 - discount / 100) : price;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(final);
}

function CourseCard({
  course,
  enrolledCohortId,
}: {
  course: Course;
  enrolledCohortId?: string;
}) {
  const navigate = useNavigate();
  const isEnrolled = !!enrolledCohortId;
  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
      onClick={() =>
        isEnrolled
          ? navigate(`/learn/${enrolledCohortId}`)
          : navigate(`/courses/${course.id}`)
      }
    >
      <div className="h-44 bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.courseName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) =>
              ((e.target as HTMLImageElement).style.display = "none")
            }
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen size={52} className="text-white/60" />
        </div>
        <div className="absolute top-3 left-3">
          <LevelBadge level={course.level} />
        </div>
        <div className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-lg">
          Course
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {course.courseName}
        </h3>
        {course.trainerName && (
          <div className="flex items-center gap-1.5 text-xs text-blue-500 mb-2">
            <User size={11} />
            <span>{course.trainerName}</span>
          </div>
        )}
        {course.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {course.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-gray-100 text-xs text-gray-400">
          {hours !== null && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {hours}h
            </span>
          )}
          {course.price !== undefined && (
            <span className="flex items-center gap-1 font-semibold text-blue-600 ml-auto">
              <Tag size={11} />
              {fmtPrice(course.price, course.discount)}
            </span>
          )}
        </div>
        <div className="px-0 pb-0">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/learn/${enrolledCohortId}`);
              }}
              className="w-full py-1.5 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 mt-4"
            >
              <Play size={13} />
              Continue Learning
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course.id}`);
              }}
              className="w-full py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              View &amp; Enroll
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export const CourseManagement: React.FC = () => {
  const { hasPermission } = usePermissions();
  const isStudentMode = !hasPermission("COURSE_UPDATE");

  // ── Student state ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"catalog" | "enrollments">(
    "catalog",
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  const enrolledCohortMap = useMemo(
    () =>
      Object.fromEntries(
        enrolledCourses
          .filter((ec) => ec?.course?.id)
          .map((ec) => [ec.course.id, ec.cohortId]),
      ) as Record<string, string>,
    [enrolledCourses],
  );

  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, levelFilter]);

  const loadStudentCourses = async () => {
    try {
      setLoading(true);
      const data = await courseApi.getCourses({
        page,
        size: 12,
        keyword: debouncedKeyword || undefined,
        status: "ACTIVE",
      });
      const filtered = levelFilter
        ? data.items.filter((c) => c.level === levelFilter)
        : data.items;
      setCourses(filtered);
      setTotalPages(data.pagination.totalPages);
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudentMode) {
      void loadStudentCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedKeyword, levelFilter, isStudentMode]);

  const loadEnrolledCourses = async () => {
    try {
      setEnrolledLoading(true);
      const data = await enrollmentApi.getMyEnrolledCourses();
      setEnrolledCourses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load enrolled courses");
    } finally {
      setEnrolledLoading(false);
    }
  };

  useEffect(() => {
    if (isStudentMode) {
      void loadEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudentMode]);

  useEffect(() => {
    if (isStudentMode && activeTab === "enrollments") {
      void loadEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isStudentMode]);

  const resetFilters = () => {
    setKeyword("");
    setLevelFilter("");
  };

  // ── Admin view ─────────────────────────────────────────────────────────────
  if (!isStudentMode) {
    return (
      <MainLayout pathName={{ courses: "Course Management" }}>
        <div className="h-full flex-1 flex flex-col gap-4">
          <CourseTable />
        </div>
      </MainLayout>
    );
  }

  // ── Student view ───────────────────────────────────────────────────────────
  return (
    <MainLayout pathName={{ courses: "Courses" }}>
      <div className="h-full flex-1 flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "catalog"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <BookOpen size={15} />
            Course Catalog
          </button>
          <button
            onClick={() => setActiveTab("enrollments")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "enrollments"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <GraduationCap size={15} />
            My Enrollments
          </button>
        </div>

        {/* ── CATALOG TAB ── */}
        {activeTab === "catalog" && (
          <>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search courses by name or code..."
                  className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
              <button
                onClick={resetFilters}
                title="Reset filters"
                className="p-1.5 border rounded-md hover:bg-gray-100 text-gray-500 shrink-0"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {!loading && (
              <p className="text-sm text-gray-500 -mt-2">
                {courses.length} course{courses.length !== 1 ? "s" : ""} found
                {debouncedKeyword && ` for "${debouncedKeyword}"`}
              </p>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24 text-gray-400">
                <Loader2 className="animate-spin mr-2" size={24} />
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <BookOpen size={56} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">No courses available</p>
                <p className="text-sm mt-1">Check back later for new courses.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-4">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    enrolledCohortId={enrolledCohortMap[course.id]}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2 shrink-0">
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
          </>
        )}

        {/* ── MY ENROLLMENTS TAB ── */}
        {activeTab === "enrollments" &&
          (() => {
            const validEnrolled = enrolledCourses.filter(
              (ec) => ec?.course?.id,
            );
            return (
              <>
                {enrolledLoading ? (
                  <div className="flex items-center justify-center py-24 text-gray-400">
                    <Loader2 className="animate-spin mr-2" size={24} />
                    Loading enrolled courses...
                  </div>
                ) : validEnrolled.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <GraduationCap size={56} className="mb-4 opacity-30" />
                    <p className="text-lg font-medium">No enrollments yet</p>
                    <p className="text-sm mt-1">
                      Go to the Course Catalog to find and enroll in a course.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 -mt-2">
                      {validEnrolled.length} course
                      {validEnrolled.length !== 1 ? "s" : ""} enrolled
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-4">
                      {validEnrolled.map((ec) => (
                        <CourseCard
                          key={ec.course.id}
                          course={ec.course}
                          enrolledCohortId={String(ec.cohortId)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
      </div>
    </MainLayout>
  );
};

export default CourseManagement;
