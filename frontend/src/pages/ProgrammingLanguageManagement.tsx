import React, { useState } from 'react';
import {
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Download,
    Upload,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

import { PermissionGate } from '../components/PermissionGate';
import { MainLayout } from '../components/MainLayout';
import { Modal } from '../components/Modal';
import { useProgrammingLanguagesQuery } from '../hooks/useProgrammingLanguagesQuery';
import { useProgrammingLanguageActions } from '../hooks/useProgrammingLanguageActions';
import { useProgrammingLanguageImportExport } from '../hooks/useProgrammingLanguageImportExport';
import { useProgrammingLanguageModals } from '../hooks/useProgrammingLanguageModals';

export const ProgrammingLanguageManagement: React.FC = () => {
    // Focused hooks with single responsibilities
    const query = useProgrammingLanguagesQuery();
    const actions = useProgrammingLanguageActions(query.reload);
    const io = useProgrammingLanguageImportExport();
    const modals = useProgrammingLanguageModals();

    const [importFile, setImportFile] = useState<File | null>(null);

    const getBadgeStyle = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('java'))
            return 'bg-orange-50 text-orange-600 border-orange-100';
        if (lowerName.includes('python'))
            return 'bg-green-50 text-green-600 border-green-100';
        if (lowerName.includes('javascript'))
            return 'bg-yellow-50 text-yellow-600 border-yellow-100';
        if (lowerName.includes('typescript'))
            return 'bg-blue-50 text-blue-600 border-blue-100';
        if (lowerName.includes('c++') || lowerName.includes('cpp'))
            return 'bg-red-50 text-red-600 border-red-100';
        if (lowerName.includes('c#') || lowerName.includes('csharp'))
            return 'bg-purple-50 text-purple-600 border-purple-100';
        return 'bg-blue-50 text-blue-600 border-blue-100';
    };

    const getSupportedBadge = (isSupported: boolean) => {
        return isSupported 
            ? 'bg-green-50 text-green-600 border-green-100' 
            : 'bg-gray-50 text-gray-600 border-gray-100';
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // BR-PL-09: Display "N/A" if version or description is missing
    const displayValue = (value?: string) => {
        return value && value.trim() ? value : 'N/A';
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await actions.create(modals.newProgrammingLanguage);
        if (result.success) {
            modals.setShowCreateModal(false);
        }
    };

    const handleUpdateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!modals.selectedProgrammingLanguage) return;
        
        const updateData = {
            name: modals.selectedProgrammingLanguage.name,
            version: modals.selectedProgrammingLanguage.version,
            description: modals.selectedProgrammingLanguage.description,
        };
        
        const result = await actions.update(modals.selectedProgrammingLanguage.id, updateData);
        if (result.success) {
            modals.setShowUpdateModal(false);
        }
    };

    const handleDeleteSubmit = async () => {
        if (!modals.selectedProgrammingLanguage) return;
        
        const result = await actions.remove(modals.selectedProgrammingLanguage.id);
        if (result.success) {
            modals.setShowDeleteDialog(false);
        }
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // BR-PL-08: "Enter" executes immediately
            query.handleSearch(query.searchQuery, true);
        }
    };

    const getSortIcon = (field: string) => {
        if (query.sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return query.sortDir === 'asc' 
            ? <ArrowUp className="h-4 w-4 text-blue-500" />
            : <ArrowDown className="h-4 w-4 text-blue-500" />;
    };

    const handleImportSubmit = async () => {
        if (importFile) {
            await io.importFromFile(importFile, query.reload);
            setImportFile(null);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Programming Language Management</h1>
                        <p className="text-gray-600">Manage programming languages used in the system</p>
                    </div>
                    <div className="flex gap-3">
                        {/* Export Button */}
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_READ">
                            <button
                                onClick={io.exportToFile}
                                disabled={io.isExporting} // BR-PL-05: Disable export button while processing
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                {io.isExporting ? 'Exporting...' : 'Export'}
                            </button>
                        </PermissionGate>

                        {/* Import Button */}
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={modals.openImportDialog}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Upload className="h-4 w-4" />
                                Import
                            </button>
                        </PermissionGate>

                        {/* Create Button */}
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={modals.openCreateModal}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg font-medium transition-all duration-200 transform hover:scale-105"
                            >
                                <Plus className="h-5 w-5" />
                                Create Programming Language
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Search and Filters (3.2.9.5) */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={query.searchQuery}
                                    onChange={(e) => query.handleSearch(e.target.value)} // BR-PL-08: Debounce 500ms
                                    onKeyPress={handleSearchKeyPress}
                                    placeholder="Search programming languages..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={query.pageSize}
                                onChange={(e) => query.handlePageSizeChange(Number(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-600">per page</span>
                        </div>
                    </div>
                </div>

                {/* Programming Languages Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    {/* Results Summary */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {query.data.length} of {query.totalElements} programming languages
                        </p>
                    </div>

                    {query.isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Loading programming languages...</p>
                        </div>
                    ) : query.data.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <p>No programming languages found</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th 
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 w-1/3"
                                                onClick={() => query.handleSort('name')} // BR-PL-07: Sort toggles field → none
                                            >
                                                <div className="flex items-center gap-1">
                                                    Name
                                                    {getSortIcon('name')}
                                                </div>
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                Version
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                                                Supported
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {query.data.map((language) => (
                                            <tr key={language.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 w-1/3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getBadgeStyle(language.name)}`}>
                                                            {language.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 w-1/4">
                                                    {displayValue(language.version)}
                                                </td>
                                                <td className="px-6 py-4 w-1/4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSupportedBadge(language.isSupported)}`}>
                                                        {language.isSupported ? 'Supported' : 'Not Supported'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 w-1/6">
                                                    <div className="flex justify-center gap-2">
                                                        {/* View Button (3.2.9.6) */}
                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_READ">
                                                            <button
                                                                onClick={() => modals.openViewModal(language)}
                                                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>

                                                        {/* Edit Button (3.2.9.2) */}
                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_UPDATE">
                                                            <button
                                                                onClick={() => modals.openUpdateModal(language)}
                                                                className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>

                                                        {/* Delete Button (3.2.9.3) */}
                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_DELETE">
                                                            <button
                                                                onClick={() => modals.openDeleteDialog(language)}
                                                                className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {query.totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Page {query.currentPage + 1} of {query.totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => query.handlePageChange(query.currentPage - 1)}
                                                disabled={query.currentPage === 0}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            {Array.from({ length: Math.min(query.totalPages, 5) }, (_, i) => {
                                                const page = Math.max(0, Math.min(query.totalPages - 5, query.currentPage - 2)) + i;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => query.handlePageChange(page)}
                                                        className={`px-3 py-2 border rounded ${
                                                            page === query.currentPage 
                                                                ? 'bg-blue-600 text-white border-blue-600' 
                                                                : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => query.handlePageChange(query.currentPage + 1)}
                                                disabled={query.currentPage >= query.totalPages - 1}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* All Modals */}
            {/* Create Modal (3.2.9.1) */}
            <Modal
                isOpen={modals.showCreateModal}
                onClose={() => modals.setShowCreateModal(false)}
                title="Create Programming Language"
                size="md"
                actions={
                    <>
                        <button 
                            type="button" 
                            onClick={() => modals.setShowCreateModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button 
                            form="create-lang-form"
                            type="submit"
                            disabled={actions.isCreating}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                        >
                            {actions.isCreating ? 'Creating...' : 'Create Language'}
                        </button>
                    </>
                }
            >
                <form id="create-lang-form" onSubmit={handleCreateSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={modals.newProgrammingLanguage.name}
                            onChange={(e) => modals.setNewProgrammingLanguage({ ...modals.newProgrammingLanguage, name: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                actions.validationErrors.name ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter programming language name"
                        />
                        {actions.validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{actions.validationErrors.name}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {modals.newProgrammingLanguage.name.length}/255 characters
                        </p>
                    </div>

                    <div>
                        <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-1">
                            Version
                        </label>
                        <input
                            type="text"
                            id="version"
                            value={modals.newProgrammingLanguage.version || ''}
                            onChange={(e) => modals.setNewProgrammingLanguage({ ...modals.newProgrammingLanguage, version: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                actions.validationErrors.version ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter version (e.g., 17, 3.11)"
                        />
                        {actions.validationErrors.version && (
                            <p className="mt-1 text-sm text-red-600">{actions.validationErrors.version}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {(modals.newProgrammingLanguage.version || '').length}/255 characters
                        </p>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            value={modals.newProgrammingLanguage.description || ''}
                            onChange={(e) => modals.setNewProgrammingLanguage({ ...modals.newProgrammingLanguage, description: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                actions.validationErrors.description ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter description"
                        />
                        {actions.validationErrors.description && (
                            <p className="mt-1 text-sm text-red-600">{actions.validationErrors.description}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            {(modals.newProgrammingLanguage.description || '').length}/1000 characters
                        </p>
                    </div>
                </form>
            </Modal>

            {/* Update Modal (3.2.9.2) */}
            <Modal
                isOpen={modals.showUpdateModal && !!modals.selectedProgrammingLanguage}
                onClose={() => modals.setShowUpdateModal(false)}
                title="Update Programming Language"
                size="md"
                actions={
                    <>
                        <button 
                            type="button" 
                            onClick={() => modals.setShowUpdateModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button 
                            form="update-lang-form"
                            type="submit"
                            disabled={actions.isUpdating}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                        >
                            {actions.isUpdating ? 'Updating...' : 'Update Language'}
                        </button>
                    </>
                }
            >
                {modals.selectedProgrammingLanguage && (
                    <form id="update-lang-form" onSubmit={handleUpdateSubmit} className="space-y-5">
                        {/* Supported Badge (BR-PL-03: Cannot directly edit isSupported) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getSupportedBadge(modals.selectedProgrammingLanguage?.isSupported ?? false)}`}>
                                {modals.selectedProgrammingLanguage?.isSupported ? 'Supported' : 'Not Supported'}
                            </span>
                            <p className="mt-1 text-xs text-gray-500">Status is determined by the backend</p>
                        </div>

                        <div>
                            <label htmlFor="updateName" className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="updateName"
                                value={modals.selectedProgrammingLanguage?.name || ''}
                                onChange={(e) => modals.setSelectedProgrammingLanguage({ ...modals.selectedProgrammingLanguage!, name: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    actions.validationErrors.name ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter programming language name"
                            />
                            {actions.validationErrors.name && (
                                <p className="mt-1 text-sm text-red-600">{actions.validationErrors.name}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {(modals.selectedProgrammingLanguage?.name || '').length}/255 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="updateVersion" className="block text-sm font-medium text-gray-700 mb-1">
                                Version
                            </label>
                            <input
                                type="text"
                                id="updateVersion"
                                value={modals.selectedProgrammingLanguage?.version || ''}
                                onChange={(e) => modals.setSelectedProgrammingLanguage({ ...modals.selectedProgrammingLanguage!, version: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    actions.validationErrors.version ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter version (e.g., 17, 3.11)"
                            />
                            {actions.validationErrors.version && (
                                <p className="mt-1 text-sm text-red-600">{actions.validationErrors.version}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {(modals.selectedProgrammingLanguage?.version || '').length}/255 characters
                            </p>
                        </div>

                        <div>
                            <label htmlFor="updateDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="updateDescription"
                                rows={3}
                                value={modals.selectedProgrammingLanguage?.description || ''}
                                onChange={(e) => modals.setSelectedProgrammingLanguage({ ...modals.selectedProgrammingLanguage!, description: e.target.value })}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                                    actions.validationErrors.description ? 'border-red-300' : 'border-gray-300'
                                }`}
                                placeholder="Enter description"
                            />
                            {actions.validationErrors.description && (
                                <p className="mt-1 text-sm text-red-600">{actions.validationErrors.description}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {(modals.selectedProgrammingLanguage?.description || '').length}/1000 characters
                            </p>
                        </div>
                    </form>
                )}
            </Modal>

            {/* View Details Modal (3.2.9.6) */}
            <Modal
                isOpen={modals.showViewModal && !!modals.selectedProgrammingLanguage}
                onClose={() => modals.setShowViewModal(false)}
                title="Programming Language Details"
                size="md"
                actions={
                    <button
                        onClick={() => modals.setShowViewModal(false)}
                        className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 shadow-sm"
                    >
                        Close
                    </button>
                }
            >
                {modals.selectedProgrammingLanguage && (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <div className="flex items-center gap-2">
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getBadgeStyle(modals.selectedProgrammingLanguage.name)}`}>
                                    {modals.selectedProgrammingLanguage.name}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                            <p className="text-sm text-gray-900">{displayValue(modals.selectedProgrammingLanguage.version)}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supported</label>
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getSupportedBadge(modals.selectedProgrammingLanguage?.isSupported ?? false)}`}>
                                {modals.selectedProgrammingLanguage?.isSupported ? 'Supported' : 'Not Supported'}
                            </span>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{displayValue(modals.selectedProgrammingLanguage.description)}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                <div>
                                    <span className="font-medium">Created:</span>
                                    <br />
                                    {formatDate(modals.selectedProgrammingLanguage.createdAt)}
                                </div>
                                <div>
                                    <span className="font-medium">Updated:</span>
                                    <br />
                                    {formatDate(modals.selectedProgrammingLanguage.updatedAt)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Dialog (3.2.9.3) */}
            <Modal
                isOpen={modals.showDeleteDialog && !!modals.selectedProgrammingLanguage}
                onClose={() => modals.setShowDeleteDialog(false)}
                title="Delete Programming Language"
                size="sm"
                actions={
                    <>
                        <button
                            onClick={() => modals.setShowDeleteDialog(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteSubmit}
                            disabled={actions.isDeleting}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm disabled:bg-red-400"
                        >
                            {actions.isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </>
                }
            >
                {modals.selectedProgrammingLanguage && (
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete <strong>{modals.selectedProgrammingLanguage.name}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Import Dialog (3.2.9.4) */}
            <Modal
                isOpen={modals.showImportDialog}
                onClose={() => modals.setShowImportDialog(false)}
                title="Import Programming Languages"
                size="md"
                actions={
                    <>
                        <button
                            onClick={() => modals.setShowImportDialog(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                        >
                            Close
                        </button>
                        {importFile && !io.isImporting && (
                            <button
                                onClick={handleImportSubmit}
                                disabled={io.isImporting}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                            >
                                Import Languages
                            </button>
                        )}
                        {io.isImporting && (
                            <div className="px-4 py-2 text-blue-600 text-sm font-medium">
                                Importing...
                            </div>
                        )}
                    </>
                }
            >
                <div className="space-y-5">
                    {/* Step 1: Download Template */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Step 1: Download Template</h3>
                        <button
                            onClick={io.downloadTemplate}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                        >
                            <Download className="h-4 w-4" />
                            Download Template
                        </button>
                    </div>

                    {/* Step 2: Select File */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Step 2: Select File</h3>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                        />
                    </div>

                    {/* Step 3: Preview/Import */}
                    {importFile && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Step 3: Import</h3>
                            <div className="bg-gray-50 p-3 rounded border">
                                <p className="text-sm text-gray-600">
                                    Selected file: <span className="font-medium">{importFile.name}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Import Results (BR-PL-06) */}
                    {io.importResult && (
                        <div className="border-t pt-4">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Import Results</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600">Successful:</span>
                                    <span className="font-medium">{io.importResult.successCount}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-red-600">Failed:</span>
                                    <span className="font-medium">{io.importResult.failureCount}</span>
                                </div>
                                {io.importResult.errors && io.importResult.errors.length > 0 && (
                                    <button
                                        onClick={io.downloadErrorReport}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Download Error Report
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </MainLayout>
    );
};