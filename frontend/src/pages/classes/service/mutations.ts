import { enrollmentApi } from "@/api/enrollmentApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";

export const useImportTrainees = ({ classCode, classId }: { classCode: string; classId: string }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (file: File) => enrollmentApi.importStudents(classCode, file),
        onSuccess: (data) => {
            if (data.failedCount > 0) {
                toast.error(`Import completed with ${data.failedCount} failed records. Please check the error file for details.`);
            }
            else {
                toast.success("Trainees imported successfully");
            }
            queryClient.invalidateQueries({
                queryKey: ["class-trainees", classId],
                exact: false
            });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to import trainees");
        }
    });
};

export const useExportTrainees = ({ classCode }: { classCode: string }) => {
    return useMutation({
        mutationFn: () => enrollmentApi.exportStudents(classCode),
    });
};

export const useExportTraineeTemplate = () => {
    return useMutation({
        mutationFn: () => enrollmentApi.exportTemplate(),
    });
};