import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { FieldSchema } from "@/types/common/datatable";
import type { SortEntry } from "@/types";

interface SortableHeaderProps {
  field: FieldSchema;
  sortState: SortEntry[];
  onToggleSort: (fieldName: string) => void;
}

export function SortableHeader({ field, sortState, onToggleSort }: SortableHeaderProps) {
  const isSortable = field.sortable === true;
  const sortIndex = sortState.findIndex((s) => s.field === field.name);
  const entry = sortIndex !== -1 ? sortState[sortIndex] : null;

  const SortIcon =
    entry?.direction === "asc"
      ? ArrowUp
      : entry?.direction === "desc"
        ? ArrowDown
        : ArrowUpDown;

  return (
    <TableHead
      className={cn(
        isSortable && "cursor-pointer select-none hover:bg-muted/50"
      )}
      onClick={() => isSortable && onToggleSort(field.name)}
    >
      <div className="flex items-center gap-1">
        {field.label}
        {isSortable && (
          <span className="inline-flex items-center gap-0.5">
            <SortIcon
              className={cn(
                "h-4 w-4",
                entry
                  ? "text-blue-500"
                  : "text-muted-foreground/50"
              )}
            />
            {entry && sortState.length > 1 && (
              <span className="text-[10px] font-semibold leading-none text-blue-500 min-w-[12px] text-center">
                {sortIndex + 1}
              </span>
            )}
          </span>
        )}
      </div>
    </TableHead>
  );
}
