import { useQuery } from "@tanstack/react-query";
import { permissionApi } from "@/api/permissionApi";

export const useGetAllPermissions = (params?: {
  sort?: string;
}) => {
  return useQuery({
    queryKey: ["permissions", params],
    queryFn: () =>
      permissionApi.getAllPermissions(
        0,
        1000, // fetch all for client-side filtering
        params?.sort ?? "name,asc"
      ),
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
