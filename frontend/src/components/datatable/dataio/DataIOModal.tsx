import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FileFormat, ImportResult } from "@/types";
import { useState } from "react";
import { ExportTab } from "./ExportTab";
import { ImportTab } from "./ImportTab";
import { toast } from "sonner";

interface DataIOModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: any;
  title?: string;
  description?: string;
  onImportSuccess?: (result: ImportResult) => void;
}

export function DataIOModal({
  open,
  onOpenChange,
  table,
  title,
  description,
  onImportSuccess,
}: DataIOModalProps) {
  const { schema } = table;
  const entityName = schema?.entityName || "data";

  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const displayTitle =
    title ||
    `Import & Export ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`;
  const displayDescription =
    description ||
    "Bulk import data or export your records for backup and analysis";

  const handleImport = async (file: File) => {
    if (!table.importFile) return;

    try {
      setImportLoading(true);

      const result = await table.importFile(file);

      onImportSuccess?.(result);
      onOpenChange(false);
      toast.success("Import successful!");
    } catch (err: any) {
      if (err?.response?.data) {
        onImportSuccess?.(err.response.data);
        onOpenChange(false);
      }
      toast.error(err?.response?.data?.message ?? "Failed to import data");
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async (format: FileFormat) => {
    if (!table.exportFile) return;

    try {
      setExportLoading(true);
      await table.exportFile(format);
      onOpenChange(false);
      toast.success("Export successful! Check your downloads folder.");
    } catch (err) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  const loading = importLoading || exportLoading;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl min-h-[440px] flex flex-col">
          <DialogHeader>
            <DialogTitle>{displayTitle}</DialogTitle>
            <DialogDescription>{displayDescription}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="import" className="w-full flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <ImportTab
              loading={importLoading}
              onImport={handleImport}
              entityName={entityName}
            />

            <ExportTab loading={exportLoading} onExport={handleExport} />
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
