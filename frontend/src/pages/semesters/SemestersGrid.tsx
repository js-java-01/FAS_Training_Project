import { useMemo, useState, useEffect } from "react";
import { Plus, Search, Loader2, CalendarX2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useDebounce } from "@uidotdev/usehooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/confirmdialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import { Pagination, PaginationContent, PaginationItem, PaginationEllipsis } from "@/components/ui/pagination";
import { semesterApi } from "@/api/semesterApi";

import { usePagination } from "@/hooks/usePagination";
import type { Semester } from "@/types/trainingClass";
import { SemesterForm } from "./components/SemesterForm";
import { SemesterDetailDialog } from "./components/SemesterDetailDialog";
import { SemesterCard } from "./components/SemesterCard";
import type { SemesterResponse } from "./dto/SemesterResponse";
import { useDownloadTemplate, useExportSemesters, useImportSemesters } from "./services/mutations/mutations";
import { useGetAllSemesters } from "./services/queries/useSemesters";
import type { CreateSemesterRequest } from "./dto/CreateSemesterRequest";
import type { UpdateSemesterRequest } from "./dto/UpdateSemesterRequest";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";

/* ===================== MAIN ===================== */
export default function SemestersGrid() {
  const { permissions, role } = useSelector((state: RootState) => state.auth);
  const canCreate = permissions.includes("SEMESTER_CREATE");
  const canUpdate = permissions.includes("SEMESTER_UPDATE");
  const canDelete = permissions.includes("SEMESTER_DELETE");
  /* ---------- Modal & View States ---------- */
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  const [viewingSemester, setViewingSemester] = useState<Semester | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<Semester | null>(null);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  /* ---------- Pagination State ---------- */
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const queryClient = useQueryClient();

  /* ---------- Search ---------- */
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  /* ---------- Date Filter ---------- */
  const [startDateFilter, setStartDateFilter] = useState<string | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, startDateFilter, endDateFilter, pageSize]);

  /* ---------- Queries & Mutations ---------- */
  const { mutateAsync: importSemesters } = useImportSemesters();
  const { mutateAsync: exportSemesters } = useExportSemesters();
  const { mutateAsync: downloadTemplate } = useDownloadTemplate();

  const {
    data: gridData,
    isLoading,
    isFetching,
  } = useGetAllSemesters(
    {
      page: pageIndex,
      size: pageSize,
      keyword: debouncedSearch,
      sort: "startDate,desc",
      startDate: startDateFilter,
      endDate: endDateFilter,
    },
    role,
  );

  const safeGridData = useMemo(
    () => ({
      items: gridData?.items ?? [],
      page: gridData?.pagination?.page ?? pageIndex,
      pageSize: gridData?.pagination?.pageSize ?? pageSize,
      totalPages: gridData?.pagination?.totalPages ?? 0,
      totalElements: gridData?.pagination?.totalElements ?? 0,
    }),
    [gridData, pageIndex, pageSize],
  );

  /* ---------- CRUD Actions ---------- */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["semesters"] });
  };

  const validateSemesterData = (formData: Partial<Semester>) => {
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên học kỳ");
      return false;
    }
    if (!formData.startDate) {
      toast.error("Vui lòng chọn ngày bắt đầu");
      return false;
    }
    if (!formData.endDate) {
      toast.error("Vui lòng chọn ngày kết thúc");
      return false;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (start >= end) {
      toast.error("Ngày kết thúc phải diễn ra sau ngày bắt đầu");
      return false;
    }

    return true;
  };

  const handleCreate = async (formData: Partial<Semester>) => {
    if (!validateSemesterData(formData)) return;
    try {
      await semesterApi.createSemester(formData as CreateSemesterRequest);
      toast.success("Created successfully");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to create semester");
      }
    }
  };

  const handleUpdate = async (formData: Partial<Semester>) => {
    if (!validateSemesterData(formData)) return;
    if (!editingSemester?.id) return;
    try {
      formData.id = editingSemester.id;
      await semesterApi.updateSemester({ ...(formData as UpdateSemesterRequest) });
      toast.success("Updated successfully");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update semester");
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingSemester) return;
    try {
      await semesterApi.deleteSemester(deletingSemester.id);
      toast.success("Deleted successfully");
      await invalidateAll();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete semester");
    } finally {
      setDeletingSemester(null);
    }
  };

  /* ================= IMPORT / EXPORT ================= */
  const handleImport = async (file: File) => {
    try {
      const res = await importSemesters(file);
      await invalidateAll();
      return res;
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData?.totalRows !== undefined) return errorData;
      toast.error(errorData?.message ?? "Failed to import semesters");
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportSemesters();
      downloadBlob(blob, "semesters.xlsx");
      toast.success("Export successful");
    } catch {
      toast.error("Failed to export semesters");
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "semesters_template.xlsx");
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: safeGridData.page + 1,
    totalPages: safeGridData.totalPages,
    paginationItemsToDisplay: 5,
  });

  /* ===================== RENDER ===================== */
  return (
    <div className="relative flex flex-col gap-4 h-full flex-1">
      {/* --- TOP TOOLBAR --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute text-muted-foreground top-2.5 left-3" />
            <Input
              placeholder="Search semesters..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* DATE */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDateFilter || ""}
              onChange={(e) => setStartDateFilter(e.target.value || undefined)}
              className="w-full sm:w-37.5 text-muted-foreground"
              title="Từ ngày"
            />
            <span className="text-muted-foreground hidden sm:inline-block">-</span>
            <Input
              type="date"
              value={endDateFilter || ""}
              onChange={(e) => setEndDateFilter(e.target.value || undefined)}
              className="w-full sm:w-37.5 text-muted-foreground"
              title="Đến ngày"
            />

            {(startDateFilter || endDateFilter) && (
              <Button
                variant="ghost"
                className="px-2 text-muted-foreground hover:text-foreground h-9"
                onClick={() => {
                  setStartDateFilter(undefined);
                  setEndDateFilter(undefined);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row gap-2 w-full lg:w-auto justify-end">
          {
            <Button variant="outline" onClick={handleExport} disabled={isLoading || isFetching}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          }

          {canCreate && (
            <Button variant="outline" onClick={() => setOpenBackupModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}

          {canCreate && (
            <Button
              onClick={() => {
                setEditingSemester(null);
                setIsFormOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Semester
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Items per page:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[12, 24, 36, 48].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN GRID CONTENT --- */}
      <div className="flex-1 overflow-y-auto min-h-100 border rounded-lg bg-slate-50/50 p-4">
        {isLoading || isFetching ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading semesters...</p>
          </div>
        ) : safeGridData.items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            <div className="p-4 bg-primary/10 rounded-full">
              <CalendarX2 className="h-8 w-8 text-primary" />
            </div>
            <p>No semesters found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {safeGridData.items.map((semester: SemesterResponse) => (
              <SemesterCard
                key={semester.id as string}
                semester={semester}
                onViewDetails={() => setViewingSemester(semester)}
                onEdit={
                  canUpdate
                    ? () => {
                        setEditingSemester(semester);
                        setIsFormOpen(true);
                      }
                    : undefined
                }
                onDelete={canDelete ? () => setDeletingSemester(semester) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- BOTTOM PAGINATION --- */}
      {safeGridData.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{safeGridData.items.length}</span> of{" "}
            <span className="font-medium">{safeGridData.totalElements}</span> semesters
          </div>

          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setPageIndex((old) => Math.max(old - 1, 0))}
                  disabled={pageIndex === 0 || isLoading}
                >
                  &lt;
                </Button>
              </PaginationItem>

              {showLeftEllipsis && <PaginationEllipsis />}

              {pages.map((p) => (
                <PaginationItem key={p}>
                  <Button
                    size="icon"
                    variant={p === pageIndex + 1 ? "outline" : "ghost"}
                    onClick={() => setPageIndex(p - 1)}
                    disabled={isLoading}
                  >
                    {p}
                  </Button>
                </PaginationItem>
              ))}

              {showRightEllipsis && <PaginationEllipsis />}

              <PaginationItem>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setPageIndex((old) => (old < safeGridData.totalPages - 1 ? old + 1 : old))}
                  disabled={pageIndex >= safeGridData.totalPages - 1 || isLoading}
                >
                  &gt;
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ===== MODALS & FORMS ===== */}
      {isFormOpen && (
        <SemesterForm
          open={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingSemester ? handleUpdate : handleCreate}
          initialData={editingSemester}
        />
      )}

      {viewingSemester && (
        <SemesterDetailDialog
          open={!!viewingSemester}
          semester={viewingSemester}
          onClose={() => setViewingSemester(null)}
        />
      )}

      {deletingSemester && (
        <ConfirmDialog
          open={!!deletingSemester}
          title="Delete Semester"
          description={`Are you sure you want to delete "${deletingSemester.name}"?`}
          onCancel={() => setDeletingSemester(null)}
          onConfirm={() => void handleDelete()}
        />
      )}

      <ImportExportModal
        title="Semesters"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
}
