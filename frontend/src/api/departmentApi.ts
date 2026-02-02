// src/api/departmentApi.ts
import axiosInstance from './axiosInstance';
import axios from "axios";

const API_URL = 'http://localhost:8080/api/departments';

//Vy
const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const departmentApi = {
    // Tạo mới department
    //vy
    getAll: async () => {
        const response = await axios.get(API_URL, getAuthConfig());
        return response.data;
    },
    //vy
    create: async (data: any) => {
        const response = await axios.post(`${API_URL}/create`, data, getAuthConfig());
        return response.data;
    },

    deleteDepartment: async (id: number | string): Promise<void> => {
        await axiosInstance.delete(`/departments/${id}`);
    },

    downloadTemplate: async () => {
        const response = await axiosInstance.get('/departments/import-template', {
            responseType: 'blob', // Quan trọng để tải file
        });
        // Tạo link ảo để browser tự tải về
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'department_import_template.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    // 2. Upload File Import
    importDepartments: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        await axiosInstance.post('/departments/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    exportDepartments: async () => {
        const response = await axiosInstance.get('/departments/export', {
            responseType: 'blob', // Quan trọng: Báo cho axios biết đây là file binary
        });

        // Tạo link tải ảo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `departments_export_${new Date().getTime()}.xlsx`); // Tên file kèm timestamp
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
};