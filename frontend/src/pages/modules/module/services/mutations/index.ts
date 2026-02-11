import { useMutation } from "@tanstack/react-query";
import {moduleApi} from "@/api/moduleApi.ts";

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

            await moduleApi.importModules(formData);
        },
    });
};