import { createColumnHelper } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data_table/DataTable";
import ActionBtn from "@/components/data_table/ActionBtn";
import { useToast } from "@/hooks/use-toast";
import { sessionService } from "@/api/sessionService";
import type { SessionResponse } from "@/types/session";
import { SESSION_TYPE_OPTIONS } from "@/types/session";

import { EditIcon, Trash } from "lucide-react";

type Props = {
  data: SessionResponse[];
  isLoading?: boolean;
  onEdit?: (session: SessionResponse) => void;
  onDeleted?: () => void;
};

export function SessionList({ data, isLoading, onEdit, onDeleted }: Props) {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const typeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    SESSION_TYPE_OPTIONS.forEach((o) => map.set(o.value, o.label));
    return map;
  }, []);

  const columns = useMemo(() => {
    const columnHelper = createColumnHelper<SessionResponse>();

    return [
      columnHelper.accessor("sessionOrder", {
        header: "Session Order",
        size: 120,
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("topic", {
        header: "Topic",
        size: 320,
        cell: (info) => <span className="text-foreground line-clamp-2">{info.getValue() || "-"}</span>,
      }),
      columnHelper.accessor("type", {
        header: "Learning Type",
        size: 180,
        cell: (info) => {
          const raw = info.getValue();
          const label = raw ? (typeLabelMap.get(raw) ?? raw) : "-";
          return (
            <Badge variant="secondary" className="shadow-none">
              {label}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        size: 120,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ActionBtn tooltipText="Edit" icon={<EditIcon size={12} />} onClick={() => onEdit?.(row.original)} />
            <ActionBtn
              tooltipText="Delete"
              icon={<Trash size={12} />}
              disabled={deletingId === row.original.id}
              onClick={async () => {
                const ok = window.confirm(
                  "Are you sure you want to delete this session? This action cannot be undone.",
                );
                if (!ok) return;

                try {
                  setDeletingId(row.original.id);
                  await sessionService.deleteSession(row.original.id);
                  toast({ title: "Deleted", description: "Session deleted successfully." });
                  onDeleted?.();
                } catch {
                  toast({
                    title: "Delete failed",
                    description: "Could not delete session. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setDeletingId(null);
                }
              }}
            />
          </div>
        ),
      }),
    ];
  }, [deletingId, onDeleted, onEdit, toast, typeLabelMap]);

  return (
    <div className="w-full">
      <DataTable<SessionResponse, any> columns={columns} data={data} isLoading={isLoading} />
    </div>
  );
}
