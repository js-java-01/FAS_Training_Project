import { DatabaseBackup, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ActionButton from "../common/ActionButton";
import { ConfirmDeleteModal } from "../modal/ConfirmDeleteModal";
import { DataIOModal } from "../dataio/DataIOModal";
import { ImportResultModal } from "../dataio/ImportResultModal";
import type { ImportResult } from "@/types";

interface ToolbarActionsProps {
  table: any;
  headerActions?: React.ReactNode;
}

export function ToolbarActions({ table, headerActions }: ToolbarActionsProps) {
  const [dataIOOpen, setDataIOOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const handleImportSuccess = (result: ImportResult) => {
    setImportResult(result);
    setResultOpen(true);
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      setBulkDeleteLoading(true);
      await table.bulkDelete();
      setBulkDeleteOpen(false);
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-end items-center gap-2">
      {headerActions}

      {table.selected?.length > 0 && (
        <ActionButton
          onClick={() => setBulkDeleteOpen(true)}
          tooltip={`Delete ${table.selected.length} selected rows`}
          title="Delete"
          variant="destructive"
          icon={<Trash2 size={16} />}
        />
      )}

      <ActionButton
        onClick={() => setDataIOOpen(true)}
        tooltip="Import & Export data"
        title="Import / Export"
        variant="secondary"
        icon={<DatabaseBackup size={16} />}
      />

      <ActionButton
        onClick={() => table.openCreate()}
        tooltip="Create new data"
        title="Create"
        variant="default"
        icon={<Plus size={16} />}
      />

      <DataIOModal
        open={dataIOOpen}
        onOpenChange={setDataIOOpen}
        table={table}
        onImportSuccess={handleImportSuccess}
      />

      <ImportResultModal
        open={resultOpen}
        onOpenChange={setResultOpen}
        result={importResult}
        onBackToImport={() => {
          setResultOpen(false);
          setDataIOOpen(true);
        }}
      />

      <ConfirmDeleteModal
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        onConfirm={handleBulkDeleteConfirm}
        loading={bulkDeleteLoading}
        title="Delete Selected Items"
        description={`Are you sure you want to delete ${table.selected?.length || 0} selected items? This action cannot be undone.`}
      />
    </div>
  );
}
