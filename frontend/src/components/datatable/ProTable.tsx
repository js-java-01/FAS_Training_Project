import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAutoPageSize } from "@/hooks/useAutoPageSize";
import { ArrowDown, ArrowUp, ArrowUpDown, Pen, Trash2 } from "lucide-react";
import { useState } from "react";
import ActionButton from "./ActionButton";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import Loading from "./Loading";
import NoResult from "./NoResult";
import { RowSelection } from "./RowSelection";
import { Pagination } from "./Pagination";
import { FormModal } from "./FormModal";
import { Toolbar } from "./Toolbar";

interface ProTableProps {
  table: any;
  isLoading?: boolean;
  isFetching?: boolean;
  headerActions?: React.ReactNode;
  onRowClick?: (row: any) => void;
  autoPageSize?: boolean;
  rowHeight?: number;
}

export function ProTable({
  table,
  isLoading,
  isFetching,
  headerActions,
  onRowClick,
  autoPageSize = true,
  rowHeight = 49,
}: ProTableProps) {
  const { schema } = table;

  const { containerRef } = useAutoPageSize({
    rowHeight,
    onSizeChange: autoPageSize ? table.setSize : undefined,
  });

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteClick = (row: any) => {
    setDeleteItem(row);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;

    try {
      setDeleteLoading(true);
      await table.remove(deleteItem[schema.idField]);
      setDeleteItem(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="grid gap-4 h-full font-inter grid-rows-[auto_1fr_auto]">
      <Toolbar table={table} headerActions={headerActions} />

      <div 
        ref={containerRef}
        className="h-full rounded-md border bg-card text-foreground flex flex-col overflow-hidden w-full"
      >
        <Table>
          <TableHeader className="bg-background z-10 sticky top-0 shadow-xs">
            <TableRow>
              <TableHead style={{ width: 40 }}>
                {(() => {
                  const allIds = table.data?.map((row: any) => row[schema.idField]) ?? [];
                  const allSelected = allIds.length > 0 && allIds.every((id: any) => table.selected?.includes(id));
                  const someSelected = !allSelected && allIds.some((id: any) => table.selected?.includes(id));
                  return (
                    <Checkbox
                      checked={allSelected}
                      data-state={someSelected ? "indeterminate" : undefined}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          table.setSelected((prev: any[]) => {
                            const newIds = allIds.filter((id: any) => !prev.includes(id));
                            return [...prev, ...newIds];
                          });
                        } else {
                          table.setSelected((prev: any[]) =>
                            prev.filter((id: any) => !allIds.includes(id))
                          );
                        }
                      }}
                      aria-label="Select all rows"
                    />
                  );
                })()}
              </TableHead>
              <TableHead style={{ width: 50 }} className="text-center">
                #
              </TableHead>
              {table.visibleFields.map((f: any) => {
                const isSortable = f.sortable === true;
                const isCurrentSort = table.sortState?.field === f.name;
                const sortDirection = isCurrentSort ? table.sortState?.direction : null;

                const SortIcon = sortDirection === "asc" 
                  ? ArrowUp 
                  : sortDirection === "desc" 
                    ? ArrowDown 
                    : ArrowUpDown;

                return (
                  <TableHead
                    key={f.name}
                    className={cn(
                      isSortable && "cursor-pointer select-none hover:bg-muted/50"
                    )}
                    onClick={() => isSortable && table.toggleSort(f.name)}
                  >
                    <div className="flex items-center gap-1">
                      {f.label}
                      {isSortable && (
                        <SortIcon
                          className={cn(
                            "h-4 w-4",
                            isCurrentSort ? "text-foreground text-blue-500 font-bold" : "text-muted-foreground/50"
                          )}
                        />
                      )}
                    </div>
                  </TableHead>
                );
              })}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          {table.data?.length > 0 && (
            <TableBody>
              {table.data.map((row: any, index: number) => {
                const id = row[schema.idField];

                return (
                  <TableRow
                    key={id}
                    className="w-full odd:bg-accent even:bg-background"
                    onClick={(e) => {
                      try {
                        const target = e.target as HTMLElement | null;
                        if (target && target.closest("button, a, input, label"))
                          return;
                      } catch (err) {
                        console.error("Error checking click target:", err);
                      }
                      if (onRowClick) onRowClick(row);
                    }}
                  >
                    <TableCell>
                      <RowSelection id={id} table={table} />
                    </TableCell>

                    <TableCell className="text-center text-muted-foreground">
                      {(table.page || 0) * (table.size || 10) + index + 1}
                    </TableCell>

                    {table.visibleFields.map((f: any) => {
                      const value = row[f.name];
                      
                      if (f.type === "boolean") {
                        const labels = f.booleanLabels || { true: "Yes", false: "No" };
                        const colorClass = value 
                          ? (labels.trueColor || "bg-green-500 text-white") 
                          : (labels.falseColor || "bg-red-400 text-white");
                        return (
                          <TableCell key={f.name}>
                            <Badge className={colorClass}>
                              {value ? labels.true : labels.false}
                            </Badge>
                          </TableCell>
                        );
                      }
                      
                      return <TableCell key={f.name}>{value}</TableCell>;
                    })}

                    <TableCell className="flex gap-1">
                      <ActionButton
                        onClick={() => table.openEdit(row)}
                        tooltip="Edit"
                        icon={<Pen size={10} className="text-gray-500" />}
                      />
                      <ActionButton
                        onClick={() => handleDeleteClick(row)}
                        tooltip="Delete"
                        icon={<Trash2 size={10} className="text-red-500" />}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>

        {!table.data?.length && (
          <div className="flex-1 flex items-center justify-center">
            {isLoading || isFetching ? <Loading /> : <NoResult />}
          </div>
        )}
      </div>

      <Pagination table={table} />

      <FormModal
        open={table.isFormOpen}
        onClose={table.setFormOpen}
        schema={schema}
        initial={table.editingRow}
        title={table.editingRow ? "Edit" : "Create"}
        isSubmitting={table.isSubmitting}
        onSubmit={(data) => {
          table.editingRow
            ? table.update({ id: table.editingRow[schema.idField], data })
            : table.create(data);
        }}
      />

      <ConfirmDeleteModal
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </div>
  );
}
