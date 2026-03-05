import { createColumnHelper } from "@tanstack/react-table";
import type { TrainingClass } from "@/types/trainingClass";
import { Badge } from "@/components/ui/badge";
import ActionBtn from "@/components/data_table/ActionBtn";
import { Check, EyeIcon, X } from "lucide-react";
import dayjs from "dayjs";
import SortHeader from "@/components/data_table/SortHeader";
import { getTrainingClassStatusPresentation } from "./utils/statusPresentation";
import { createBaseColumns } from "@/components/data_table/baseColumns";

export type TableActions = {
  onView?: (row: TrainingClass) => void;
  onNavigate?: (row: TrainingClass) => void;
  onApprove?: (row: TrainingClass) => void;
  onReject?: (row: TrainingClass) => void;
};

export type TablePermissions = {
  canUpdate?: boolean;
  canApprove?: boolean;
  canReject?: boolean;
  canDelete?: boolean;
};

export const getColumns = (role: string, _permissions: TablePermissions, actions?: TableActions) => {
  const columnHelper = createColumnHelper<TrainingClass>();
  const isReviewRole = role === "MANAGER" || role === "ADMIN" || role === "SUPER_ADMIN";
  const base = createBaseColumns<TrainingClass>()
  const baseColumns = [
    /* ================= SELECT ================= */
    base.selectColumn,

    /* ================= NUMBER ================= */
    base.numberColumn,

    /* ================= CLASS CODE ================= */
    columnHelper.accessor("classCode", {
      header: (info) => <SortHeader title="Class Code" info={info} />,
      size: 140,
      cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
      meta: { title: "Class Code" },
    }),

    /* ================= CLASS NAME ================= */
    columnHelper.accessor("className", {
      header: (info) => <SortHeader title="Class Name" info={info} />,
      size: 200,
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      meta: { title: "Class Name" },
    }),

    /* ================= SEMESTER ================= */
    columnHelper.accessor("semesterName", {
      header: (info) => <SortHeader title="Semester" info={info} />,
      size: 160,
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || "-"}</span>,
      meta: { title: "Semester" },
    }),

    /* ================= CREATOR ================= */
    columnHelper.accessor("creatorName", {
      header: (info) => <SortHeader title="Creator" info={info} />,
      size: 160,
      cell: (info) => <span className="text-muted-foreground">{info.getValue() || "-"}</span>,
      meta: { title: "Creator" },
    }),

    /* ================= START DATE ================= */
    columnHelper.accessor("startDate", {
      header: (info) => <SortHeader title="Start Date" info={info} />,
      size: 130,
      cell: (info) => (info.getValue() ? dayjs(info.getValue()).format("DD-MM-YYYY") : "-"),
      meta: { title: "Start Date" },
    }),

    /* ================= END DATE ================= */
    columnHelper.accessor("endDate", {
      header: (info) => <SortHeader title="End Date" info={info} />,
      size: 130,
      cell: (info) => (info.getValue() ? dayjs(info.getValue()).format("DD-MM-YYYY") : "-"),
      meta: { title: "End Date" },
    }),
  ];

  const statusColumn =
    isReviewRole
      ? columnHelper.accessor("status", {
        header: (info) => <SortHeader info={info} title="Status" />,
        size: 120,
        cell: ({ row }) => {
          const presentation = getTrainingClassStatusPresentation(row.original);

          return (
            <Badge className={presentation.badgeClassName}>
              {presentation.label}
            </Badge>
          );
        },
        meta: { title: "Status" },
      })
      : columnHelper.accessor("isActive", {
        header: (info) => <SortHeader info={info} title="Active Status" />,
        size: 120,
        cell: (info) => (
          <Badge
            className={
              info.getValue()
                ? "bg-blue-100 text-blue-700 border-blue-200 shadow-none"
                : "bg-gray-100 text-gray-700 border-gray-200 shadow-none"
            }
          >
            {info.getValue() ? "Active" : "Inactive"}
          </Badge>
        ),
        meta: { title: "Active Status" },
      });

  const actionColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    size: 180,
    cell: ({ row }) => (
      <div className="flex gap-2">
        {actions?.onNavigate && (
          <ActionBtn
            tooltipText="View"
            icon={<EyeIcon size={12} />}
            onClick={() => actions.onNavigate!(row.original)}
          />
        )}
        {getTrainingClassStatusPresentation(row.original).value === "PENDING_APPROVAL" && _permissions.canApprove && actions?.onApprove && (
          <ActionBtn
            tooltipText="Approve"
            icon={<Check size={12} />}
            onClick={() => actions.onApprove!(row.original)}
          />
        )}
        {getTrainingClassStatusPresentation(row.original).value === "PENDING_APPROVAL" && _permissions.canReject && actions?.onReject && (
          <ActionBtn
            tooltipText="Reject"
            icon={<X size={12} />}
            onClick={() => actions.onReject!(row.original)}
          />
        )}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  });

  return [...baseColumns, statusColumn, actionColumn, base.columnControl];
};
