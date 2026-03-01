import { useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingProgramApi } from "@/api/trainingProgramApi";
import { trainingProgramKeys } from "../../keys";

export const useExportTrainingPrograms = () =>
  useMutation({
    mutationFn: () => trainingProgramApi.exportTrainingPrograms(),
  });

export const useImportTrainingPrograms = () => {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: trainingProgramKeys.all({}),
    });
  };
  return useMutation({
    mutationFn: (file: File) => trainingProgramApi.importTrainingPrograms(file),
    onSuccess: () => invalidate(),
  });
};

export const useDownloadTrainingProgramTemplate = () =>
  useMutation({
    mutationFn: () => trainingProgramApi.downloadTemplate(),
  });

