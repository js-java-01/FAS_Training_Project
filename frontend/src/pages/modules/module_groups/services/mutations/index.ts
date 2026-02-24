import { useMutation } from "@tanstack/react-query";
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
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append("file", file);

            await moduleGroupApi.importModuleGroups(formData);
        },
    });
};
export const useDownloadTemplate = () => {
    return useMutation({
        mutationFn: async () => {
            return await moduleGroupApi.exportTemplateModuleGroups(); // Blob
        },
    });
};