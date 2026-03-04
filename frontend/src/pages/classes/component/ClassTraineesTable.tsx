import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { DataTable } from "@/components/data_table/DataTable";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { TraineeDetailsResponse } from "@/types/trainerClass";
import { useGetClassTrainees } from "@/pages/training-classes/trainer/services/queries";
import { Button } from "@/components/ui/button";
import { EyeIcon, FileBarChartIcon } from "lucide-react";
import TopicMarkModal from "@/pages/topic-mark/TopicMarkManagement";
import type { TrainingClass } from "@/types/trainingClass";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import EntityImportExportButton from "@/components/modal/import-export/EntityImportExportBtn";
import { useExportTrainees, useExportTraineeTemplate, useImportTrainees } from "../service/mutations";
import { useExportTemplate } from "@/pages/topic-mark/services/mutations";
import ActionBtn from "@/components/data_table/ActionBtn";

interface Props {
  classId: string;
  trainingClass: TrainingClass | null;
}

const EMPTY_DATA: TraineeDetailsResponse[] = [];

const columnHelper = createColumnHelper<TraineeDetailsResponse>();
const base = createBaseColumns<TraineeDetailsResponse>();

const columns = [
  base.numberColumn,
  columnHelper.accessor("firstName", {
    header: "Full Name",
    cell: (info) => (
      <span className="font-semibold">
        {info.row.original.firstName} {info.row.original.lastName}
      </span>
    ),
    meta: {
      title: "Full Name"
    }
  }),
  columnHelper.accessor("email", {
    header: "Email",
    meta: {
      title: "Email"
    }
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 120,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <ActionBtn
          tooltipText="View"
          icon={<EyeIcon size={12} />}
          onClick={() => console.log("View", row.original)}
        />
      </div>
    ),
    enableSorting: false,
    meta: {
      title: "Actions"
    }
  }),
  base.columnControl,
];

export default function ClassTraineesTable({ classId, trainingClass }: Props) {
  const [openTopicMark, setOpenTopicMark] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

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
    </div>
  );
}
