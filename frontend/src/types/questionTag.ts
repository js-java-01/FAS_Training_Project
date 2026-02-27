export interface QuestionTag {
    id: number;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuestionTagRequest {
    name: string;
    description: string;
}

export interface Sort {
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
}

export interface Pageable {
    offset: number;
    sort: Sort[];
    paged: boolean;
    pageNumber: number;
    pageSize: number;
    unpaged: boolean;
}

export interface PagedQuestionTagResponse {
    totalPages: number;
    totalElements: number;
    first: boolean;
    last: boolean;
    size: number;
    content: QuestionTag[];
    number: number;
    sort: Sort[];
    numberOfElements: number;
    pageable: Pageable;
    empty: boolean;
}
