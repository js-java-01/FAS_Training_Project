import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from "lucide-react";
import type { FieldSchema } from "@/types/common/datatable";
import type { SortEntry } from "@/types";

interface SortableHeaderProps {
  field: FieldSchema;
  sortState: SortEntry[];
  onToggleSort: (fieldName: string) => void;
  width?: number;
  onResizeStart?: (e: React.MouseEvent) => void;
}

export function SortableHeader({ field, sortState, onToggleSort, width, onResizeStart }: SortableHeaderProps) {
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
        "relative group/header",
        isSortable && "cursor-pointer select-none hover:bg-muted/50"
      )}
      style={{ width }}
      onClick={() => isSortable && onToggleSort(field.name)}
    >
      <div className="flex items-center gap-1 overflow-hidden pr-3">
        <span className="truncate">{field.label}</span>
        {isSortable && (
          <span className="inline-flex items-center gap-0.5 shrink-0">
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
      {onResizeStart && (
        <div
          className="absolute -right-2 top-0 h-full w-5 cursor-col-resize z-10 flex items-center justify-center group/resize"
          onMouseDown={onResizeStart}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Visible line */}
          <div className="w-[2px] h-3/5 rounded-full bg-muted-foreground/20 group-hover/header:bg-blue-400/60 group-hover/resize:!bg-blue-500 transition-all duration-150 group-hover/resize:h-4/5 group-hover/resize:w-[3px] group-hover/resize:shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
          {/* Grip dots on hover */}
          <GripVertical className="absolute h-3 w-3 text-blue-500 opacity-0 group-hover/resize:opacity-100 transition-opacity duration-150" />
        </div>
      )}
    </TableHead>
  );
}
