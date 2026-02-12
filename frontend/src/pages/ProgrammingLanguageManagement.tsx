import React, { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, 
    Upload, 
    Download, 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2
} from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PermissionGate } from '../components/PermissionGate';
import { useToast } from '../hooks/useToast.ts';
import {
    CreateLanguageModal,
    UpdateLanguageModal,
    ViewLanguageModal,
    DeleteLanguageDialog,
    ImportLanguageDialog,
    ExportModal
} from '../components/programming-language';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import type { 
    ProgrammingLanguage,
    ProgrammingLanguageRequest,
    ExportRequest,
    ExportPreviewResponse,
    ImportResult
} from '../types/programmingLanguage';

/**
 * Programming Language Management Page with Enhanced Table
 * 
 * This page uses the same data loading approach as ExportModal
 * with proper sorting, pagination, search, and action buttons.
 */
export const ProgrammingLanguageManagement: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ========================================
    // State: Table Data & Configuration
    // ========================================
    const [tableData, setTableData] = useState<ExportPreviewResponse | null>(null);
    const [isLoadingTable, setIsLoadingTable] = useState(false);

    // ========================================
    // State: Table Configuration (similar to ExportModal)
    // ========================================
    const [keyword, setKeyword] = useState('');
    const [filters] = useState<Record<string, string>>({});
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    
    // Selected fields for table display
    const selectedFields = ['name', 'version', 'description', 'isSupported'];

    // ========================================
    // State: Modal Controls
    // ========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);

    // ========================================
    // Load Table Data (similar to ExportModal's loadPreview)
    // ========================================
    const loadTableData = useCallback(async () => {
        setIsLoadingTable(true);
        try {
            const request: ExportRequest = {
                keyword: keyword || undefined,
                filters: Object.keys(filters).length > 0 ? filters : undefined,
                sortBy,
                sortDirection,
                page,
                size,
                selectedFields,
                format: 'EXCEL'
            };
            const response = await programmingLanguageApi.getExportPreview(request);
            setTableData(response);
        } catch (error) {
            console.error('Failed to load table data:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load programming languages data",
            });
        } finally {
            setIsLoadingTable(false);
        }
    }, [keyword, filters, sortBy, sortDirection, page, size, toast]);

    // Load table data on mount and when config changes
    useEffect(() => {
        loadTableData();
    }, [page, size, sortBy, sortDirection, loadTableData]);

    // ========================================
    // Event Handlers: Table Controls
    // ========================================
    const handleSearch = () => {
        setPage(0);
        loadTableData();
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
        setPage(0);
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'ASC'
            ? <ArrowUp className="h-4 w-4 text-blue-500" />
            : <ArrowDown className="h-4 w-4 text-blue-500" />;
    };

    // ========================================
    // CRUD Mutations
    // ========================================
    const createMutation = useMutation({
        mutationFn: programmingLanguageApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            loadTableData();
            setShowCreateModal(false);
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
                description: error.response?.data?.message || "Failed to create programming language",
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProgrammingLanguageRequest }) =>
            programmingLanguageApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            loadTableData();
            setShowUpdateModal(false);
            setSelectedLanguage(null);
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
                description: error.response?.data?.message || "Failed to update programming language",
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: programmingLanguageApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            loadTableData();
            setShowDeleteDialog(false);
            setSelectedLanguage(null);
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
                description: error.response?.data?.message || "Failed to delete programming language",
            });
        }
    });

    const importMutation = useMutation({
        mutationFn: programmingLanguageApi.import,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            loadTableData();
            toast({
                variant: "success",
                title: "Import Successful",
                description: "Programming languages imported successfully!",
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Import Failed",
                description: error.response?.data?.message || "Failed to import programming languages",
            });
        }
    });

    // ========================================
    // Modal Event Handlers
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

    const handleCreate = (data: ProgrammingLanguageRequest) => {
        createMutation.mutate(data);
    };

    const handleUpdate = (id: number, data: ProgrammingLanguageRequest) => {
        updateMutation.mutate({ id, data });
    };

    const handleDelete = () => {
        if (selectedLanguage) {
            deleteMutation.mutate(selectedLanguage.id);
        }
    };

    const handleImport = (file: File) => {
        importMutation.mutate(file);
    };

    // ========================================
    // Helper Functions
    // ========================================
    const formatCellValue = (value: unknown): string => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Supported' : 'Not Supported';
        return String(value);
    };

    const getFieldLabel = (fieldName: string): string => {
        const labels: Record<string, string> = {
            name: 'Name',
            version: 'Version', 
            description: 'Description',
            isSupported: 'Supported'
        };
        return labels[fieldName] || fieldName;
    };

    const getCellClassName = (fieldName: string, value: unknown): string => {
        if (fieldName === 'isSupported') {
            const isSupported = Boolean(value);
            return `inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                isSupported 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
            }`;
        }
        if (fieldName === 'name') {
            return 'inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-blue-50 text-blue-700 border-blue-200';
        }
        return 'text-gray-900';
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
                        <h1 className="text-2xl font-bold text-gray-900">Programming Languages</h1>
                        <p className="text-gray-600">Manage programming languages and their configurations</p>
                    </div>
                    <div className="flex gap-3">
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_READ">
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Download className="h-4 w-4" />
                                Export
                            </button>
                        </PermissionGate>
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={() => setShowImportDialog(true)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Upload className="h-4 w-4" />
                                Import
                            </button>
                        </PermissionGate>
                        <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                Create Language
                            </button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search programming languages..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Programming Languages ({tableData?.totalElements ?? 0})
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Show:</span>
                                <select
                                    value={size}
                                    onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {isLoadingTable ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                    <p className="mt-2 text-sm text-gray-500">Loading data...</p>
                                </div>
                            ) : tableData && tableData.content.length > 0 ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {selectedFields.map((field) => (
                                                        <th
                                                            key={field}
                                                            onClick={() => handleSort(field)}
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {getFieldLabel(field)}
                                                                {getSortIcon(field)}
                                                            </div>
                                                        </th>
                                                    ))}
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {tableData.content.map((row, idx) => (
                                                    <tr key={(row.id as number) || idx} className="hover:bg-gray-50">
                                                        {selectedFields.map((field) => (
                                                            <td key={field} className="px-6 py-4">
                                                                <span className={getCellClassName(field, row[field])}>
                                                                    {formatCellValue(row[field])}
                                                                </span>
                                                            </td>
                                                        ))}
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center gap-2">
                                                                <PermissionGate permission="PROGRAMMING_LANGUAGE_READ">
                                                                    <button
                                                                        onClick={() => openViewModal(row as unknown as ProgrammingLanguage)}
                                                                        className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                                        title="View details"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </button>
                                                                </PermissionGate>

                                                                <PermissionGate permission="PROGRAMMING_LANGUAGE_UPDATE">
                                                                    <button
                                                                        onClick={() => openUpdateModal(row as unknown as ProgrammingLanguage)}
                                                                        className="p-1 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </button>
                                                                </PermissionGate>

                                                                <PermissionGate permission="PROGRAMMING_LANGUAGE_DELETE">
                                                                    <button
                                                                        onClick={() => openDeleteDialog(row as unknown as ProgrammingLanguage)}
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
                                    {tableData.totalPages > 1 && (
                                        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                                            <span className="text-sm text-gray-600">
                                                Page {page + 1} of {tableData.totalPages}
                                            </span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => setPage(p => p - 1)}
                                                    disabled={page === 0}
                                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setPage(p => p + 1)}
                                                    disabled={page >= tableData.totalPages - 1}
                                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No programming languages found
                                </div>
                            )}
                        </div>
                    </div>
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
                importResult={(importMutation.data as ImportResult) ?? null}
                onSuccess={() => {
                    loadTableData();
                }}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />
        </MainLayout>
    );
};

export default ProgrammingLanguageManagement;