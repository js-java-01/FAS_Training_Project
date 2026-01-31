export interface AssessmentType {
  id: string;
  name: string;
  description: string;
  createdAt: string; 
  updatedAt: string; 
}

export interface AssessmentTypeRequest {
  name: string;
  description: string;
}

export interface AssessmentTypeResponse {
  id: string;
  name: string;
  description: string;
  createdAt: string; 
  updatedAt: string; 
}