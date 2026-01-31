import { useState } from 'react';
import type { ProgrammingLanguage, ProgrammingLanguageRequest } from '../types/programmingLanguage';

export const useProgrammingLanguageModals = () => {
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    
    // Form data
    const [newProgrammingLanguage, setNewProgrammingLanguage] = useState<ProgrammingLanguageRequest>({
        name: '',
        version: '',
        description: '',
    });
    const [selectedProgrammingLanguage, setSelectedProgrammingLanguage] = useState<ProgrammingLanguage | null>(null);

    // Modal actions
    const openCreateModal = () => {
        setNewProgrammingLanguage({ name: '', version: '', description: '' });
        setShowCreateModal(true);
    };

    const openUpdateModal = (language: ProgrammingLanguage) => {
        setSelectedProgrammingLanguage({ ...language });
        setShowUpdateModal(true);
    };

    const openViewModal = (language: ProgrammingLanguage) => {
        setSelectedProgrammingLanguage(language);
        setShowViewModal(true);
    };

    const openDeleteDialog = (language: ProgrammingLanguage) => {
        setSelectedProgrammingLanguage(language);
        setShowDeleteDialog(true);
    };

    const openImportDialog = () => {
        setShowImportDialog(true);
    };

    const closeAllModals = () => {
        setShowCreateModal(false);
        setShowUpdateModal(false);
        setShowViewModal(false);
        setShowDeleteDialog(false);
        setShowImportDialog(false);
        setSelectedProgrammingLanguage(null);
    };

    return {
        // Modal states
        showCreateModal,
        showUpdateModal,
        showViewModal,
        showDeleteDialog,
        showImportDialog,
        
        // Form data
        newProgrammingLanguage,
        selectedProgrammingLanguage,
        
        // Setters (for controlled components)
        setShowCreateModal,
        setShowUpdateModal,
        setShowViewModal,
        setShowDeleteDialog,
        setShowImportDialog,
        setNewProgrammingLanguage,
        setSelectedProgrammingLanguage,
        
        // Actions
        openCreateModal,
        openUpdateModal,
        openViewModal,
        openDeleteDialog,
        openImportDialog,
        closeAllModals,
    };
};