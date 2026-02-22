import React, { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DataTable } from "@/components/data_table/DataTable";
import { courseApi } from "@/api/courseApi";
import type { Course } from "@/types/course";
import { getColumns } from "./components/columns";
import { toast } from "sonner";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { useNavigate } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { Search, RotateCcw } from "lucide-react";
import { ImportExportActions } from "@/components/import-export/ImportExportActions";
import { BaseImportModal } from "@/components/import-export/BaseImportModal";
import { CourseCreateModal } from "./components/CourseCreateModal";
import MainHeader from "@/components/layout/MainHeader";
import { useDebounce } from "@/hooks/useDebounce";
import type { SortingState } from "@tanstack/react-table";

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();

  // filters
  const [keyword, setKeyword] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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

  useEffect(() => {
    setPage(0);
  }, [debouncedKeyword, topicFilter, trainerFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [
    page,
    pageSize,
    sorting,
    debouncedKeyword,
    topicFilter,
    trainerFilter,
    statusFilter,
  ]);

  const loadData = async () => {
    try {
      setLoading(true);
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
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setTopicFilter("");
    setTrainerFilter("");
    setStatusFilter("");
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
      <div className="h-full flex-1 flex flex-col gap-4">
        {/* ── Page header ── */}
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

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
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

          {/* Topic */}
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

          {/* Trainer */}
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

          {/* Status */}
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

          {/* Reset */}
          <button
            onClick={resetFilters}
            title="Reset filters"
            className="p-1.5 border rounded-md hover:bg-gray-100 text-gray-500"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 min-h-0">
          <DataTable<Course, unknown>
            columns={getColumns({
              onView: (c) => navigate(`/courses/${c.id}`),
              onEdit: (c) => setEditCourse(c),
              onDelete: (c) => setDeleteId(c.id),
            })}
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
    </MainLayout>
  );
};

export default CourseManagement;
