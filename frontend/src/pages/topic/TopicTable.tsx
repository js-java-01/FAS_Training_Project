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
import ImportExportModal from "@/components/modal/ImportExportModal";

import { topicApi, type Topic } from "@/api/topicApi";
import { getColumns } from "./components/columns";
import { TopicCreateModal } from "./components/TopicCreateModal";

import { TOPIC_QUERY_KEY, useGetAllTopics } from "./services/queries";
import {
  useExportTopics,
  useImportTopics,
  useDownloadTopicTemplate,
} from "./services/mutations";

export default function TopicTable() {
  /* ---------- modal state ---------- */
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);

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
    if (sorting && sorting.length > 0) {
      const { id, desc } = sorting; 
      return `${id},${desc ? "desc" : "asc"}`;
    }
    return "createdDate,desc"; 
  }, [sorting]);

  const { mutateAsync: exportTopics } = useExportTopics();
  const { mutateAsync: importTopics } = useImportTopics();
  const { mutateAsync: downloadTemplate } = useDownloadTopicTemplate();

  /* ---------- query (Sử dụng hook useGetAllTopics) ---------- */
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch: reload,
  } = useGetAllTopics({
    page: pageIndex,
    pageSize,
    sort: sortParam,
    keyword: debouncedSearch,
  });

  // Helper để bọc data an toàn
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
  const invalidateTopics = async () => {
    await queryClient.invalidateQueries({ queryKey: [TOPIC_QUERY_KEY] });
  };

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    if (!deletingTopic) return;
    try {
      await topicApi.deleteTopic(deletingTopic.id);
      toast.success("Topic deleted successfully");
      await invalidateTopics();
      // reload(); // Thường invalidateQueries là đủ, nhưng gọi reload cho chắc
    } catch {
      toast.error("Failed to delete topic");
    } finally {
      setDeletingTopic(null);
    }
  };

  /* ---------- columns ---------- */
  const columns = useMemo(
    () =>
      getColumns({
        onView: (t) => navigate(`/topics/${t.id}`),
        onEdit: (t) => {
          setEditTopic(t);
          setShowCreateModal(true);
        },
        onDelete: (t) => setDeletingTopic(t),
      }),
    [navigate],
  );

  /* ===================== RENDER ===================== */
  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable<Topic, unknown>
        columns={columns as ColumnDef<Topic, unknown>[]}
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
        searchPlaceholder="topic name or code"
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
                setEditTopic(null);
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Topic
            </Button>
          </div>
        }
      />

      {/* ===== Import / Export ===== */}
      <ImportExportModal
        title="Topics"
        open={isImportExportOpen}
        setOpen={setIsImportExportOpen}
        onImport={async (file) => {
          await importTopics(file);
          await invalidateTopics();
        }}
        onExport={async () => {
          await exportTopics();
        }}
        onDownloadTemplate={async () => {
          await downloadTemplate();
        }}
      />

      {/* ===== Create/Edit Modal ===== */}
      <TopicCreateModal
        open={showCreateModal}
        topic={editTopic}
        onClose={() => {
          setShowCreateModal(false);
          setEditTopic(null);
        }}
        onSuccess={async () => {
          setShowCreateModal(false);
          await invalidateTopics();
        }}
      />

      {/* ===== Delete confirm ===== */}
      <ConfirmDialog
        open={!!deletingTopic}
        title="Delete Topic"
        description={`Are you sure you want to delete "${deletingTopic?.topicName}"?`}
        onCancel={() => setDeletingTopic(null)}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}