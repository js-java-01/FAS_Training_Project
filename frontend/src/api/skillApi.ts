import axiosInstance from './axiosInstance';

/* ─── Types ─────────────────────────────────────────────────── */
export interface SkillGroupData {
  id: string;
  name: string;
  code: string;
  skillCount: number;
}

export interface SkillData {
  id: string;
  name: string;
  code: string;
  groupName: string;
  description: string;
}

export interface CreateSkillGroupPayload {
  name: string;
  code: string;
}

export interface CreateSkillPayload {
  name: string;
  code: string;
  description?: string;
  groupId: string;
}

/* ─── API ────────────────────────────────────────────────────── */
export const skillApi = {
  /* Skill Groups */
  getGroups: async (): Promise<SkillGroupData[]> => {
    const res = await axiosInstance.get('/skills/groups');
    return res.data;
  },

  createGroup: async (payload: CreateSkillGroupPayload): Promise<SkillGroupData> => {
    const res = await axiosInstance.post('/skills/groups', payload);
    return res.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/skills/groups/${id}`);
  },

  /* Skills */
  getSkills: async (groupId?: string, keyword?: string): Promise<SkillData[]> => {
    const res = await axiosInstance.get('/skills', {
      params: { groupId: groupId || undefined, keyword: keyword || undefined },
    });
    return res.data;
  },

  createSkill: async (payload: CreateSkillPayload): Promise<SkillData> => {
    const res = await axiosInstance.post('/skills', payload);
    return res.data;
  },

  deleteSkill: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/skills/${id}`);
  },

  /* Import / Export – Skills */
  exportSkills: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/skills/export', { responseType: 'blob' });
    return res.data;
  },

  importSkills: async (file: File): Promise<any> => {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosInstance.post('/skills/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  downloadSkillTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/skills/template', { responseType: 'blob' });
    return res.data;
  },

  /* Import / Export – Skill Groups */
  exportGroups: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/skills/groups/export', { responseType: 'blob' });
    return res.data;
  },

  importGroups: async (file: File): Promise<any> => {
    const form = new FormData();
    form.append('file', file);
    const res = await axiosInstance.post('/skills/groups/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  downloadGroupTemplate: async (): Promise<Blob> => {
    const res = await axiosInstance.get('/skills/groups/template', { responseType: 'blob' });
    return res.data;
  },
};
