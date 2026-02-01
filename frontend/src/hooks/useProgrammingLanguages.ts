import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import { toast } from '../lib/toast';
import type { SearchParams } from '../types/programmingLanguage';

// Query keys for cache management
export const programmingLanguageKeys = {
    all: ['programming-languages'] as const,
    lists: () => [...programmingLanguageKeys.all, 'list'] as const,
    list: (params: SearchParams) => [...programmingLanguageKeys.lists(), params] as const,
};

// Query hook - just fetches data
export const useProgrammingLanguagesQuery = (params: SearchParams) => {
    return useQuery({
        queryKey: programmingLanguageKeys.list(params),
        queryFn: () => programmingLanguageApi.getAll(params),
    });
};

// Mutations hook - handles all server mutations
export const useProgrammingLanguageMutations = () => {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: programmingLanguageKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: programmingLanguageApi.create,
        onSuccess: () => {
            invalidate();
            toast.success('Programming language created successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error creating programming language');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => programmingLanguageApi.update(id, data),
        onSuccess: () => {
            invalidate();
            toast.success('Programming language updated successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error updating programming language');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: programmingLanguageApi.delete,
        onSuccess: () => {
            invalidate();
            toast.success('Programming language deleted successfully!');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error deleting programming language');
        },
    });

    const importMutation = useMutation({
        mutationFn: programmingLanguageApi.import,
        onSuccess: (result) => {
            invalidate();
            toast.success(`Import completed: ${result.successCount} successful, ${result.failureCount} failed`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error importing programming languages');
        },
    });

    return { createMutation, updateMutation, deleteMutation, importMutation };
};

// Export utilities (not mutations - just download helpers)
export const downloadExport = async () => {
    try {
        const blob = await programmingLanguageApi.export();
        const today = new Date().toISOString().split('T')[0];
        downloadBlob(blob, `programming-languages-${today}.xlsx`);
        toast.success('Programming languages exported successfully!');
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error exporting programming languages');
    }
};

export const downloadTemplate = async () => {
    try {
        const blob = await programmingLanguageApi.downloadTemplate();
        downloadBlob(blob, 'programming-languages-template.xlsx');
        toast.success('Template downloaded successfully!');
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Error downloading template');
    }
};

const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
};