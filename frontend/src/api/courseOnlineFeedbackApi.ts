import axiosInstance from './axiosInstance';
import type { CourseOnlineFeedbackDTO } from '../types/courseOnlineFeedback';
import type { PageResponse } from '@/types/response';

export const courseOnlineFeedbackApi = {
  // Gửi đánh giá mới
  create: async (data: CourseOnlineFeedbackDTO) => {
    const response = await axiosInstance.post('/course-online-feedbacks', data);
    return response.data;
  },

  // 2. UPDATE (Dùng PATCH hoặc PUT)
  update: async ({ id, data }: { id: string; data: Partial<CourseOnlineFeedbackDTO> }) => {
    const response = await axiosInstance.put(`/course-online-feedbacks/${id}`, data);
    return response.data;
  },

  // 3. DELETE
  delete: async (id: string) => {
    const response = await axiosInstance.delete(`/course-online-feedbacks/${id}`);
    return response.data;
  },

  // Lấy danh sách đánh giá của 1 khóa học (có phân trang)
  getByCourse: async (courseOnlineId: string, page = 0, size = 5) => {
    const response = await axiosInstance.get<PageResponse<CourseOnlineFeedbackDTO>>('/course-online-feedbacks', {
      params: { 
        courseOnlineId, 
        status: 'APPROVED', // Chỉ lấy những comment đã duyệt
        page, 
        size,
        sort: 'createdAt,desc' // Mới nhất lên đầu
      }
    });
    return response.data;
  }
};