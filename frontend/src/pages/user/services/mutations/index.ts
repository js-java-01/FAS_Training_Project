import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";
import { USER_QUERY_KEY } from "../queries";

/* ========= EXPORT ========= */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: async () => userApi.exportUsers("EXCEL"),
  });
};

/* ========= IMPORT ========= */
export const useImportUsers = () => {
  const queryClient = useQueryClient();
  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
  };
  return useMutation({
    mutationFn: async (file: File) => userApi.importUsers(file),
    onSuccess: invalidateUsers,
  });
};

/* ========= DOWNLOAD TEMPLATE ========= */
export const useDownloadUserTemplate = () => {
  return useMutation({
    mutationFn: async () => userApi.downloadUserTemplate(),
  });
};
