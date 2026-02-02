// Simple validation without external dependencies
export interface ProgrammingLanguageFormData {
  name: string;
  version?: string;
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateProgrammingLanguage = (data: ProgrammingLanguageFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // BR-PL-01: Name is required, ≤ 255 characters
  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 255) {
    errors.name = 'Name must be ≤ 255 characters';
  }

  // BR-PL-02: Version ≤ 255 characters; Description ≤ 1000 characters
  if (data.version && data.version.length > 255) {
    errors.version = 'Version must be ≤ 255 characters';
  }

  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be ≤ 1000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};