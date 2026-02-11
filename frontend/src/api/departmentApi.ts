import axios from 'axios';

const API_URL = 'http://localhost:8080/api/departments';

const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const departmentApi = {
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthConfig());
        return response.data;
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