export interface AssessmentTypeDTO {
  id: string;              
  name: string;
  description: string;
  createdAt: string;       
  updatedAt: string;       
}

export interface AssessmentTypeFilter {
  id?: string;
  name?: string;
  createdRange?: [string, string];  
  updatedRange?: [string, string];  
}