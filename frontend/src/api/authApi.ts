import axiosInstance from './axiosInstance';
import { type LoginRequest, type LoginResponse, type RegisterRequest, type VerifyRequest } from '../types/auth';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  register: async (data: RegisterRequest): Promise<string> => {
    const response = await axiosInstance.post<string>('/auth/register', data);
    return response.data;
  },
  verify: async (data: VerifyRequest): Promise<boolean> => {
    const response = await axiosInstance.post<boolean>('/auth/verify', data);
    return response.data;
  },
};
