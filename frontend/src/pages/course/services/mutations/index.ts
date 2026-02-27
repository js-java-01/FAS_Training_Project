import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { courseApi } from "@/api/courseApi";

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

export const useExportCourses = () =>
  useMutation({
    mutationFn: () => courseApi.exportCourses(),
    onSuccess: (blob) => {
      downloadBlob(blob, `courses_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Exported courses successfully!");
    },
    onError: () => toast.error("Failed to export courses"),
  });

export const useImportCourses = () =>
  useMutation({
    mutationFn: (file: File) => courseApi.importCourses(file),
    onSuccess: () => toast.success("Courses imported successfully!"),
    onError: () => toast.error("Failed to import courses"),
  });

export const useDownloadCourseTemplate = () =>
  useMutation({
    mutationFn: () => courseApi.downloadTemplate(),
    onSuccess: (blob) => {
      downloadBlob(blob, "courses_import_template.xlsx");
      toast.success("Template downloaded!");
    },
    onError: () => toast.error("Failed to download template"),
  });
