import axiosInstance from './axiosInstance';

/* ─── Skill types ─────────────────────────────────────────── */
export interface TopicSkillResponse {
  topicSkillId: string;
  skillId: string;
  skillName: string;
  code: string;
  groupName: string;
  description: string;
  required: boolean;
}

export interface SkillResponse {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description: string;
}

export interface SkillGroup {
  id: string;
  name: string;
  code: string;
  skillCount?: number;
}

export interface UpdateTopicSkillRequest {
  skills: { skillId: string; required: boolean }[];
}

/* ─── Topic types ─────────────────────────────────────────── */
export interface Topic {
  note: string;
  id: string;
  topicName: string;
  topicCode: string;
  description?: string;
  status: string;
  createdDate?: string;
  createdBy?: string;
  createdByName?: string;
  updatedDate?: string;
  updatedBy?: string;
  updatedByName?: string;
}

export interface TopicPageResponse {
  items: Topic[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
  };
}

export const topicApi = {
  getTopics: async (params: {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    status?: string;
  } = {}): Promise<TopicPageResponse> => {
    const { page = 0, size = 10, sort, keyword, status } = params;
    
    const response = await axiosInstance.get<{
      content: Topic[];
      number: number;
      size: number;
      totalPages: number;
      totalElements: number;
    }>('/topics', {
      params: {
        page,
        size,
        ...(sort ? { sort } : {}),
        ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
        ...(status ? { status } : {}),
      },
    });

    const d = response.data;
    return {
      items: d.content, 
      pagination: {
        page: d.number,
        pageSize: d.size,
        totalPages: d.totalPages,
        totalElements: d.totalElements,
      },
    };
  },

  getTopicById: async (id: string): Promise<Topic> => {
    const response = await axiosInstance.get(`/topics/${id}`);
    return response.data;
  },

  createTopic: async (payload: any): Promise<Topic> => {
    const response = await axiosInstance.post('/topics', payload);
    return response.data;
  },

  updateTopic: async (id: string, payload: any): Promise<Topic> => {
    const response = await axiosInstance.put(`/topics/${id}`, payload);
    return response.data;
  },

  deleteTopic: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/topics/${id}`);
  },

  exportTopics: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/topics/export', { responseType: 'blob' });
    return response.data;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const response = await axiosInstance.get('/topics/template', { responseType: 'blob' });
    return response.data;
  },

  importTopics: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    await axiosInstance.post('/topics/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /* ─── Skills ─── */
  getTopicSkills: async (topicId: string): Promise<TopicSkillResponse[]> => {
    const res = await axiosInstance.get(`/topics/${topicId}/skills`);
    return res.data;
  },

  getAvailableSkills: async (
    topicId: string,
    groupId?: string,
    keyword?: string,
  ): Promise<SkillResponse[]> => {
    const res = await axiosInstance.get(`/topics/${topicId}/skills/available`, {
      params: { groupId, keyword },
    });
    return res.data;
  },

  updateTopicSkills: async (
    topicId: string,
    payload: UpdateTopicSkillRequest,
  ): Promise<void> => {
    await axiosInstance.put(`/topics/${topicId}/skills`, payload);
  },

  getSkillGroups: async (): Promise<SkillGroup[]> => {
    const res = await axiosInstance.get('/skills/groups');
    return res.data;
  },
};