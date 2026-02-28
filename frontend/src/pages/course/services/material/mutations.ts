import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { materialApi } from "@/api/materialApi";
import type { CreateMaterialRequest, UpdateMaterialRequest } from "@/types/material";
import { MATERIAL_QUERY_KEYS } from "./queries";

export const useCreateMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMaterialRequest) => materialApi.createMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_QUERY_KEYS.bySession(sessionId) });
      toast.success("Material created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create material");
    },
  });
};

export const useUpdateMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialRequest }) =>
      materialApi.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_QUERY_KEYS.bySession(sessionId) });
      toast.success("Material updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update material");
    },
  });
};

export const useDeleteMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => materialApi.deleteMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_QUERY_KEYS.bySession(sessionId) });
      toast.success("Material deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete material");
    },
  });
};

export const useUploadMaterial = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => materialApi.uploadMaterial(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATERIAL_QUERY_KEYS.bySession(sessionId) });
      toast.success("Material uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to upload material");
    },
  });
};
