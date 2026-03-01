import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { TrainingClass } from "@/types/trainingClass";
import { getColumns, type TablePermissions } from "./column";
import { TrainingClassForm } from "./form";
import { FacetedFilter } from "@/components/FacedFilter";
import { ClassStatus } from "./enum/ClassStatus";
import { useGetTrainerClasses } from "./trainer/services/queries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ClientDataTable } from "@/components/data_table/ClientDataTable";
import { TrainingClassDetailDialog } from "./DetailDialog";


/* ======================================================= */
interface TrainingClassesTableProps {
  role: string;
  semesterId: string;
  onSelectSemester: (semesterId: string | null) => void;
  permissions: string[];
  onViewDetails: (id: string, name: string) => void;
}

export default function TrainingClassesTable({
  role,
  semesterId,
  onSelectSemester,
  permissions,
  onViewDetails,
}: TrainingClassesTableProps) {
  /* ===================== STATE ===================== */

  const [openForm, setOpenForm] = useState(false);
  const [viewingClass, setViewingClass] = useState<TrainingClass | null>(null);

  /* ---------- faceted filter ---------- */
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const statusParam = statusFilter.length === 1 ? statusFilter[0] : undefined;

  const queryClient = useQueryClient();

  /* ===================== DATA ===================== */
  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetTrainerClasses({
    semesterId,
    classStatus: statusParam,
  });

  const safeTableData = useMemo(() => {
    return tableData?.data?.classes || [];
  }, [tableData]);

  /* ===================== COLUMNS ===================== */
  const tablePermissions: TablePermissions = {
    canUpdate: permissions.includes("CLASS_UPDATE"),
    canDelete: permissions.includes("CLASS_DELETE"),
  };

  const columns = useMemo(
    () =>
      getColumns(role, tablePermissions, {
        onView: setViewingClass,
      }),
    [],
  );

  /* ===================== HANDLERS ===================== */
  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: ["training-classes"] });
  };

  const handleSaved = async () => {
    toast.success("Class request submitted successfully");
    await invalidateAll();
    setOpenForm(false);
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectSemester(null);
              }}
              className=" hover:text-blue-300 text-blue-800"
            >
              Danh sách Học kỳ
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage className="font-bold text-blue-800">
              Học kỳ {tableData?.data?.semesterName || "..."}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ClientDataTable<TrainingClass, unknown>
        columns={columns as ColumnDef<TrainingClass, unknown>[]}
        data={safeTableData}
        isLoading={isLoading}
        isFetching={isFetching}
        /* SEARCH */
        isSearch={true}
        searchPlaceholder="class name or code"
        searchValue={["className", "classCode"]}
        /* ACTIONS */
        headerActions={
          role === "MANAGER" && (
            <div className="flex gap-2">
              <Button onClick={() => setOpenForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus className="h-4 w-4" />
                Open Class Request
              </Button>
            </div>
          )
        }
        facetedFilters={
          role === "MANAGER" && (
            <div>
              <FacetedFilter
                title="Trạng thái"
                options={[
                  { value: ClassStatus.APPROVED, label: "Approved" },
                  { value: ClassStatus.PENDING_APPROVAL, label: "Pending Approval" },
                  { value: ClassStatus.REJECTED, label: "Rejected" },
                ]}
                value={statusFilter}
                setValue={setStatusFilter}
                multiple={false}
              />
            </div>
          )
        }
      />

      <TrainingClassForm role={role} open={openForm} onClose={() => setOpenForm(false)} onSaved={handleSaved} />

      <TrainingClassDetailDialog
        open={!!viewingClass}
        trainingClass={viewingClass}
        onClose={() => setViewingClass(null)}
        onViewDetails={onViewDetails}
      />
    </div>
  );
}
