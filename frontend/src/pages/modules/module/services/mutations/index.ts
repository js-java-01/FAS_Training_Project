import { useMutation } from "@tanstack/react-query";
import { moduleApi } from "@/api/moduleApi.ts";

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
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const res = await moduleApi.importModules(formData);
      console.log(res.data)
      return res.data;
    },
  });
};
export const useDownloadTemplate = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleApi.exportTemplateModules(); // Blob
        },
    });
};
