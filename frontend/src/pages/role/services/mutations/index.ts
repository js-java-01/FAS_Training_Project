import { useMutation } from "@tanstack/react-query";
import { roleApi } from "@/api/roleApi";

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
  return useMutation({
    mutationFn: async (file: File) => {
      return await roleApi.importRoles(file);
    },
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
