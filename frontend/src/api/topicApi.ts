import axiosInstance from './axiosInstance';
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

export interface TopicObjective {
  id: string;
  topicId: string;
  code: string;
  name: string;
  details?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface TopicObjectivePageResponse {
  items: TopicObjective[];
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

  // ===============================
  // OBJECTIVES
  // ===============================

  getObjectives: async (
    topicId: string,
    params: {
      page?: number;
      size?: number;
      sort?: string;
      keyword?: string;
    } = {}
  ): Promise<TopicObjectivePageResponse> => {
    const { page = 0, size = 10, sort, keyword } = params;

    const response = await axiosInstance.get(
      `/topics/${topicId}/objectives`,
      {
        params: {
          page,
          size,
          ...(sort ? { sort } : {}),
          ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
        },
      }
    );

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

  createObjective: async (
    topicId: string,
    payload: any
  ): Promise<TopicObjective> => {
    const response = await axiosInstance.post(
      `/topics/${topicId}/objectives`,
      payload
    );
    return response.data;
  },

  updateObjective: async (
    topicId: string,
    objectiveId: string,
    payload: any
  ): Promise<TopicObjective> => {
    const response = await axiosInstance.put(
      `/topics/${topicId}/objectives/${objectiveId}`,
      payload
    );
    return response.data;
  },

  deleteObjective: async (
    topicId: string,
    objectiveId: string
  ): Promise<void> => {
    await axiosInstance.delete(
      `/topics/${topicId}/objectives/${objectiveId}`
    );
  },

  exportObjectives: async (topicId: string): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/topics/${topicId}/objectives/export`,
      { responseType: "blob" }
    );
    return response.data;
  },

  downloadObjectiveTemplate: async (topicId: String): Promise<Blob> => {
    const response = await axiosInstance.get(
      `/topics/${topicId}/objectives/template`,
      { responseType: "blob" }
    );
    return response.data;
  },

  importObjectives: async (
    topicId: string,
    file: File
  ): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    await axiosInstance.post(
      `/topics/${topicId}/objectives/import`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

};