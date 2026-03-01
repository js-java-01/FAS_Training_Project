import type { ColumnDef } from "@tanstack/react-table";
import type { TopicObjective } from "@/types/topicObjective";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  onEdit: (row: TopicObjective) => void;
  onDelete: (row: TopicObjective) => void;
}

export const getObjectiveColumns = ({
  onEdit,
  onDelete,
}: Props): ColumnDef<TopicObjective>[] => [
  {
    accessorKey: "code",
    header: (info) => (
      <SortHeader info={info} title="Code" />
    ),
  },
  {
    accessorKey: "name",
    header: (info) => (
      <SortHeader info={info} title="Name" />
    ),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">
        {row.original.details || "-"}
      </div>
    ),
  },
  {
    accessorKey: "createdDate",
    header: "Created",
    cell: ({ row }) =>
      row.original.createdDate
        ? dayjs(row.original.createdDate).format("DD/MM/YYYY")
        : "-",
  },
  {
    accessorKey: "updatedDate",
    header: "Updated",
    cell: ({ row }) =>
      row.original.updatedDate
        ? dayjs(row.original.updatedDate).format("DD/MM/YYYY")
        : "-",
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <ActionBtn
          icon={<Pencil size={16} />}
          tooltipText="Edit"
          onClick={() => onEdit(row.original)}
        />
        <ActionBtn
          icon={<Trash2 size={16} />}
          tooltipText="Delete"
          onClick={() => onDelete(row.original)}
        />
      </div>
    ),
  },
];