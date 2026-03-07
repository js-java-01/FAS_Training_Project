import { createColumnHelper } from "@tanstack/react-table";
import type { SkillGroupData } from "@/api/skillApi";
import ActionBtn from "@/components/data_table/ActionBtn";
import { EyeIcon, EditIcon, Trash } from "lucide-react";
import { createBaseColumns } from "@/components/data_table/baseColumns";
import SortHeader from "@/components/data_table/SortHeader";

export type SkillGroupTableActions = {
  onView?: (row: SkillGroupData) => void;
  onEdit?: (row: SkillGroupData) => void;
  onDelete?: (row: SkillGroupData) => void;
};

export const getSkillGroupColumns = (actions?: SkillGroupTableActions) => {
  const col = createColumnHelper<SkillGroupData>();
  const base = createBaseColumns<SkillGroupData>();

  return [
    base.selectColumn,
    base.numberColumn,

    col.accessor("name", {
      header: (info) => <SortHeader title="Group Name" info={info} />,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      meta: { title: "Group Name" },
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

    col.accessor("skillCount", {
      header: (info) => <SortHeader title="Skills" info={info} />,
      size: 100,
      cell: (info) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
          {info.getValue()} skill{info.getValue() !== 1 ? "s" : ""}
        </span>
      ),
      meta: { title: "Skills" },
    }),

    col.display({
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {actions?.onView && (
            <ActionBtn
              tooltipText="View"
              icon={<EyeIcon size={12} />}
              onClick={() => actions.onView!(row.original)}
            />
          )}
          {actions?.onEdit && (
            <ActionBtn
              tooltipText="Edit"
              icon={<EditIcon size={12} />}
              onClick={() => actions.onEdit!(row.original)}
            />
          )}
          {actions?.onDelete && (
            <ActionBtn
              tooltipText="Delete"
              icon={<Trash size={12} />}
              onClick={() => actions.onDelete!(row.original)}
            />
          )}
        </div>
      ),
      enableSorting: false,
      meta: { title: "Actions" },
    }),

    /* ================= COLUMN CONTROL ================= */
    base.columnControl,
  ];
};
