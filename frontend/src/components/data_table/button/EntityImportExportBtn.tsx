import { useState } from "react";
import { DatabaseBackup } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImportExportModal from "@/components/modal/import-export/ImportExportModal";
import { toast } from "sonner";
import dayjs from "dayjs";

type MutationHook<TArgs, TResult> = () => {
  mutateAsync: (args: TArgs) => Promise<TResult>;
};

type Props = {
  title: string;
  useImportHook: MutationHook<File, any>;
  useExportHook: MutationHook<void, Blob>;
  useTemplateHook: MutationHook<void, Blob>;
};

export default function EntityImportExportButton({
  title,
  useImportHook,
  useExportHook,
  useTemplateHook,
}: Props) {
  const [open, setOpen] = useState(false);

  const { mutateAsync: importMutate } = useImportHook();
  const { mutateAsync: exportMutate } = useExportHook();
  const { mutateAsync: templateMutate } = useTemplateHook();

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

  const handleImport = async (file: File) => {
    try {
      const res = await importMutate(file);
      if (!res || res.failedCount === 0) {
        toast.success(`${title} imported successfully`);
      }
      return res;
    } catch (err: any) {
      const errorData = err?.response?.data;

      if (errorData?.totalRows !== undefined) {
        return errorData;
      }

      toast.error(errorData?.message ?? `Failed to import ${title}`);
      throw err;
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportMutate(undefined as any);
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
    try {
      const blob = await templateMutate(undefined as any);
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

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <DatabaseBackup className="h-4 w-4" />
        Import / Export
      </Button>

      <ImportExportModal
        title={title}
        open={open}
        setOpen={setOpen}
        onImport={handleImport}
        onExport={handleExport}
        onDownloadTemplate={handleDownloadTemplate}
      />
    </>
  );
}
