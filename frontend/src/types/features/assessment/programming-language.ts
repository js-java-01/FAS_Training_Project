export interface ProgrammingLanguage {
  id: number;
  name: string;
  version?: string;
  description?: string;
  isSupported: boolean;
  createdAt: string; 
  updatedAt: string; 
}

export interface ProgrammingLanguageRequest {
  name: string;
  version?: string;
  description?: string;
}

export interface ProgrammingLanguageResponse {
  id: number;
  name: string;
  version?: string;
  description?: string;
  isSupported: boolean;
  createdAt: string; 
  updatedAt: string; 
}
