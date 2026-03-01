import { useMutation, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "@/api/permissionApi";

/* ========= EXPORT ========= */
export const useExportPermissions = () => {
  return useMutation({
    mutationFn: async () => {
      return await permissionApi.exportPermissions();
    },
  });
};

/* ========= IMPORT ========= */
export const useImportPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await permissionApi.importPermissions(formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};

/* ========= TEMPLATE ========= */
export const useDownloadPermissionTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      return await permissionApi.downloadTemplate();
    },
  });
};
