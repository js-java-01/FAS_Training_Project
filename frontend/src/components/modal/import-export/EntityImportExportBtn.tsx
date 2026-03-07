import { useState } from "react";
import { DatabaseBackup, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import { toast } from "sonner";
import dayjs from "dayjs";

type MutationFactory<TArgs, TResult> = () => {
  mutateAsync: (args: TArgs) => Promise<TResult>;
};

type Mode = "all" | "import" | "export";

type Props = {
  title: string;
  useImportHook?: MutationFactory<File, any>;
  useExportHook?: MutationFactory<void, Blob>;
  useTemplateHook?: MutationFactory<void, Blob>;
  mode?: Mode;
};

export default function EntityImportExportButton({
  title,
  useImportHook,
  useExportHook,
  useTemplateHook,
  mode = "all",
}: Props) {
  const [open, setOpen] = useState(false);

  const importMutation = useImportHook?.();
  const exportMutation = useExportHook?.();
  const templateMutation = useTemplateHook?.();

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };
  const base64ToBlob = (
    base64: string,
    mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ): Blob => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  const handleImport = async (file: File) => {
    if (!importMutation) return;

    try {
      const res = await importMutation.mutateAsync(file);
      const errorBlob = res.errorFile ? base64ToBlob(res.errorFile) : undefined;

      return {
        message:
          res.message ??
          (res.failedCount > 0
            ? "Import finished with some errors."
            : "Import successful!"),
        totalRows: res.totalRows ?? res.totalCount ?? 0,
        successCount: res.successCount ?? 0,
        failedCount: res.failedCount ?? 0,
        errors: res.errors ?? [],
        errorBlob: errorBlob,
      };
    } catch (err: any) {
      const errorData = err?.response?.data;
      toast.error(errorData?.message ?? `Failed to import ${title}`);
      throw err;
    }
  };

  const handleExport = async () => {
    if (!exportMutation) return;

    try {
      const blob = await exportMutation.mutateAsync(undefined as void);

      downloadBlob(
        blob,
        `${title.toLowerCase()}_${dayjs().format("DD-MM-YYYY_HH-mm-ss")}.xlsx`,
      );

      toast.success(`${title} exported successfully`);
    } catch {
      toast.error(`Failed to export ${title}`);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!templateMutation) return;

    try {
      const blob = await templateMutation.mutateAsync(undefined as void);

      downloadBlob(
        blob,
        `${title.toLowerCase()}_template_${dayjs().format(
          "DD-MM-YYYY_HH-mm-ss",
        )}.xlsx`,
      );

      toast.success(`Template downloaded successfully`);
    } catch {
      toast.error(`Failed to download template`);
    }
  };

  // Dynamic UI theo mode
  const getButtonConfig = () => {
    switch (mode) {
      case "import":
        return {
          label: "Import",
          icon: <Upload className="h-4 w-4" />,
        };
      case "export":
        return {
          label: "Export",
          icon: <Download className="h-4 w-4" />,
        };
      default:
        return {
          label: "Import / Export",
          icon: <DatabaseBackup className="h-4 w-4" />,
        };
    }
  };

  const { label, icon } = getButtonConfig();

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        {icon}
        {label}
      </Button>

      <ImportExportModal
        title={title}
        open={open}
        setOpen={setOpen}
        mode={mode}
        onImport={mode !== "export" ? handleImport : undefined}
        onExport={mode !== "import" ? handleExport : undefined}
        onDownloadTemplate={
          mode !== "export" ? handleDownloadTemplate : undefined
        }
      />
    </>
  );
}
