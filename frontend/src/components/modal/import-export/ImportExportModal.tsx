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
import { useState, useEffect } from "react";
import ImportTab, { type ImportResult } from "./ImportTab";
import ExportTab from "./ExportTab";

type Props = {
  title?: string;
  open: boolean;
  setOpen: (open: boolean) => void;

  onImport?: (file: File) => Promise<ImportResult | void>;
  onExport?: () => Promise<void>;
  onDownloadTemplate?: () => Promise<void>;
  acceptedFileTypes?: string;
  validateFile?: (file: File) => string | null;
};

export default function ImportExportModal({
  title,
  open,
  setOpen,
  onImport,
  onExport,
  onDownloadTemplate,
  acceptedFileTypes,
  validateFile,
}: Props) {
  const hasImport = !!onImport;
  const hasExport = !!onExport;

  const [tab, setTab] = useState<"import" | "export">(
    hasImport ? "import" : "export"
  );

  // Nếu quyền thay đổi thì reset tab
  useEffect(() => {
    if (!hasImport && hasExport) setTab("export");
    if (hasImport && !hasExport) setTab("import");
  }, [hasImport, hasExport]);

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
        {(hasImport || hasExport) && (
          <div className="px-6 mt-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList
                className={`grid w-full ${
                  hasImport && hasExport
                    ? "grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {hasImport && (
                  <TabsTrigger value="import">Import</TabsTrigger>
                )}

                {hasExport && (
                  <TabsTrigger value="export">Export</TabsTrigger>
                )}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          {tab === "import" && hasImport && (
            <ImportTab
              onImport={onImport}
              onDownloadTemplate={onDownloadTemplate}
              acceptedFileTypes={acceptedFileTypes}
              validateFile={validateFile}
            />
          )}

          {tab === "export" && hasExport && (
            <ExportTab title={title} onExport={onExport} />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
