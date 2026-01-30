export enum LocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Location {
  id: string;
  name: string;
  address: string;
  communeId: string;
  communeName: string;
  provinceName: string;
  status: LocationStatus;
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
