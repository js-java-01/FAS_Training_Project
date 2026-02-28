import axios from "axios";
import type { LoginResponse } from "@/types/auth";
import { store } from "@/store/store";
import { setLogout } from "@/store/slices/auth/authSlice";
import mfaGate from "./mfaGate";
import type { ExportFormat } from "@/types/export";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();

        Object.keys(params).forEach((key) => {
            const value = params[key];
            if (Array.isArray(value)) {
                // For array parameters (like sort), add each item separately
                value.forEach((item) => {
                    searchParams.append(key, item);
                });
            } else if (value !== undefined && value !== null) {
                searchParams.append(key, value);
            }
        });

        return searchParams.toString();
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalReq = error.config;

    // Only handle MFA_REQUIRED if user is authenticated (has token)
    const token = localStorage.getItem("token");
    if (token && error?.response?.status === 403 && error?.response?.data?.code === "MFA_REQUIRED" && !originalReq._mfa_retry) {
      originalReq._mfa_retry = true;
      return mfaGate.enqueue(originalReq);
    }

        if (error?.response?.status === 401 && !originalReq._retry && !originalReq.url.includes("/auth/login") && !originalReq.url.includes("/auth/logout")) {
            originalReq._retry = true;
            try {
                const res = await axios.post<LoginResponse>("http://localhost:8080/api/auth/refresh", {}, { withCredentials: true });
                const { token } = res.data;

                localStorage.setItem("token", token);
                originalReq.headers.Authorization = `Bearer ${token}`;

                return axiosInstance(originalReq);
            } catch (err) {
                store.dispatch(setLogout());
                window.location.href = "/login";
                return Promise.reject(err);
            }
        }


        return Promise.reject(error);
    },
);

export const exportFileApi = (url: string, format: ExportFormat) => {
    return axiosInstance.get(url, {
        params: { format },
        responseType: "blob",
    });
};

export default axiosInstance;
