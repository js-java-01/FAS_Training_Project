import { useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { FiEye } from "react-icons/fi";

import { DataTable } from "@/components/data_table/DataTable";
import ActionBtn from "@/components/data_table/ActionBtn";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import { topicApi, type TopicDetailResponse } from "@/api/topicApi";

interface Props {
  classId: string;
  trainingProgramId?: string;
}

const EMPTY_DATA: TopicDetailResponse[] = [];

const columnHelper = createColumnHelper<TopicDetailResponse>();
const base = createBaseColumns<TopicDetailResponse>();

export default function ClassTopicsTable({ classId, trainingProgramId }: Props) {
  const navigate = useNavigate();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: tableData, isLoading, isFetching } = useQuery({
    queryKey: ["class-topics", classId, pageIndex, pageSize, debouncedSearch],
    queryFn: () =>
      topicApi.getMyTopics({
        page: pageIndex,
        size: pageSize,
        keyword: debouncedSearch,
      }),
    enabled: !!classId,
    placeholderData: (prev) => prev,
  });

  const safeRawData = useMemo(() => tableData?.items ?? EMPTY_DATA, [tableData]);

  const safeData = useMemo(() => {
    return safeRawData.filter((item) => {
      const topicClassId = item.trainingClassReponse?.id;
      if (topicClassId && topicClassId === classId) return true;

      const topicProgramId = item.trainingProgram?.id ?? item.trainingClassReponse?.trainingProgramId;
      if (topicProgramId && trainingProgramId) {
        return topicProgramId === trainingProgramId;
      }

      return !topicClassId && !trainingProgramId;
    });
  }, [safeRawData, classId, trainingProgramId]);

  const columns = useMemo(() => {
    return [
      base.numberColumn,
      columnHelper.accessor((row) => row.topic?.topicName ?? "-", {
        id: "topicName",
        header: "Topic Name",
        size: 260,
      }),
      columnHelper.accessor((row) => row.topic?.topicCode ?? "-", {
        id: "topicCode",
        header: "Topic Code",
        size: 150,
        cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
      }),
      columnHelper.accessor(
        (row) => row.trainingProgram?.name ?? row.trainingClassReponse?.trainingProgramName ?? "-",
        {
          id: "programName",
          header: "Program",
          size: 260,
        },
      ),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => (
          <ActionBtn
            icon={<FiEye />}
            tooltipText="View topic details"
            onClick={() => {
              const topicId = row.original.topic?.id;
              if (topicId) {
                navigate(`/topics/${topicId}`);
              }
            }}
          />
        ),
      }),
      base.columnControl,
    ] as ColumnDef<TopicDetailResponse, unknown>[];
  }, [navigate]);

  return (
    <div className="flex flex-col flex-1 min-h-0 relative">
      <DataTable<TopicDetailResponse, unknown>
        columns={columns}
        data={safeData}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination
        manualSearch
        pageIndex={tableData?.pagination?.page ?? pageIndex}
        pageSize={tableData?.pagination?.pageSize ?? pageSize}
        totalPage={tableData?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        onSearchChange={setSearchValue}
      />
    </div>
  );
}
