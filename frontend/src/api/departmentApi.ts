// src/api/departmentApi.ts
import axiosInstance from './axiosInstance';
import { CreateDepartmentRequest, Department } from '../types/department';

export const departmentApi = {
    // Tạo mới department
    createDepartment: async (data: CreateDepartmentRequest): Promise<Department> => {
        const response = await axiosInstance.post<Department>('/departments', data);
        return response.data;
    },

    // Lấy danh sách department (để hiển thị lên bảng sau này)
    getAllDepartments: async () => {
        // Giả sử endpoint trả về mảng, nếu trả về phân trang thì sửa lại giống locationApi
        const response = await axiosInstance.get<Department[]>('/departments');
        return response.data;
    },

    deleteDepartment: async (id: string): Promise<void> => {
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