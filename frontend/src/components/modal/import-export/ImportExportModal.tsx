import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import ImportTab, { type ImportResult } from "./ImportTab";
import ExportTab from "./ExportTab";

export interface ImportResult {
  message: string;
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: { row: number; field: string; message: string }[];
}

export default function ImportExportModal({
  title,
  open,
  setOpen,
  onImport,
  onExport,
  onDownloadTemplate,
}: {
  title?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  onImport: (file: File) => Promise<ImportResult | void>;
  onExport: () => Promise<void>;
  onDownloadTemplate: () => Promise<void>;
}) {
  const [tab, setTab] = useState("import");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Import & Export Data {title}</DialogTitle>
          <DialogDescription>
            Bulk import data or export your records for backup and analysis
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6 mt-4">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Scroll Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {tab === "import" && (
            <ImportTab
              onImport={onImport}
              onDownloadTemplate={onDownloadTemplate}
            />
          )}

          {tab === "export" && <ExportTab title={title} onExport={onExport} />}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 border-t">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
