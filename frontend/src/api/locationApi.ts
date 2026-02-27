import type { Location, CreateLocationRequest, LocationImportResult, LocationStatus, UpdateLocationRequest } from '@/types/location';
import axiosInstance from './axiosInstance';
// import { Location, CreateLocationRequest, UpdateLocationRequest, LocationStatus,LocationImportResult } from '../types/location';

export const locationApi = {
  searchLocations: async (
    page = 0,
    size = 10,
    q?: string,
    communeId?: string,
    status?: LocationStatus
  ) => {
    let url = `/locations?page=${page}&size=${size}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    if (communeId) url += `&communeId=${encodeURIComponent(communeId)}`;
    if (status) url += `&status=${status}`;
    
    const response = await axiosInstance.get<{
      content: Location[];
      totalElements: number;
      totalPages: number;
    }>(url);
    return response.data;
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await axiosInstance.get<Location>(`/locations/${id}`);
    return response.data;
  },

  createLocation: async (location: CreateLocationRequest): Promise<Location> => {
    const response = await axiosInstance.post<Location>('/locations', location);
    return response.data;
  },

  updateLocation: async (id: string, location: UpdateLocationRequest): Promise<Location> => {
    const response = await axiosInstance.put<Location>(`/locations/${id}`, location);
    return response.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/locations/${id}`);
  },

  getAllLocations: async (): Promise<Location[]> => {
    const response = await axiosInstance.get<Location[]>('/locations/all');
    return response.data;
  },

  deleteLocationPermanently: async (id: string): Promise<void> => {
  await axiosInstance.delete(`/locations/${id}/permanent`);

},

exportLocations: async (format: 'csv' | 'xlsx' = 'xlsx'): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/locations/export?format=${format}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  },

  importLocations: async (
    file: File
  ): Promise<LocationImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<LocationImportResult>(
      '/locations/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },

  downloadLocationImportTemplate: async (): Promise<Blob> => {
  const response = await axiosInstance.get(
    '/locations/import/template',
    {
      responseType: 'blob',
    }
  );

  return response.data;
},


};
