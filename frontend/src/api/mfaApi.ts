import axiosInstance from "./axiosInstance";

export interface MfaStatusResponse {
  success: boolean;
  message: string;
}

export interface MfaSetupInitResponse {
  secret: string;
  qrCodeUrl: string;
}

export interface MfaVerifyRequest {
  code: string;
}

export interface MfaVerifyResponse {
  success: boolean;
  message: string;
}

const mfaApi = {
  status: async (): Promise<MfaStatusResponse> => {
    const response = await axiosInstance.get<MfaStatusResponse>("/mfa/status");
    return response.data;
  },

  init: async (): Promise<MfaSetupInitResponse> => {
    const response = await axiosInstance.post<MfaSetupInitResponse>("/mfa/setup/init");
    return response.data;
  },

  confirmSetup: async (code: string): Promise<MfaVerifyResponse> => {
    const response = await axiosInstance.post<MfaVerifyResponse>("/mfa/setup/confirm", { code });
    return response.data;
  },

  verifyStepUp: async (code: string): Promise<MfaVerifyResponse> => {
    const response = await axiosInstance.post<MfaVerifyResponse>("/mfa/step-up/verify", { code });
    return response.data;
  },

  disable: async (code: string): Promise<MfaVerifyResponse> => {
    const response = await axiosInstance.post<MfaVerifyResponse>("/mfa/disable", { code });
    return response.data;
  },

  enable: async (code: string): Promise<MfaVerifyResponse> => {
    const response = await axiosInstance.post<MfaVerifyResponse>("/mfa/enable", { code });
    return response.data;
  },
};

export default mfaApi;
