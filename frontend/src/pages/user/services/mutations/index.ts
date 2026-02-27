import { useMutation } from "@tanstack/react-query";
import { userApi } from "@/api/userApi";

export const useExportUsers = () => {
  return useMutation({
    mutationFn: (format: "EXCEL" | "CSV" | "PDF" = "EXCEL") =>
      userApi.exportUsers(format),
  });
};
