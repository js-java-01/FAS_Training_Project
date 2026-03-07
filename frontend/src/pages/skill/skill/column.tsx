import { createColumnHelper } from "@tanstack/react-table";
import type { SkillData } from "@/api/skillApi";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Trash } from "lucide-react";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import SortHeader from "@/components/data_table/SortHeader";

export type SkillTableActions = {
  onDelete?: (row: SkillData) => void;
};

export const getSkillColumns = (actions?: SkillTableActions) => {
  const col = createColumnHelper<SkillData>();
  const base = createBaseColumns<SkillData>();

  return [
    base.selectColumn,
    base.numberColumn,

    col.accessor("name", {
      header: (info) => <SortHeader title="Skill Name" info={info} />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      meta: { title: "Skill Name" },
    }),

    col.accessor("code", {
      header: (info) => <SortHeader title="Code" info={info} />,
      size: 140,
      cell: (info) => (
        <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {info.getValue()}
        </span>
      ),
      meta: { title: "Code" },
    }),

    col.accessor("groupName", {
      header: (info) => <SortHeader title="Group" info={info} />,
      size: 160,
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {info.getValue()}
        </span>
      ),
      meta: { title: "Group" },
    }),

    col.accessor("description", {
      header: "Description",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground line-clamp-2">
          {info.getValue() || "—"}
        </span>
      ),
      meta: { title: "Description" },
    }),

    col.display({
      id: "actions",
      header: "Actions",
      size: 80,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {actions?.onDelete && (
            <ActionBtn
              tooltipText="Delete"
              icon={<Trash size={12} />}
              onClick={() => actions.onDelete!(row.original)}
              className="hover:border-red-300 hover:text-red-600"
            />
          )}
        </div>
      ),
    }),

    /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];
};
