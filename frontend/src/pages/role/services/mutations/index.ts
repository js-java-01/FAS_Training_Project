import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roleApi } from "@/api/roleApi";
import { ROLE_QUERY_KEY } from "../queries";

/* ========= EXPORT ========= */
export const useExportRoles = () => {
  return useMutation({
    mutationFn: async () => {
      return await roleApi.exportRoles(); // Blob
    },
  });
};

/* ========= IMPORT ========= */
export const useImportRoles = () => {
  const queryClient = useQueryClient();
  const invalidateRoles = async () => {
    await queryClient.invalidateQueries({ queryKey: [ROLE_QUERY_KEY] });
  };
  return useMutation({
    mutationFn: async (file: File) => {
      return await roleApi.importRoles(file);
    },
    onSuccess: invalidateRoles,
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadRoleTemplate = () => {
  return useMutation({
    mutationFn: async () => {
      return await roleApi.downloadTemplate(); // Blob
    },
  });
};
