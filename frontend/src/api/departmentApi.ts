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
};