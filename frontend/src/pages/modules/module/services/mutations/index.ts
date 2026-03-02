import { useMutation } from "@tanstack/react-query";
import { moduleApi } from "@/api/moduleApi.ts";
import { useQueryClient } from "@tanstack/react-query";

/* ========= EXPORT ========= */
export const useExportModules = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleApi.exportModules(); // Blob
        },
    });
};

/* ========= IMPORT ========= */
export const useImportModules = () => {
  const queryClient = useQueryClient();
  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["modules"] }), // update table
      queryClient.invalidateQueries({ queryKey: ["module-groups", "active"] }), // update sidebar
    ]);
  };
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await moduleApi.importModules(formData);
      console.log(res.data)
      return res.data;
    },
    onSuccess: invalidateAll,
  });
};
export const useDownloadTemplate = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleApi.exportTemplateModules(); // Blob
        },
    });
};
