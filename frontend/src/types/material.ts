export type MaterialType = 'VIDEO' | 'DOCUMENT' | 'LINK' | 'IMAGE' | 'AUDIO';

export interface Material {
  id: string;
  title: string;
  description?: string;
  type: MaterialType;
  sourceUrl: string;
  tags?: string;
  sessionId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMaterialRequest {
  title: string;
  description?: string;
  type: MaterialType;
  sourceUrl: string;
  tags?: string;
  sessionId: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateMaterialRequest {
  title?: string;
  description?: string;
  type?: MaterialType;
  sourceUrl?: string;
  tags?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export const MATERIAL_TYPE_OPTIONS = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'LINK', label: 'Link' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'AUDIO', label: 'Audio' },
] as const;

export type MaterialTypeValue = (typeof MATERIAL_TYPE_OPTIONS)[number]['value'];
