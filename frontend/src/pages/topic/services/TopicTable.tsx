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
import { topicApi, type Topic } from "@/api/topicApi";
import { getColumns } from "../components/columns";
import { TopicCreateModal } from "../components/TopicCreateModal";

export default function TopicTable() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);
  const [deletingTopic, setDeletingTopic] = useState<Topic | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 300);

  const { data: tableData, isLoading, isFetching, refetch: reload } = useGetAllTopics({
    page: pageIndex,
    pageSize,
    keyword: debouncedSearch,
  });

  const handleDelete = async () => {
    if (!deletingTopic) return;
    try {
      await topicApi.deleteTopic(deletingTopic.id);
      toast.success("Topic deleted");
      queryClient.invalidateQueries({ queryKey: ["topics"] });
      await reload();
    } catch {
      toast.error("Failed to delete topic");
    } finally {
      setDeletingTopic(null);
    }
  };

  const columns = useMemo(() => getColumns({
    onView: (t) => navigate(`/topics/${t.id}`),
    onEdit: (t) => setEditTopic(t),
    onDelete: (t) => setDeletingTopic(t),
  }), [navigate]);

  return (
    <div className="relative space-y-4 h-full flex-1">
      <DataTable
        columns={columns as any}
        data={tableData?.items ?? []}
        isLoading={isLoading}
        isFetching={isFetching}
        manualPagination
        pageIndex={tableData?.pagination?.page ?? pageIndex}
        pageSize={tableData?.pagination?.pageSize ?? pageSize}
        totalPage={tableData?.pagination?.totalPages ?? 0}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        isSearch
        onSearchChange={setSearchValue}
        headerActions={
          <div className="flex gap-2">
            <Button variant="secondary"><DatabaseBackup size={16} /> Import / Export</Button>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Add New Topic
            </Button>
          </div>
        }
      />

      <TopicCreateModal
        open={showCreateModal || !!editTopic}
        topic={editTopic}
        onClose={() => { setShowCreateModal(false); setEditTopic(null); }}
        onSuccess={() => { queryClient.invalidateQueries({ queryKey: ["topics"] }); reload(); }}
      />

      <ConfirmDialog
        open={!!deletingTopic}
        title="Delete Topic"
        description={`Are you sure you want to delete "${deletingTopic?.topicName}"?`}
        onCancel={() => setDeletingTopic(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function useGetAllTopics(arg0: { page: number; pageSize: number; keyword: string; }): { data: any; isLoading: any; isFetching: any; refetch: any; } {
    throw new Error("Function not implemented.");
}
