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
import { createBaseColumns } from "@/components/data_table/baseColumns";
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn";
import { useExportTrainees, useExportTraineeTemplate, useImportTrainees } from "../service/mutations";
import ActionBtn from "@/components/data_table/ActionBtn";
import { getColumns } from "./Columns";
import { AddTraineeModal } from "./AddTraineeModal";

interface Props {
  classId: string;
  trainingClass: TrainingClass | null;

}



export default function ClassTraineesTable({ classId, trainingClass }: Props) {
  const [openTopicMark, setOpenTopicMark] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const EMPTY_DATA: TraineeDetailsResponse[] = [];
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);
  const [isOpeningAddModal, setIsOpeningAddModal] = useState(false);
  const columns = useMemo(() => getColumns({
    onView: (row) => { },
    onDelete: (row) => { },
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
          <div className="flex items-end justify-between gap-2">
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
          </div>
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
          onConfirm={(email) => { }}
          isLoading={false}
        />
      )}
    </div>
  );
}
