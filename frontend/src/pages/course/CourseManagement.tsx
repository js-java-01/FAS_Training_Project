import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/data_table/DataTable";
import { courseApi } from "@/api/courseApi";
import { enrollmentApi } from "@/api/enrollmentApi";
import type { Course } from "@/types/course";
import { getColumns } from "./components/columns";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import {
  Search,
  RotateCcw,
  BookOpen,
  Clock,
  User,
  Tag,
  Loader2,
  GraduationCap,
} from "lucide-react";
import { ImportExportActions } from "@/components/import-export/ImportExportActions";
import { BaseImportModal } from "@/components/import-export/BaseImportModal";
import { CourseCreateModal } from "./components/CourseCreateModal";
import MainHeader from "@/components/layout/MainHeader";
import { useDebounce } from "@/hooks/useDebounce";
import type { SortingState } from "@tanstack/react-table";
import { usePermissions } from "@/hooks/usePermissions";
import { CohortEnrollModal } from "@/components/CohortEnrollModal";

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
      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        LEVEL_COLORS[level] ?? "bg-gray-100 text-gray-600"
      }`}
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
  onEnroll,
}: {
  course: Course;
  onEnroll?: (course: Course) => void;
}) {
  const navigate = useNavigate();
  const hours = course.estimatedTime
    ? Math.round(course.estimatedTime / 60)
    : null;
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group"
      onClick={() => navigate(`/courses/${course.id}`)}
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
        {onEnroll && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course);
            }}
            className="mx-4 mb-4 mt-2 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enroll
          </button>
        )}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const isStudentMode = !hasPermission("COURSE_UPDATE");

  // student tab state
  const [activeTab, setActiveTab] = useState<"catalog" | "enrollments">(
    "catalog",
  );
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrolledLoading, setEnrolledLoading] = useState(false);

  // filters (admin)
  const [keyword, setKeyword] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  // extra filter (student card view)
  const [levelFilter, setLevelFilter] = useState("");
  const debouncedKeyword = useDebounce(keyword, 300);

  const sortParam = useMemo(() => {
    if (!sorting.length) return undefined;
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, topicFilter, trainerFilter, statusFilter, levelFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (isStudentMode) {
        const data = await courseApi.getCourses(page, 12, {
          keyword: debouncedKeyword || undefined,
          status: "ACTIVE",
        });
        const content: Course[] = data.content ?? data;
        const filtered = levelFilter
          ? content.filter((c: Course) => c.level === levelFilter)
          : content;
        setCourses(filtered);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? filtered.length);
      } else {
        const data = await courseApi.getCourses(page, pageSize, {
          keyword: debouncedKeyword || undefined,
          topicCode: topicFilter || undefined,
          trainerId: trainerFilter || undefined,
          status: statusFilter || undefined,
          sort: sortParam,
        });
        setCourses(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    sorting,
    debouncedKeyword,
    topicFilter,
    trainerFilter,
    statusFilter,
    levelFilter,
    isStudentMode,
  ]);

  const resetFilters = () => {
    setKeyword("");
    setTopicFilter("");
    setTrainerFilter("");
    setStatusFilter("");
    setLevelFilter("");
  };

  const loadEnrolledCourses = async () => {
    try {
      setEnrolledLoading(true);
      const data = await enrollmentApi.getMyEnrolledCourses();
      setEnrolledCourses(data);
    } catch {
      toast.error("Failed to load enrolled courses");
    } finally {
      setEnrolledLoading(false);
    }
  };

  // Load enrolled courses whenever the enrollments tab is active (and on student mode mount)
  useEffect(() => {
    if (isStudentMode && activeTab === "enrollments") {
      loadEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isStudentMode]);

  const handleEnrollSuccess = () => {
    setEnrollCourse(null);
    loadEnrolledCourses();
    setActiveTab("enrollments");
  };

  // derive unique trainer options from current page data
  const topicOptions: string[] = []; // topics not yet implemented
  const trainerOptions = useMemo(
    () =>
      [
        ...new Map(
          courses
            .filter((c) => c.trainerName)
            .map((c) => [c.trainerId ?? c.trainerName, c]),
        ).values(),
      ].map((c) => ({
        id: c.trainerId ?? "",
        name: c.trainerName ?? "",
      })),
    [courses],
  );

  const handleExport = async () => {
    try {
      const blob = await courseApi.exportCourses();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `courses_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Exported courses successfully!");
    } catch {
      toast.error("Failed to export courses");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await courseApi.deleteCourse(deleteId);
      toast.success("Course deleted");
      setDeleteId(null);
      loadData();
    } catch (e) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <MainLayout>
      {/* ═══════════════════ STUDENT CARD VIEW ═══════════════════ */}
      {isStudentMode ? (
        <div className="h-full flex-1 flex flex-col gap-4">
          <MainHeader
            title="Courses"
            description="Browse the catalog or view your enrolled courses"
          />

          {/* ── Tabs ── */}
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
              {/* Filters */}
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

              {/* Card grid */}
              {loading ? (
                <div className="flex items-center justify-center py-24 text-gray-400">
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                  <BookOpen size={56} className="mb-4 opacity-30" />
                  <p className="text-lg font-medium">No courses available</p>
                  <p className="text-sm mt-1">
                    Check back later for new courses.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-4">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEnroll={(c) => setEnrollCourse(c)}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
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
          {activeTab === "enrollments" && (
            <>
              {enrolledLoading ? (
                <div className="flex items-center justify-center py-24 text-gray-400">
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Loading enrolled courses...
                </div>
              ) : enrolledCourses.length === 0 ? (
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
                    {enrolledCourses.length} course
                    {enrolledCourses.length !== 1 ? "s" : ""} enrolled
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto pb-4">
                    {enrolledCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        /* ════════════════ ADMIN / TRAINER TABLE VIEW ════════════════ */
        <div className="h-full flex-1 flex flex-col gap-4">
          {/* Page header */}
          <div className="flex justify-between items-start">
            <MainHeader
              title="Courses"
              description="Courses management and configuration"
            />
            <div className="flex items-center gap-2">
              <ImportExportActions
                onImportClick={() => setShowImportModal(true)}
                onExportClick={handleExport}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700"
              >
                <FiPlus />
                Add Course
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search courses..."
                className="pl-8 pr-3 py-1.5 text-sm border rounded-md w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">All Topics</option>
              {topicOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">All Trainers</option>
              {trainerOptions.map((t) => (
                <option key={t.id || t.name} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border rounded-md px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
            >
              <option value="">All Status</option>
              {["DRAFT", "UNDER_REVIEW", "ACTIVE"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              onClick={resetFilters}
              title="Reset filters"
              className="p-1.5 border rounded-md hover:bg-gray-100 text-gray-500"
            >
              <RotateCcw size={15} />
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 min-h-0">
            <DataTable<Course, unknown>
              columns={getColumns(
                {
                  onView: (c) => navigate(`/courses/${c.id}`),
                  onEdit: (c) => setEditCourse(c),
                  onDelete: (c) => setDeleteId(c.id),
                  onEnroll: (c) => setEnrollCourse(c),
                },
                isStudentMode,
              )}
              data={courses}
              isLoading={loading}
              manualPagination
              pageIndex={page}
              pageSize={pageSize}
              totalPage={totalPages}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => setPageSize(s)}
              isSearch={false}
              sorting={sorting}
              onSortingChange={setSorting}
              manualSorting
              onRowClick={(c) => navigate(`/courses/${(c as any).id}`)}
            />
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!deleteId}
        title="Delete course?"
        message={
          <>
            Are you sure you want to delete this course? This action cannot be
            undone.
          </>
        }
        onCancel={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
      <BaseImportModal
        open={showImportModal}
        title="Import Courses"
        templateFileName="courses_import_template.xlsx"
        onClose={() => setShowImportModal(false)}
        onSuccess={loadData}
        onDownloadTemplate={() => courseApi.downloadTemplate()}
        onImport={(file) => courseApi.importCourses(file)}
      />
      <CourseCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadData}
      />
      <CourseCreateModal
        open={!!editCourse}
        course={editCourse}
        onClose={() => setEditCourse(null)}
        onSuccess={loadData}
      />
      {enrollCourse && (
        <CohortEnrollModal
          course={enrollCourse}
          onClose={() => setEnrollCourse(null)}
          onSuccess={isStudentMode ? handleEnrollSuccess : undefined}
        />
      )}
    </MainLayout>
  );
};

export default CourseManagement;
