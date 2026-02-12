import axiosInstance from './axiosInstance';

export interface Province {
  id: string;
  name: string;
}

export interface Commune {
  id: string;
  name: string;
  provinceId: string;
}

export const locationDataApi = {
  getAllProvinces: async (): Promise<Province[]> => {
    const response = await axiosInstance.get<Province[]>('/locations/provinces');
    return response.data;
  },

  getCommunesByProvinceId: async (provinceId: string): Promise<Commune[]> => {
    const response = await axiosInstance.get<Commune[]>(`/locations/communes?provinceId=${provinceId}`);
    return response.data;
  },
};
