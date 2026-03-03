import { useState, useMemo, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTable } from "@/components/data_table/DataTable";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus, Download, Upload, Search, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/confirmdialog";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";

import { useGetAllSemesters } from "./services/queries/useSemesters";
import { useDownloadTemplate, useExportSemesters, useImportSemesters } from "./services/mutations/mutations";
import { semesterApi } from "@/api/semesterApi";

import { SemesterForm } from "./components/SemesterForm";
import { SemesterDetailDialog } from "./components/SemesterDetailDialog";
import type { SemesterResponse } from "./components/SemesterCard";
import type { UpdateSemesterRequest } from "./dto/UpdateSemesterRequest";
import type { CreateSemesterRequest } from "./dto/CreateSemesterRequest";
import { getSemesterColumns } from "./components/semesterColumns";
import { downloadBlob } from "@/utils/downloadBlob";

interface SemestersTableProps {
  onSelectSemester: (id: string) => void;
  role: string;
}

export default function SemestersTable({ onSelectSemester, role }: SemestersTableProps) {
  const queryClient = useQueryClient();

  /* ===================== STATE ===================== */
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<SemesterResponse | null>(null);
  const [viewingSemester, setViewingSemester] = useState<SemesterResponse | null>(null);
  const [deletingSemester, setDeletingSemester] = useState<SemesterResponse | null>(null);
  const [openBackupModal, setOpenBackupModal] = useState(false);

  const [startDateFilter, setStartDateFilter] = useState<string | undefined>(undefined);
  const [endDateFilter, setEndDateFilter] = useState<string | undefined>(undefined);

  const mode = role === "SUPER_ADMIN" || role === "ADMIN" ? "all" : "export";

  useEffect(() => {
    setPageIndex(0);
  }, [debouncedSearch, startDateFilter, endDateFilter]);

  /* ===================== DATA & MUTATIONS ===================== */
  const {
    data: tableData,
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
      unpaged: false,
    },
    role,
  );

  const { mutateAsync: importSemesters } = useImportSemesters();
  const { mutateAsync: exportSemesters } = useExportSemesters();
  const { mutateAsync: downloadTemplate } = useDownloadTemplate();

  const safeData = useMemo(() => tableData?.items || [], [tableData]);

  /* ===================== HANDLERS ===================== */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["semesters"] });
  };

  const handleUpdate = async (formData: Partial<SemesterResponse>) => {
    if (!editingSemester?.id) return;
    try {
      await semesterApi.updateSemester({
        ...formData,
        id: editingSemester.id,
      } as UpdateSemesterRequest);
      toast.success("Cập nhật thành công");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      const msg = error instanceof AxiosError ? error.response?.data?.message : "Lỗi cập nhật";
      toast.error(msg);
    }
  };

  const handleCreate = async (formData: Partial<SemesterResponse>) => {
    try {
      await semesterApi.createSemester(formData as CreateSemesterRequest);
      toast.success("Tạo mới thành công");
      setIsFormOpen(false);
      await invalidateAll();
    } catch (error) {
      const msg = error instanceof AxiosError ? error.response?.data?.message : "Lỗi tạo mới";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deletingSemester) return;
    try {
      await semesterApi.deleteSemester(deletingSemester.id);
      toast.success("Đã xóa học kỳ");
      await invalidateAll();
    } catch {
      toast.error("Không thể xóa học kỳ");
    } finally {
      setDeletingSemester(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportSemesters();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "semesters.xlsx";
      a.click();
      toast.success("Xuất file thành công");
    } catch {
      toast.error("Lỗi xuất file");
    }
  };

  /* ===================== COLUMNS ===================== */
  const columns = useMemo(
    () =>
      getSemesterColumns(
        setViewingSemester,
        role === "SUPER_ADMIN" || role === "ADMIN"
          ? (s) => {
              setEditingSemester(s);
              setIsFormOpen(true);
            }
          : undefined,
        // canDelete ? setDeletingSemester : undefined,
      ),
    [role],
  );

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

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplate();
      downloadBlob(blob, "semesters_template.xlsx");
      toast.success("Template downloaded");
    } catch {
      toast.error("Failed to download template");
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative flex flex-col gap-4 h-full flex-1">
      {/* TOOLBAR */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm học kỳ..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-10"
            />
            {searchValue && (
              <X
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 cursor-pointer"
                onClick={() => setSearchValue("")}
              />
            )}
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={startDateFilter || ""}
              onChange={(e) => setStartDateFilter(e.target.value || undefined)}
              className="h-10 text-muted-foreground w-full sm:w-40"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={endDateFilter || ""}
              onChange={(e) => setEndDateFilter(e.target.value || undefined)}
              className="h-10 text-muted-foreground w-full sm:w-40"
            />
            {(startDateFilter || endDateFilter) && (
              <Button
                variant="ghost"
                size="sm"
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

        {/* Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <Button variant="outline" className="h-10" onClick={handleExport} disabled={isFetching}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          {(role === "SUPER_ADMIN" || role === "ADMIN") && (
            <>
              <Button variant="outline" className="h-10" onClick={() => setOpenBackupModal(true)}>
                <Upload className="w-4 h-4 mr-2" /> Import
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 h-10 text-white"
                onClick={() => {
                  setEditingSemester(null);
                  setIsFormOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Semester
              </Button>
            </>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="flex flex-col flex-1 min-h-0 relative">
        <DataTable<SemesterResponse, unknown>
          columns={columns as ColumnDef<SemesterResponse, unknown>[]}
          data={safeData}
          isLoading={isLoading}
          isFetching={isFetching}
          manualPagination={true}
          manualSearch={true}
          pageIndex={tableData?.pagination?.page ?? pageIndex}
          pageSize={tableData?.pagination?.pageSize ?? pageSize}
          totalPage={tableData?.pagination?.totalPages ?? 0}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
          onRowClick={(row) => onSelectSemester(row.id)}
        />
      </div>

      {/* MODALS */}
      {isFormOpen && (
        <SemesterForm
          open={isFormOpen}
          initialData={editingSemester}
          onClose={() => setIsFormOpen(false)}
          onSubmit={editingSemester ? handleUpdate : handleCreate}
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
          title="Xóa học kỳ"
          description={`Bạn có chắc chắn muốn xóa "${deletingSemester.name}"?`}
          onCancel={() => setDeletingSemester(null)}
          onConfirm={handleDelete}
        />
      )}

      <ImportExportModal
        title="Học kỳ"
        open={openBackupModal}
        setOpen={setOpenBackupModal}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
        mode={mode}
      />
    </div>
  );
}
