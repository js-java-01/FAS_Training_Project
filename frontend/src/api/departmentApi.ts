import axios from 'axios';
import axiosInstance from './axiosInstance';

const API_URL = 'http://localhost:8080/api/departments';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const departmentApi = {
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthConfig());
        return response.data;
    },

    // ================= SEARCH WITH PAGINATION =================
    search: async (
        page = 0,
        size = 10,
        q?: string,
        sort?: string
    ) => {
        let url = `/departments?page=${page}&size=${size}`;
        if (q) url += `&q=${encodeURIComponent(q)}`;
        if (sort) url += `&sort=${encodeURIComponent(sort)}`;

        const response = await axiosInstance.get(url);
        const data = response.data;

        // If server returns a plain array of departments
        if (Array.isArray(data)) {
            const arr = data;
            const totalElements = arr.length;
            return {
                content: arr,
                totalPages: Math.max(1, Math.ceil(totalElements / size)),
                totalElements,
                numberOfElements: arr.length,
                size,
                number: page,
            };
        }

        // If server returns an ApiResponse wrapper { success, data }
        const payload = data?.data ?? data;

        // If payload is a Page-like object with items + pagination
        if (payload?.items && Array.isArray(payload.items)) {
            const items = payload.items;
            const totalPages = payload.pagination?.totalPages ?? Math.max(1, Math.ceil(items.length / size));
            const totalElements = payload.pagination?.totalElements ?? items.length;
            return {
                content: items,
                totalPages,
                totalElements,
                numberOfElements: items.length,
                size,
                number: page,
            };
        }

        // If payload already uses content / totalPages (Spring-like Page)
        if (payload?.content && Array.isArray(payload.content)) {
            return payload;
        }

        // Fallback: empty page
        return {
            content: Array.isArray(payload) ? payload : [],
            totalPages: 0,
            totalElements: Array.isArray(payload) ? payload.length : 0,
            numberOfElements: Array.isArray(payload) ? payload.length : 0,
            size,
            number: page,
        };
    },
    create: async (data: any) => {
        const response = await axios.post(`${API_URL}/create`, data, getAuthConfig());
        return response.data;
    },
    delete: async (id: number | string) => {
        await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    }
    ,
    update: async (id: number | string, data: any) => {
        const response = await axios.put(`${API_URL}/${id}`, data, getAuthConfig());
        return response.data;
    },
        // ================= GET BY ID =================
    getById: async (id: string | number) => {
        const response = await axios.get(
            `${API_URL}/${id}`,
            getAuthConfig()
        );
        return response.data;
    },
        // ================= EXPORT =================
    export: async () => {
        const response = await axios.get(`${API_URL}/export?format=xlsx`, {
            ...getAuthConfig(),
            responseType: 'blob'
        });
        return response.data;
    },
    
    // ================= DOWNLOAD IMPORT TEMPLATE =================
    downloadTemplate: async () => {
        const response = await axios.get(
            `${API_URL}/import/template`,
            {
                ...getAuthConfig(),
                responseType: 'blob'
            }
        );
        return response.data;
    },


    // ================= IMPORT =================
    import: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await axios.post(
            `${API_URL}/import`,
            formData,
            {
                headers: {
                    ...getAuthConfig().headers,
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    }
};