export interface QuestionTagDTO {
  id?: number;             
  name?: string;
  description?: string;
  active?: boolean;         
  createdAt?: string;      
  updatedAt?: string;       
}

export interface QuestionTagFilter {
  id?: number;
  name?: string;          
  description?: string;   
  questionIds?: number[];
}