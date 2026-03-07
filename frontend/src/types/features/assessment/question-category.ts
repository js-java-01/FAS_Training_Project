export interface QuestionCategoryDTO {
  id: string;       
  name: string;
  description?: string;
  createdAt: string;   
  updatedAt: string; 
} 

export interface QuestionCategoryFilter {
  id?: string;
  name?: string;
  description?: string;
  createdRange?: [string, string]; 
}