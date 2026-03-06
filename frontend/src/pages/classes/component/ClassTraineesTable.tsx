import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTable } from "@/components/data_table/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { TraineeDetailsResponse } from "@/types/trainerClass";
import { useGetClassTrainees } from "@/pages/training-classes/trainer/services/queries";
import { Button } from "@/components/ui/button";
import { EyeIcon, FileBarChartIcon, Plus, Trash } from "lucide-react";
import TopicMarkModal from "@/pages/topic-mark/TopicMarkManagement";
import type { TrainingClass } from "@/types/trainingClass";
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn";
import { useExportTrainees, useExportTraineeTemplate, useImportTrainees } from "../service/mutations";


import { AddTraineeModal } from "./AddTraineeModal";
import { getColumns } from "./columns";
import { useRoleSwitch } from "@/contexts/RoleSwitchContext";
import { ROLES } from "@/types/role";

import { toast } from "sonner";
import { enrollmentApi } from "@/api/enrollmentApi";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Props {
  classId: string;
  trainingClass: TrainingClass | null;

}



export default function ClassTraineesTable({ classId, trainingClass }: Props) {
  const { activeRole } = useRoleSwitch();
  const role = activeRole?.name ?? "";
  const queryClient = useQueryClient();
  const [openTopicMark, setOpenTopicMark] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const EMPTY_DATA: TraineeDetailsResponse[] = [];
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [isOpeningAddModal, setIsOpeningAddModal] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeDetailsResponse | null>(null);
  const columns = useMemo(() => getColumns({
    onView: (row) => { },
    onDelete: (trainee) => {
      setIsDeleteModalOpen(true);
      setSelectedTrainee(trainee);
    },
    role
  }), []);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetClassTrainees(classId, {
    page: pageIndex,
    size: pageSize,
    keyword: debouncedSearch,
  });

  const safeData = useMemo(() => tableData?.items || EMPTY_DATA, [tableData]);

  const handleSearchChange = useCallback((e: any) => {
    const text = typeof e === "string" ? e : e?.target?.value || "";
    setSearchValue(text);
    setPageIndex(0);
  }, []);
  const handleConfirm = useCallback(async (email: string) => {
    try {
      await enrollmentApi.enroll(classId, email);
      toast.success("Trainee added successfully");
      queryClient.invalidateQueries({
        queryKey: ["class-trainees", classId]
      });
      setIsOpeningAddModal(false);

    } catch (error) {
      toast.error("Failed to add trainee");
    }
  }, []);
  const handleDelete = useCallback(async () => {
    if (!selectedTrainee) return;
    try {
      await enrollmentApi.deleteEnrollment(selectedTrainee.id, classId);
      toast.success("Trainee removed successfully");
      queryClient.invalidateQueries({
        queryKey: ["class-trainees", classId]
      });
      setIsDeleteModalOpen(false);
      setSelectedTrainee(null);
    } catch (error) {
      toast.error("Failed to remove trainee");
    }
  }, [selectedTrainee, classId]);

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <DataTable<TraineeDetailsResponse, unknown>
        columns={columns as ColumnDef<TraineeDetailsResponse, unknown>[]}
        data={safeData}
        isLoading={isLoading}
        isFetching={isFetching}
        /* SERVER-SIDE MODE */
        manualPagination={true}
        manualSearch={true}
        pageIndex={tableData?.pagination?.page ?? pageIndex}
        pageSize={tableData?.pagination?.pageSize ?? pageSize}
        totalPage={tableData?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        /* SEARCH */
        isSearch={true}
        onSearchChange={handleSearchChange}

        headerActions={
          role !== ROLES.STUDENT && (<div className="flex items-end justify-between gap-2">
            <Button variant='outline' onClick={() => setOpenTopicMark(true)}><FileBarChartIcon /> Topic mark</Button>
            <EntityImportExportButton
              mode="all" title={"Trainee"}
              useExportHook={() => useExportTrainees({ classCode: trainingClass?.classCode || "" })}
              useImportHook={() => useImportTrainees({ classCode: trainingClass?.classCode || "", classId: trainingClass?.id || "" })}
              useTemplateHook={() => useExportTraineeTemplate()}
            />
            <Button
              onClick={() => {
                setIsOpeningAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Trainee
            </Button>
          </div>)

        }
      />

      {trainingClass && (
        <TopicMarkModal
          open={openTopicMark}
          onOpenChange={setOpenTopicMark}
          trainingClass={trainingClass}
        />
      )}
      {isOpeningAddModal && (
        <AddTraineeModal
          open={isOpeningAddModal}
          onOpenChange={setIsOpeningAddModal}
          onConfirm={handleConfirm}
          isLoading={false}
        />
      )}
      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTrainee(null);
        }}
        onConfirm={handleDelete}
        title="Delete Trainee"
        message={
          <>
            This action cannot be undone. This will permanently delete the trainee{" "}
            <span className="font-semibold">
              &quot;{selectedTrainee?.firstName + " " + selectedTrainee?.lastName}&quot;
            </span>
            .
          </>
        }
      />
    </div>
  );
}
