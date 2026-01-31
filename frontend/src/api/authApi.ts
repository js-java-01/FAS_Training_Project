import axiosInstance from './axiosInstance';
import { type ForgotPasswordEmailRequest, type ForgotPasswordRequest, type LoginRequest, type LoginResponse, type RegisterRequest, type VerifyRequest } from '../types/auth';


export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>("/auth/login", credentials);
      return response.data;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      }
      throw new Error("An unknown error occurred");
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } finally {
      localStorage.clear();
    }
  },

  register: async (data: RegisterRequest): Promise<string> => {
    const response = await axiosInstance.post<string>("/auth/register", data);
    return response.data;
  },
  verify: async (data: VerifyRequest): Promise<boolean> => {
    const response = await axiosInstance.post<boolean>("/auth/verify", data);
    return response.data;
  },
  forgotPassword: async (data: ForgotPasswordEmailRequest): Promise<string> => {
    const response = await axiosInstance.post<string>('/auth/forgot-password', { email: data.email });
    return response.data;
  },
  resetPassword: async (data: ForgotPasswordRequest): Promise<string> => {
    const response = await axiosInstance.post<string>('/auth/verify-forgot-password', {
      email: data.email,
      token: data.token,
      newPassword: data.newPassword
    });
    return response.data;
  }
};
