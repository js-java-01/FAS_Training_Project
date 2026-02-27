import { useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentApi } from "@/api/departmentApi";
import { DEPARTMENT_QUERY_KEY } from "../queries";

/* ========= EXPORT ========= */
export const useExportDepartments = () => {
  return useMutation({
    mutationFn: async () => departmentApi.export(),
  });
};

/* ========= IMPORT ========= */
export const useImportDepartments = () => {
  const queryClient = useQueryClient();
  const invalidateDepartments = async () => {
    await queryClient.invalidateQueries({ queryKey: [DEPARTMENT_QUERY_KEY] });
  };
  return useMutation({
    mutationFn: async (file: File) => departmentApi.import(file),
    onSuccess: invalidateDepartments,
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadDepartmentTemplate = () => {
  return useMutation({
    mutationFn: async () => departmentApi.downloadTemplate(),
  });
};
