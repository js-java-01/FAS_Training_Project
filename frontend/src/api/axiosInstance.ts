import axios from "axios";
import type { LoginResponse } from "@/types/auth";
import { store } from "@/store/store";
import { setLogout } from "@/store/slices/auth/authSlice";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
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

export default axiosInstance;
