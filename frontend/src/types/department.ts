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


export interface CreateDepartmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    description: string;
    location: {
        id: string;
        name: string;
        address?: string;
        communeId?: string;
        locationStatus?: string;
    };
}