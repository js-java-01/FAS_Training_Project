import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAutoPageSize } from "@/hooks/useAutoPageSize";
import { useCallback, useRef, useState } from "react";
import Loading from "./common/Loading";
import NoResult from "./common/NoResult";
import { ConfirmDeleteModal } from "./modal/ConfirmDeleteModal";
import { DetailModal } from "./modal/DetailModal";
import { FormModal } from "./modal/FormModal";
import { CellRenderer } from "./table/CellRenderer";
import { Pagination } from "./table/Pagination";
import { RowActions } from "./table/RowActions";
import { RowSelection } from "./table/RowSelection";
import { SelectAllCheckbox } from "./table/SelectAllCheckbox";
import { SortableHeader } from "./table/SortableHeader";
import { Toolbar } from "./toolbar/Toolbar";

interface ProTableProps {
  table: any;
  headerActions?: React.ReactNode;
  onRowClick?: (row: any) => void;
  autoPageSize?: boolean;
  rowHeight?: number;
}

export function ProTable({
  table,
  headerActions,
  onRowClick,
  autoPageSize = true,
  rowHeight = 49,
}: ProTableProps) {
  const { schema } = table;

  const [isAutoSize, setIsAutoSize] = useState(autoPageSize);

  const { containerRef, calculatedSize } = useAutoPageSize({
    rowHeight,
    onSizeChange: isAutoSize ? table.setSize : undefined,
  });

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailRow, setDetailRow] = useState<any>(null);

  // Column widths state for resizing
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    schema.fields.forEach((f: any) => {
      widths[f.name] = f.width || 150;
    });
    return widths;
  });

  const resizingRef = useRef<{ field: string; startX: number; startWidth: number } | null>(null);

  const onResizeStart = useCallback(
    (fieldName: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startWidth = columnWidths[fieldName] || 150;
      resizingRef.current = { field: fieldName, startX, startWidth };

      const onMouseMove = (ev: MouseEvent) => {
        if (!resizingRef.current) return;
        const { field, startX, startWidth } = resizingRef.current;
        const diff = ev.clientX - startX;
        const minW = schema.fields.find((f: any) => f.name === field)?.minWidth || 60;
        const newWidth = Math.max(minW, startWidth + diff);
        setColumnWidths((prev) => ({ ...prev, [field]: newWidth }));
      };

      const onMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [columnWidths, schema.fields],
  );

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
        <Table className="table-fixed">
          <colgroup>
            <col style={{ width: 20 }} />
            <col style={{ width: 50 }} />
            {table.visibleFields.map((f: any) => (
              <col key={f.name} style={{ width: columnWidths[f.name] || 150 }} />
            ))}
            <col style={{ width: 120 }} />
          </colgroup>
          <TableHeader className="bg-background z-10 sticky top-0 shadow-xs">
            <TableRow>
              <TableHead style={{ width: 20 }}>
                <SelectAllCheckbox table={table} idField={schema.idField} />
              </TableHead>
              <TableHead style={{ width: 50 }} className="text-center">
                #
              </TableHead>
              {table.visibleFields.map((f: any) => (
                <SortableHeader
                  key={f.name}
                  field={f}
                  sortState={table.sortState}
                  onToggleSort={table.toggleSort}
                  width={columnWidths[f.name] || 150}
                  onResizeStart={(e) => onResizeStart(f.name, e)}
                />
              ))}
              <TableHead style={{ width: 120 }}>Actions</TableHead>
            </TableRow>
          </TableHeader>

          {table.data?.length > 0 && (
            <TableBody className={table.isFetching ? "opacity-50 transition-opacity" : "transition-opacity"}>
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

                    {table.visibleFields.map((f: any) => (
                      <CellRenderer
                        key={f.name}
                        field={f}
                        value={row[f.name]}
                        relationOptions={table.relationOptions}
                        onBooleanToggle={(fieldName, newValue) => {
                          table.patchField(id, fieldName, newValue);
                        }}
                      />
                    ))}

                    <TableCell className="flex gap-1">
                      <RowActions
                        row={row}
                        onView={setDetailRow}
                        onEdit={table.openEdit}
                        onDelete={setDeleteItem}
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
            {table.loading ? <Loading /> : <NoResult />}
          </div>
        )}
      </div>

      <Pagination
        table={table}
        isAutoSize={isAutoSize}
        autoSize={calculatedSize}
        onPageSizeChange={(value) => {
          if (value === "auto") {
            setIsAutoSize(true);
            table.setSize(calculatedSize);
          } else {
            setIsAutoSize(false);
            table.setSize(Number(value));
          }
          table.setPage(0);
        }}
      />

      <FormModal
        open={table.isFormOpen}
        onClose={(open) => {
          if (!open) table.setFieldErrors({});
          table.setFormOpen(open);
        }}
        schema={schema}
        initial={table.editingRow}
        title={table.editingRow ? "Edit" : "Create"}
        isSubmitting={table.isSubmitting}
        relationOptions={table.relationOptions}
        fieldErrors={table.fieldErrors}
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

      <DetailModal
        open={!!detailRow}
        onClose={(open) => !open && setDetailRow(null)}
        schema={schema}
        row={detailRow}
        relationOptions={table.relationOptions}
      />
    </div>
  );
}
