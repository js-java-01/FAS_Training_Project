import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { DatabaseBackup, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";

import { DataTable } from "@/components/data_table/DataTable";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

import { courseApi } from "@/api/courseApi";
import type { Course } from "@/types/course";

import { getColumns } from "./components/columns";
import { CourseCreateModal } from "./components/CourseCreateModal";
import { COURSE_QUERY_KEY, useGetAllCourses } from "./services/queries";
import {
  useExportCourses,
  useImportCourses,
  useDownloadCourseTemplate,
} from "./services/mutations";

export default function CourseTable() {
  /* ---------- modal state ---------- */
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ---------- search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- sort param ---------- */
  const sortParam = useMemo(() => {
    if (!sorting.length) return "createdDate,desc";
    const { id, desc } = sorting[0];
    return `${id},${desc ? "desc" : "asc"}`;
  }, [sorting]);

  /* ---------- mutations ---------- */
  const { mutateAsync: exportCourses } = useExportCourses();
  const { mutateAsync: importCourses } = useImportCourses();
  const { mutateAsync: downloadTemplate } = useDownloadCourseTemplate();

  /* ---------- query ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllCourses({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
  });

  const safeTableData = useMemo(
    () => ({
      items: tableData?.items ?? [],
      page: tableData?.pagination?.page ?? pageIndex,
      pageSize: tableData?.pagination?.pageSize ?? pageSize,
      totalPages: tableData?.pagination?.totalPages ?? 0,
    }),
    [tableData, pageIndex, pageSize],
  );

  /* ---------- helpers ---------- */
  const invalidateCourses = async () => {
    await queryClient.invalidateQueries({ queryKey: [COURSE_QUERY_KEY] });
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      await courseApi.deleteCourse(deletingCourse.id);
      toast.success("Course deleted successfully");
      await invalidateCourses();
      await reload();
    } catch {
      toast.error("Failed to delete course");
    } finally {
      setDeletingCourse(null);
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns(
        {
          onView: (c) => navigate(`/courses/${c.id}`),
          onEdit: (c) => setEditCourse(c),
          onDelete: (c) => setDeletingCourse(c),
        },
        false,
      ),
    [navigate],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Course, unknown>
        columns={columns as ColumnDef<Course, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        manualSearch
        searchPlaceholder="course name or code"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting
        headerActions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsImportExportOpen(true)}
            >
              <DatabaseBackup className="h-4 w-4" />
              Import / Export
            </Button>
            <Button
              onClick={() => {
                setEditCourse(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Course
            </Button>
          </div>
        }
      />

      {/* ===== Import / Export ===== */}
      <ImportExportModal
        title="Courses"
        open={isImportExportOpen}
        setOpen={setIsImportExportOpen}
        onImport={async (file) => {
          await importCourses(file);
          await invalidateCourses();
          await reload();
        }}
        onExport={async () => {
          await exportCourses();
        }}
        onDownloadTemplate={async () => {
          await downloadTemplate();
        }}
      />

      {/* ===== Create ===== */}
      <CourseCreateModal
        open={showCreateModal && !editCourse}
        onClose={() => setShowCreateModal(false)}
        onSuccess={async () => {
          setShowCreateModal(false);
          await invalidateCourses();
          await reload();
        }}
      />

      {/* ===== Edit ===== */}
      <CourseCreateModal
        open={!!editCourse}
        course={editCourse}
        onClose={() => setEditCourse(null)}
        onSuccess={async () => {
          setEditCourse(null);
          await invalidateCourses();
          await reload();
        }}
      />

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!deletingCourse}
        title="Delete Course"
        description={`Are you sure you want to delete "${deletingCourse?.courseName}"?`}
        onCancel={() => setDeletingCourse(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
