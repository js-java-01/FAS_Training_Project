export interface ProgrammingLangDTO {
  id?: string;
  name?: string;
  version?: string;
  description?: string;
  isSupported?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgrammingLangFilter {
  isSupported?: boolean;
  name?: string;
  version?: string;
  createdRange?: [string, string];
}
