import { useMemo, useState } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";

import { ServerDataTable } from "@/components/data_table/ServerDataTable";
import { FacetedFilter } from "@/components/FacedFilter";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirmdialog";

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
import EntityImportExportButton from "@/components/data_table/button/EntityImportExportBtn";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { useSortParam } from "@/hooks/useSortParam";

export default function CourseTable() {
  /* ---------- permissions ---------- */
  const { activePermissions } = useRoleSwitch();
  const permissions = activePermissions || [];
  const hasPermission = (p: string) => permissions.includes(p);
  const canCreate = hasPermission("COURSE_CREATE");
  const canUpdate = hasPermission("COURSE_UPDATE");
  const canDelete = hasPermission("COURSE_DELETE");
  const canImport = hasPermission("COURSE_IMPORT");
  const canExport = hasPermission("COURSE_EXPORT");

  /* ---------- modal state ---------- */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  /* ---------- table state ---------- */
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ---------- search + filter ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const statusParam = statusFilter.length === 1 ? statusFilter[0] : undefined;

  /* ---------- sort param ---------- */
  const sortParam = useSortParam(sorting, "createdDate,desc")

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
    status: statusParam,
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
          onEdit: canUpdate ? (c) => setEditCourse(c) : undefined,
          onDelete: canDelete ? (c) => setDeletingCourse(c) : undefined,
        },
        false,
      ),
    [navigate, canUpdate, canDelete],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <ServerDataTable<Course, unknown>
        columns={columns as ColumnDef<Course, unknown>[]}
        data={safeTableData.items}
        isLoading={isLoading}
        isFetching={isFetching}
        pageIndex={safeTableData.page}
        pageSize={safeTableData.pageSize}
        totalPage={safeTableData.totalPages}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        searchPlaceholder="course name or code"
        onSearchChange={setSearchValue}
        sorting={sorting}
        onSortingChange={setSorting}
        headerActions={
          (canCreate || canImport || canExport) && (
            <div className="flex gap-2">
              {(canImport || canExport) && (
                <EntityImportExportButton
                  title="Courses"
                  useImportHook={useImportCourses}
                  useExportHook={useExportCourses}
                  useTemplateHook={useDownloadCourseTemplate}
                />
              )}
              {canCreate && (
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
              )}
            </div>
          )
        }
        facetedFilters={
          <div>
            <FacetedFilter
              title="Status"
              options={[
                { value: "DRAFT", label: "Draft" },
                { value: "UNDER_REVIEW", label: "Under Review" },
                { value: "ACTIVE", label: "Active" },
              ]}
              value={statusFilter}
              setValue={setStatusFilter}
              multiple={false}
            />
          </div>
        }
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
