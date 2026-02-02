export interface Location {
    id: string;
    name: string;
}

export interface CreateDepartmentRequest {
    name: string;
    code: string;
    description?: string;
    locationId: string;
}


export interface Department {
    id: string;
    name: string;
    code: string;
    description?: string;
    locationId?: string;
    locationName?: string;
}