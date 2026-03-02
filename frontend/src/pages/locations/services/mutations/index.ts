import { useMutation, useQueryClient } from "@tanstack/react-query";
import { locationApi } from "@/api/locationApi";

/* ========= EXPORT ========= */
export const useExportLocation = () => {
    return useMutation({
        mutationFn: async (): Promise<Blob> => {
            return await locationApi.exportLocations("xlsx");
        },
    });
};

/* ========= IMPORT ========= */
export const useImportLocation = () => {
    const queryClient = useQueryClient();

    const invalidateQueries = async () => {
        await queryClient.invalidateQueries({ queryKey: ["locations"] });
    };

    return useMutation({
        mutationFn: async (file: File) => {
            return await locationApi.importLocations(file);
        },
        onSuccess: invalidateQueries,
    });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadLocationTemplate = () => {
    return useMutation({
        mutationFn: async (): Promise<Blob> => {
            return await locationApi.downloadLocationImportTemplate();
        },
    });
};
