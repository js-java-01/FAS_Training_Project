import type { Topic } from "@/api/topicApi";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EyeIcon, EditIcon, Trash } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import SortHeader from "@/components/data_table/SortHeader";
import { createBaseColumns } from "@/components/data_table/baseColumns";

export const getColumns = (handlers: {
  onView?: (t: Topic) => void;
  onEdit?: (t: Topic) => void;
  onDelete?: (t: Topic) => void;
}) => {
  const base = createBaseColumns<Topic>();
  const columns: ColumnDef<Topic, any>[] = [
    base.selectColumn,
    base.numberColumn,
    {
      accessorKey: "topicName",
      header: (info) => <SortHeader title="Topic name" info={info} />,
      cell: (info) => <div>{info.getValue()}</div>,
      meta: { title: "Topic name" },
    },
    {
      accessorKey: "topicCode",
      header: (info) => <SortHeader title="Topic Code" info={info} />,
      cell: (info) => (
        <div className="font-mono text-xs">{info.getValue()}</div>
      ),
      meta: { title: "Topic Code" },
    },
    {
      accessorKey: "createdByName",
      header: (info) => <SortHeader title="Created by" info={info} />,
      cell: (info) => <div className="text-sm">{info.getValue() ?? "-"}</div>,
      meta: { title: "Created by" },
      size: 180,
    },
    {
      accessorKey: "createdDate",
      header: (info) => <SortHeader title="Created date" info={info} />,
      cell: (info) => {
        const v = info.getValue() as string | undefined;
        if (!v) return <div>-</div>;
        const d = new Date(v);
        const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        return <div className="text-sm whitespace-nowrap">{formatted}</div>;
      },
      meta: { title: "Created date" },
      size: 160,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue() as string;
        const statusStyles: Record<string, string> = {
          DRAFT: "bg-gray-100 text-gray-600",
          UNDER_REVIEW: "bg-blue-100 text-blue-700",
          ACTIVE: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
        };
        const statusLabels: Record<string, string> = {
          DRAFT: "Draft",
          UNDER_REVIEW: "Under Review",
          ACTIVE: "Active",
          REJECTED: "Rejected",
        };
        return (
          <div
            className={`px-2 py-1 rounded text-xs w-fit ${statusStyles[status] ?? "bg-gray-100 text-gray-600"}`}
          >
            {statusLabels[status] ?? status}
          </div>
        );
      },
      meta: { title: "Status" },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: (info) => (
        <div
          className="text-sm text-gray-500 max-w-xs truncate"
          title={info.getValue() ?? ""}
        >
          {info.getValue() || "—"}
        </div>
      ),
      meta: { title: "Description" },
      enableSorting: false,
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: (info) => (
        <div
          className="text-sm text-gray-500 max-w-[160px] truncate"
          title={info.getValue() ?? ""}
        >
          {info.getValue() || "—"}
        </div>
      ),
      meta: { title: "Note" },
      enableSorting: false,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const t = row.original as Topic;
        return (
          <div className="flex gap-2">
            <ActionBtn
              icon={<EyeIcon size={12} />}
              tooltipText="View"
              onClick={() => handlers.onView?.(t)}
            />
            <ActionBtn
              icon={<EditIcon size={12} />}
              tooltipText="Edit"
              onClick={() => handlers.onEdit?.(t)}
            />
            <ActionBtn
              icon={<Trash size={12} />}
              tooltipText="Delete"
              onClick={() => handlers.onDelete?.(t)}
            />
          </div>
        );
      },
      meta: { title: "Actions" },
      enableSorting: false,
      size: 120,
    },

    /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];

  return columns;
};
