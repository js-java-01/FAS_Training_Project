import { useMutation } from "@tanstack/react-query";
import { departmentApi } from "@/api/departmentApi";

/* ========= EXPORT ========= */
export const useExportDepartments = () => {
  return useMutation({
    mutationFn: async () => departmentApi.export(),
  });
};

/* ========= IMPORT ========= */
export const useImportDepartments = () => {
  return useMutation({
    mutationFn: async (file: File) => departmentApi.import(file),
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadDepartmentTemplate = () => {
  return useMutation({
    mutationFn: async () => departmentApi.downloadTemplate(),
  });
};
