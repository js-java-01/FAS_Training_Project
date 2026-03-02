import axiosInstance from './axiosInstance';
import type { ImportResult } from '@/components/modal/import-export/ImportTab';

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

/* ─── Assessment Scheme types ────────────────────────────── */
export type AssessmentComponentType =
  | "QUIZ"
  | "ASSIGNMENT"
  | "FINAL_EXAM"
  | "LAB"
  | "PROJECT";

export const ASSESSMENT_TYPES: AssessmentComponentType[] = [
  "QUIZ",
  "ASSIGNMENT",
  "FINAL_EXAM",
  "LAB",
  "PROJECT",
];

export interface AssessmentSchemeConfig {
  minGpaToPass: number;
  minAttendance: number;
  allowFinalRetake: boolean;
}

export interface AssessmentComponentRequest {
  name: string;
  type: AssessmentComponentType;
  count: number;
  weight: number;
  duration?: number | null;
  displayOrder: number;
  isGraded: boolean;
  note?: string | null;
}

export interface AssessmentComponentResponse {
  id: string;
  name: string;
  type: AssessmentComponentType;
  count: number;
  weight: number;
  duration?: number | null;
  displayOrder: number;
  isGraded: boolean;
  note?: string | null;
}

/* ─── Delivery Principle types ───────────────────────────── */
export interface TopicDeliveryPrinciple {
  id?: string;
  maxTraineesPerClass?: number | null;
  minTrainerLevel?: number | null;
  minMentorLevel?: number | null;
  trainingGuidelines?: string | null;
  markingPolicy?: string | null;
  waiverNotes?: string | null;
  otherNotes?: string | null;
}

/* ─── Time Allocation types ──────────────────────────────── */
export interface TopicTimeAllocation {
  trainingHours?: number | null;
  practiceHours?: number | null;
  selfStudyHours?: number | null;
  coachingHours?: number | null;
  notes?: string | null;
  // read-only computed
  assessmentHours?: number;
  totalHours?: number;
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

  importTopics: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/topics/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
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

  /* ─── Delivery Principle ─── */
  getDeliveryPrinciple: async (topicId: string): Promise<TopicDeliveryPrinciple> => {
    const res = await axiosInstance.get(`/topics/${topicId}/delivery-principle`);
    return res.data;
  },

  saveDeliveryPrinciple: async (topicId: string, payload: TopicDeliveryPrinciple): Promise<TopicDeliveryPrinciple> => {
    const res = await axiosInstance.put(`/topics/${topicId}/delivery-principle`, payload);
    return res.data;
  },

  /* ─── Assessment Scheme ─── */
  getSchemeConfig: async (topicId: string): Promise<AssessmentSchemeConfig> => {
    const res = await axiosInstance.get(`/topics/${topicId}/assessment-scheme/config`);
    return res.data;
  },

  updateSchemeConfig: async (topicId: string, payload: AssessmentSchemeConfig): Promise<AssessmentSchemeConfig> => {
    const res = await axiosInstance.put(`/topics/${topicId}/assessment-scheme/config`, payload);
    return res.data;
  },

  getComponents: async (topicId: string): Promise<AssessmentComponentResponse[]> => {
    const res = await axiosInstance.get(`/topics/${topicId}/assessment-scheme/components`);
    return res.data;
  },

  addComponent: async (topicId: string, payload: AssessmentComponentRequest): Promise<AssessmentComponentResponse> => {
    const res = await axiosInstance.post(`/topics/${topicId}/assessment-scheme/components`, payload);
    return res.data;
  },

  updateComponents: async (topicId: string, payload: AssessmentComponentRequest[]): Promise<AssessmentComponentResponse[]> => {
    const res = await axiosInstance.put(`/topics/${topicId}/assessment-scheme/components`, payload);
    return res.data;
  },

  deleteComponent: async (topicId: string, componentId: string): Promise<void> => {
    await axiosInstance.delete(`/topics/${topicId}/assessment-scheme/components/${componentId}`);
  },

  getTotalWeight: async (topicId: string): Promise<number> => {
    const res = await axiosInstance.get(`/topics/${topicId}/assessment-scheme/total-weight`);
    return res.data;
  },

  exportAssessmentComponents: async (topicId: string): Promise<Blob> => {
    const res = await axiosInstance.get(
      `/topics/${topicId}/assessment-scheme/components/export`,
      { responseType: 'blob' },
    );
    return res.data;
  },

  importAssessmentComponents: async (
    topicId: string,
    file: File,
  ): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axiosInstance.post<ImportResult>(
      `/topics/${topicId}/assessment-scheme/components/import`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );

    return res.data;
  },

  downloadAssessmentComponentsTemplate: async (topicId: string): Promise<Blob> => {
    const res = await axiosInstance.get(
      `/topics/${topicId}/assessment-scheme/components/template`,
      { responseType: 'blob' },
    );
    return res.data;
  },

  /* ─── Time Allocation ─── */
  getTimeAllocation: async (topicId: string): Promise<TopicTimeAllocation> => {
    const res = await axiosInstance.get(`/topics/${topicId}/time-allocation`);
    return res.data;
  },

  saveTimeAllocation: async (topicId: string, payload: TopicTimeAllocation): Promise<TopicTimeAllocation> => {
    const res = await axiosInstance.put(`/topics/${topicId}/time-allocation`, payload);
    return res.data;
  },
};