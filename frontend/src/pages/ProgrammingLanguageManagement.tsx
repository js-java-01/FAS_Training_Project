import React, { useRef, useState } from 'react';
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
import {
    CreateLanguageModal,
    UpdateLanguageModal,
    ViewLanguageModal,
    DeleteLanguageDialog,
    ImportLanguageDialog,
    getLanguageBadgeStyle,
    getSupportedBadgeStyle,
    displayValue,
} from '../components/programming-language';
import { useProgrammingLanguagesQuery, useProgrammingLanguageMutations, downloadExport } from '../hooks/useProgrammingLanguages';
import type { ProgrammingLanguage, ProgrammingLanguageRequest } from '../types/programmingLanguage';

/**
 * Programming Language Management Page
 *
 * State Management Strategy:
 * - Server state (data fetching, caching, mutations) → TanStack Query
 * - UI state (modals, search, pagination) → Local useState
 * - Form state → Encapsulated in modal components
 *
 * This separation follows TanStack Query best practices and keeps
 * the page component focused on orchestration rather than form logic.
 */
export const ProgrammingLanguageManagement: React.FC = () => {
    // ========================================
    // UI State: Search, Pagination & Sorting
    // ========================================
    /** Current search input value (updates on every keystroke) */
    const [searchQuery, setSearchQuery] = useState('');
    /** Debounced search value (triggers API call after 500ms delay) */
    const [debouncedSearch, setDebouncedSearch] = useState('');
    /** Current page index (0-based) */
    const [currentPage, setCurrentPage] = useState(0);
    /** Number of items per page */
    const [pageSize, setPageSize] = useState(10);
    /** Field to sort by (empty string = no sorting) */
    const [sortBy, setSortBy] = useState('');
    /** Sort direction */
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    /** Ref for search debounce timeout */
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ========================================
    // UI State: Modal Visibility
    // ========================================
    /** Controls Create Programming Language modal */
    const [showCreateModal, setShowCreateModal] = useState(false);
    /** Controls Edit Programming Language modal */
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    /** Controls View Details modal (read-only) */
    const [showViewModal, setShowViewModal] = useState(false);
    /** Controls Delete Confirmation dialog */
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    /** Controls Import CSV dialog */
    const [showImportDialog, setShowImportDialog] = useState(false);
    /** Currently selected language for view/edit/delete operations */
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);
    /** Loading state for export operation */
    const [isExporting, setIsExporting] = useState(false);

    // ========================================
    // Server State: TanStack Query Hooks
    // ========================================
    const { data, isLoading, isFetching } = useProgrammingLanguagesQuery({
        page: currentPage,
        size: pageSize,
        search: debouncedSearch,
        sortBy: sortBy || undefined,
        sortDir: sortBy ? sortDir : undefined,
    });
    const { createMutation, updateMutation, deleteMutation, importMutation } = useProgrammingLanguageMutations();

    // ========================================
    // Derived Data
    // ========================================
    /** Paginated list of programming languages from current query */
    const languages = data?.content ?? [];
    /** Total number of records matching current filters */
    const totalElements = data?.totalElements ?? 0;
    /** Total number of pages available */
    const totalPages = data?.totalPages ?? 0;

    // ========================================
    // Event Handlers: Search & Sort
    // ========================================

    /** BR-PL-08: Search debounce 500ms; "Enter" executes immediately */
    const handleSearch = (query: string, immediate = false) => {
        setSearchQuery(query);
        setCurrentPage(0);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (immediate) {
            setDebouncedSearch(query);
        } else {
            searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(query), 500);
        }
    };

    /** BR-PL-07: Sort toggles asc → desc → none */
    const handleSort = (field: string) => {
        if (sortBy === field) {
            if (sortDir === 'asc') {
                setSortDir('desc');
            } else {
                setSortBy('');
            }
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setCurrentPage(0);
    };

    const handleSearchKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch(searchQuery, true);
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortDir === 'asc'
            ? <ArrowUp className="h-4 w-4 text-blue-500" />
            : <ArrowDown className="h-4 w-4 text-blue-500" />;
    };

    // ========================================
    // Event Handlers: CRUD Operations
    // ========================================

    const handleCreate = (data: ProgrammingLanguageRequest) => {
        createMutation.mutate(data, {
            onSuccess: () => setShowCreateModal(false),
        });
    };

    const handleUpdate = (id: number, data: ProgrammingLanguageRequest) => {
        updateMutation.mutate({ id, data }, {
            onSuccess: () => setShowUpdateModal(false),
        });
    };

    const handleDelete = () => {
        if (!selectedLanguage) return;
        deleteMutation.mutate(selectedLanguage.id, {
            onSuccess: () => setShowDeleteDialog(false),
        });
    };

    const handleImport = (file: File) => {
        importMutation.mutate(file);
    };

    const handleExport = async () => {
        setIsExporting(true);
        await downloadExport();
        setIsExporting(false);
    };

    // ========================================
    // Event Handlers: Modal Open
    // ========================================

    const openViewModal = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setShowViewModal(true);
    };

    const openUpdateModal = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setShowUpdateModal(true);
    };

    const openDeleteDialog = (language: ProgrammingLanguage) => {
        setSelectedLanguage(language);
        setShowDeleteDialog(true);
    };

    // ========================================
    // Render
    // ========================================
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
                                onClick={handleExport}
                                disabled={isExporting}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Download className="h-4 w-4" />
                                {isExporting ? 'Exporting...' : 'Export'}
                            </button>
                        </PermissionGate>

                        {/* Import Button */}
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={() => setShowImportDialog(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <Upload className="h-4 w-4" />
                                Import
                            </button>
                        </PermissionGate>

                        {/* Create Button */}
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg font-medium transition-all duration-200 transform hover:scale-105"
                            >
                                <Plus className="h-5 w-5" />
                                Create Programming Language
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <div className="flex gap-4 items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    onKeyPress={handleSearchKeyPress}
                                    placeholder="Search programming languages..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}
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

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow border border-gray-200">
                    {/* Results Summary */}
                    <div className="px-6 py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {languages.length} of {totalElements} programming languages
                            {isFetching && !isLoading && <span className="ml-2 text-blue-500">(updating...)</span>}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="mt-2 text-gray-600">Loading programming languages...</p>
                        </div>
                    ) : languages.length === 0 ? (
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
                                                onClick={() => handleSort('name')}
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
                                        {languages.map((language) => (
                                            <tr key={language.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 w-1/3">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getLanguageBadgeStyle(language.name)}`}>
                                                        {language.name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 w-1/4">
                                                    {displayValue(language.version)}
                                                </td>
                                                <td className="px-6 py-4 w-1/4">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSupportedBadgeStyle(language.isSupported)}`}>
                                                        {language.isSupported ? 'Supported' : 'Not Supported'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 w-1/6">
                                                    <div className="flex justify-center gap-2">
                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_READ">
                                                            <button
                                                                onClick={() => openViewModal(language)}
                                                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                title="View details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>

                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_UPDATE">
                                                            <button
                                                                onClick={() => openUpdateModal(language)}
                                                                className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                        </PermissionGate>

                                                        <PermissionGate permission="PROGRAMMING_LANGUAGE_DELETE">
                                                            <button
                                                                onClick={() => openDeleteDialog(language)}
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
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Page {currentPage + 1} of {totalPages}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                                const page = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-2 border rounded ${
                                                            page === currentPage
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page + 1}
                                                    </button>
                                                );
                                            })}
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage >= totalPages - 1}
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

            {/* Modals */}
            <CreateLanguageModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreate}
                isPending={createMutation.isPending}
            />

            <UpdateLanguageModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                language={selectedLanguage}
                onSubmit={handleUpdate}
                isPending={updateMutation.isPending}
            />

            <ViewLanguageModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                language={selectedLanguage}
            />

            <DeleteLanguageDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                language={selectedLanguage}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />

            <ImportLanguageDialog
                isOpen={showImportDialog}
                onClose={() => setShowImportDialog(false)}
                onImport={handleImport}
                isPending={importMutation.isPending}
                importResult={importMutation.data ?? null}
            />
        </MainLayout>
    );
};
