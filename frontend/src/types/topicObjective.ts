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