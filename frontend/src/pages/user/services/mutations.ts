import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/features/rbac/user.api";
import type { ImportResult } from "@/types";
import { USER_QUERY_KEY } from "./queries";

export const useExportUsers = () => {
  return useMutation<Blob, Error>({
    mutationFn: () => userApi.exportUsers(),
  });
};

export const useImportUsers = () => {
  const queryClient = useQueryClient();
  return useMutation<ImportResult, Error, File>({
    mutationFn: (file: File) => userApi.importUsers(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
    },
  });
};

export const useDownloadUserTemplate = () => {
  return useMutation<Blob, Error>({
    mutationFn: () => userApi.downloadUserTemplate(),
  });
};
