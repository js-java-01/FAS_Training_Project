import { assessmentTypeApi } from '@/api';
import type { AssessmentType, AssessmentTypeRequest } from '@/types';
import { useEffect, useState } from 'react';

export const useAssessment = () => {
    const [assessments, setAssessments] = useState<AssessmentType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [newAssessment, setNewAssessment] =
        useState<AssessmentTypeRequest>({
            name: '',
            description: '',
        });

    const loadData = async () => {
        try {
            setIsLoading(true);
            const data = await assessmentTypeApi.getAll();
            setAssessments(data);
        } catch (error) {
            console.error('Error loading assessments:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const search = async (value: string) => {
        setSearchTerm(value);

        if (!value.trim()) {
            loadData();
            return;
        }

        try {
            const data = await assessmentTypeApi.searchByName(value);
            setAssessments(data);
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const createAssessment = async () => {
        try {
            await assessmentTypeApi.create(newAssessment);
            setShowCreateModal(false);
            setNewAssessment({ name: '', description: '' });
            loadData();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((error as any).response?.data?.message || 'Error creating assessment.ts');
        }
    };

    const updateAssessment = async () => {
        if (!editingId) return;
        try {
            await assessmentTypeApi.update(editingId, newAssessment);
            setShowCreateModal(false);
            setIsEditMode(false);
            setEditingId(null);
            setNewAssessment({ name: '', description: '' });
            loadData();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((error as any).response?.data?.message || 'Error updating assessment.ts');
        }
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setEditingId(null);
        setNewAssessment({ name: '', description: '' });
        setShowCreateModal(true);
    };

    const openEditModal = (assessment: AssessmentType) => {
        setIsEditMode(true);
        setEditingId(assessment.id);
        setNewAssessment({
            name: assessment.name,
            description: assessment.description,
        });
        setShowCreateModal(true);
    };

    const deleteAssessment = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this assessment.ts?'))
            return;

        try {
            await assessmentTypeApi.delete(id);
            loadData();
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            alert((error as any).message || 'Delete failed');
        }
    };

    const handleImport = async (file: File) => {
        try {
            setIsLoading(true);
            await assessmentTypeApi.importAssessments(file);
            await loadData();
            alert('Import successful');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.response?.data?.message || 'Import failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        if (!window.confirm('Are you sure you want to export assessments types?'))
            return;

        try {
            await assessmentTypeApi.exportAssessments();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            alert(error.response?.data?.message || 'Export failed');
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return {
        // state
        assessments,
        isLoading,
        searchTerm,
        showCreateModal,
        isEditMode,
        newAssessment,

        // setters
        setSearchTerm,
        setShowCreateModal,
        setNewAssessment,

        // actions
        search,
        createAssessment,
        updateAssessment,
        openCreateModal,
        openEditModal,
        deleteAssessment,
        handleImport,
        handleExport,
        reload: loadData,
    };
};

export const downloadTemplate = async (toast: any) => {
    try {
        const blob = await assessmentTypeApi.downloadTemplate();
        downloadBlob(blob, 'assessment.ts-types-template.xlsx');
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
