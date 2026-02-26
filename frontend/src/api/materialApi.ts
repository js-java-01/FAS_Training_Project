import axiosInstance from './axiosInstance';
import type { Material, CreateMaterialRequest, UpdateMaterialRequest } from '../types/material';

export const materialApi = {
  createMaterial: async (payload: CreateMaterialRequest): Promise<Material> => {
    const response = await axiosInstance.post('/materials', payload);
    return response.data;
  },

  updateMaterial: async (id: string, payload: UpdateMaterialRequest): Promise<Material> => {
    const response = await axiosInstance.put(`/materials/${id}`, payload);
    return response.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/materials/${id}`);
  },

  getMaterialById: async (id: string): Promise<Material> => {
    const response = await axiosInstance.get(`/materials/${id}`);
    return response.data;
  },

  getMaterialsBySession: async (sessionId: string): Promise<Material[]> => {
    const response = await axiosInstance.get(`/materials/session/${sessionId}`);
    return response.data;
  },

  getActiveMaterialsBySession: async (sessionId: string): Promise<Material[]> => {
    const response = await axiosInstance.get(`/materials/session/${sessionId}/active`);
    return response.data;
  },

  uploadMaterial: async (formData: FormData): Promise<Material> => {
    const response = await axiosInstance.post('/materials/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
