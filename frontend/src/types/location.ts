export const LocationStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type LocationStatus =
  typeof LocationStatus[keyof typeof LocationStatus];

export interface Location {
  id: string;
  name: string;
  address: string;
  communeId: string;
  communeName: string;
  provinceName: string;
  status: LocationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  communeId: string;
  status: LocationStatus;
}

export interface UpdateLocationRequest {
  name?: string;
  address?: string;
  communeId?: string;
  status?: LocationStatus;
}

export interface LocationImportError {
  message: string;
}

export interface LocationImportResult {
  total: number;
  success: number;
  errors: LocationImportError[];
}
