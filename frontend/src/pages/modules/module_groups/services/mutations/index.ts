import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moduleGroupApi } from "@/api/moduleApi";

/* ========= EXPORT ========= */
export const useExportModuleGroup = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleGroupApi.exportModuleGroups(); // Blob
        },
    });
};

/* ========= IMPORT ========= */
export const useImportModuleGroup = () => {
  const queryClient = useQueryClient();

  const invalidateQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["module-groups"] }), // update table
      queryClient.invalidateQueries({ queryKey: ["module-groups", "active"] }), // update sidebar
    ]);
  };

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response =
        await moduleGroupApi.importModuleGroups(formData);

      return response.data;
    },
    onSuccess: invalidateQueries,
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadTemplate = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleGroupApi.exportTemplateModuleGroups(); // Blob
        },
    });
};
