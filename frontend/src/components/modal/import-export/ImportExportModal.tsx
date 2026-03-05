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
import { useState, useEffect, useMemo } from "react";
import ImportTab, { type ImportResult } from "./ImportTab";
import ExportTab from "./ExportTab";

type Mode = "all" | "import" | "export";

type Props = {
  title?: string;
  open: boolean;
  setOpen: (open: boolean) => void;

  mode?: Mode;

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
  mode = "all",
  onImport,
  onExport,
  onDownloadTemplate,
  acceptedFileTypes,
  validateFile,
}: Props) {
  const hasImport = mode !== "export" && !!onImport;
  const hasExport = mode !== "import" && !!onExport;

  const defaultTab: "import" | "export" = useMemo(() => {
    if (mode === "import") return "import";
    if (mode === "export") return "export";
    return hasImport ? "import" : "export";
  }, [mode, hasImport]);

  const [tab, setTab] = useState<"import" | "export">(defaultTab);

  // Reset tab khi mode thay đổi
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  const dialogTitle = useMemo(() => {
    if (mode === "import") return `Import Data ${title ?? ""}`;
    if (mode === "export") return `Export Data ${title ?? ""}`;
    return `Import & Export Data ${title ?? ""}`;
  }, [mode, title]);

  const dialogDescription = useMemo(() => {
    if (mode === "import")
      return "Upload a file to bulk import your data into the system.";
    if (mode === "export")
      return "Export your data for backup or analysis purposes.";
    return "Bulk import data or export your records for backup and analysis.";
  }, [mode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs chỉ hiện khi BOTH tồn tại */}
        {hasImport && hasExport && (
          <div className="px-6 mt-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="import">Import</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
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
