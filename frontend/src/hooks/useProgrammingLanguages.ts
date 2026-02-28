import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import { useToast } from './useToast.ts';
import dayjs from 'dayjs';
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
    const { toast } = useToast();

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: programmingLanguageKeys.lists() });
    };

    const createMutation = useMutation({
        mutationFn: programmingLanguageApi.create,
        onSuccess: () => {
            invalidate();
            toast({
                variant: "success",
                title: "Success",
                description: "Programming language created successfully!",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Error creating programming language',
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => programmingLanguageApi.update(id, data),
        onSuccess: () => {
            invalidate();
            toast({
                variant: "success",
                title: "Success",
                description: "Programming language updated successfully!",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Error updating programming language',
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: programmingLanguageApi.delete,
        onSuccess: () => {
            invalidate();
            toast({
                variant: "success",
                title: "Success",
                description: "Programming language deleted successfully!",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Error deleting programming language',
            });
        },
    });

    const importMutation = useMutation({
        mutationFn: programmingLanguageApi.import,
        onSuccess: () => {
            invalidate();
            // Toast messages are now handled by the ImportLanguageDialog component
        },
        onError: (error: any) => {
            // Only show toast for network/server errors, not validation errors
            const errorMessage = error.response?.data?.message;
            if (!errorMessage || !errorMessage.includes('Missing required column')) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: errorMessage || 'Error importing programming languages',
                });
            }
        },
    });

    return { createMutation, updateMutation, deleteMutation, importMutation };
};

// Export utilities (not mutations - just download helpers)
export const downloadExport = async (toast: any) => {
    try {
        const blob = await programmingLanguageApi.export();
        const today = new Date().toISOString().split('T')[0];
        downloadBlob(blob, `programming-languages-${today}.xlsx`);
        toast({
            variant: "success",
            title: "Success",
            description: "Programming languages exported successfully!",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || 'Error exporting programming languages',
        });
    }
};

export const downloadTemplate = async (toast: any) => {
    try {
        const blob = await programmingLanguageApi.downloadTemplate();
        downloadBlob(blob, `programming-languages-template_${dayjs().format('DD-MM-YYYY_HH-mm-ss')}.xlsx`);
        toast({
            variant: "success",
            title: "Success",
            description: "Template downloaded successfully!",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || 'Error downloading template',
        });
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