import { useState } from 'react';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import { toast } from '../lib/toast';
import { validateProgrammingLanguage } from '../lib/programmingLanguageSchema';
import type { ProgrammingLanguageRequest } from '../types/programmingLanguage';

export const useProgrammingLanguageActions = (onSuccess?: () => void) => {
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const create = async (data: ProgrammingLanguageRequest) => {
        if (isCreating) return { success: false, error: 'Operation already in progress' };
        
        const validation = validateProgrammingLanguage(data);
        
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return { success: false, errors: validation.errors };
        }

        try {
            setIsCreating(true);
            setValidationErrors({});
            await programmingLanguageApi.create(data);
            
            toast.success('Programming language created successfully!');
            onSuccess?.();
            return { success: true };
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Error creating programming language';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (id: number, data: ProgrammingLanguageRequest) => {
        if (isUpdating) return { success: false, error: 'Operation already in progress' };
        
        // BR-PL-03: Strip isSupported field to prevent direct editing
        const { isSupported, ...sanitizedData } = data as any;
        
        const validation = validateProgrammingLanguage(sanitizedData);
        
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return { success: false, errors: validation.errors };
        }

        try {
            setIsUpdating(true);
            setValidationErrors({});
            await programmingLanguageApi.update(id, sanitizedData);
            
            toast.success('Programming language updated successfully!');
            onSuccess?.();
            return { success: true };
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Error updating programming language';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsUpdating(false);
        }
    };

    const remove = async (id: number) => {
        if (isDeleting) return { success: false, error: 'Operation already in progress' };
        
        try {
            setIsDeleting(true);
            await programmingLanguageApi.delete(id);
            
            toast.success('Programming language deleted successfully!');
            onSuccess?.();
            return { success: true };
        } catch (error) {
            // BR-PL-04: Backend refuses delete if the language is attached to an exercise; UI displays error
            const errorMessage = (error as any).response?.data?.message || 'Error deleting programming language';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsDeleting(false);
        }
    };

    const clearValidationErrors = () => {
        setValidationErrors({});
    };

    // BR-PL-09: Utility function to display "N/A" for empty version/description
    const formatDisplayValue = (value?: string) => {
        return value && value.trim() !== '' ? value : 'N/A';
    };

    return {
        validationErrors,
        isCreating,
        isUpdating,
        isDeleting,
        isLoading: isCreating || isUpdating || isDeleting,
        create,
        update,
        remove,
        clearValidationErrors,
        formatDisplayValue,
    };
};