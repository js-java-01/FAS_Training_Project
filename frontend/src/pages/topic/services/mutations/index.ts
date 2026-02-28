import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { topicApi } from "@/api/topicApi";

// Hàm helper để tải file (Dùng chung logic với Course)
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

export const useExportTopics = () =>
  useMutation({
    mutationFn: () => topicApi.exportTopics(),
    onSuccess: (blob) => {
      downloadBlob(blob, `topics_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Exported topics successfully!");
    },
    onError: () => toast.error("Failed to export topics"),
  });

export const useImportTopics = () =>
  useMutation({
    mutationFn: (file: File) => topicApi.importTopics(file),
    onSuccess: () => toast.success("Topics imported successfully!"),
    onError: () => toast.error("Failed to import topics"),
  });

export const useDownloadTopicTemplate = () =>
  useMutation({
    mutationFn: () => topicApi.downloadTemplate(),
    onSuccess: (blob) => {
      downloadBlob(blob, "topics_import_template.xlsx");
      toast.success("Template downloaded!");
    },
    onError: () => toast.error("Failed to download template"),
  });