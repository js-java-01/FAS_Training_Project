import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAutoPageSize } from "@/hooks/useAutoPageSize";
import { useState } from "react";
import { CellRenderer } from "./CellRenderer";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { DetailModal } from "./DetailModal";
import Loading from "./Loading";
import NoResult from "./NoResult";
import { Pagination } from "./Pagination";
import { RowActions } from "./RowActions";
import { RowSelection } from "./RowSelection";
import { SelectAllCheckbox } from "./SelectAllCheckbox";
import { SortableHeader } from "./SortableHeader";
import { FormModal } from "./FormModal";
import { Toolbar } from "./Toolbar";

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

  const { containerRef } = useAutoPageSize({
    rowHeight,
    onSizeChange: autoPageSize ? table.setSize : undefined,
  });

  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [detailRow, setDetailRow] = useState<any>(null);

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
                />
              ))}
              <TableHead>Actions</TableHead>
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

      <Pagination table={table} />

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
