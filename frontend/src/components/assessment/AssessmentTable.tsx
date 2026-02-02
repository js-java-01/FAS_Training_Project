import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Loader2,
    Plus,
    RotateCcw,
    Search,
    SquarePen,
    Trash2,
    Upload
} from 'lucide-react';
import React, { useState } from 'react';

import { assessmentTypeApi } from '../../api/assessmentTypeApi';
import { PermissionGate } from '../../components/PermissionGate';
import { useToast } from '../../hooks/use-toast';
import type { AssessmentTypeRequest, ImportResult } from '../../types/assessmentType';
import type { AssessmentType } from '../../types/assessmentType';

import { CreateAssessmentModal } from './CreateAssessmentModal';
import { DeleteAssessmentDialog } from './DeleteAssessmentDialog';
import { ImportAssessmentDialog } from './ImportAssessmentDialog';
import { UpdateAssessmentModal } from './UpdateAssessmentModal';
import { ViewAssessmentModal } from './ViewAssessmentModal';
import { ExportModal } from './ExportModal';


export const AssessmentTable: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ========================================
    // State: Table Configuration
    // ========================================
    const [keyword, setKeyword] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    // ========================================
    // State: Modal Controls
    // ========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);

    // ========================================
    // Data Loading (Queries)
    // ========================================
    const { data: tableData, isLoading, refetch } = useQuery({
        queryKey: ['assessments', page, size, sortBy, sortDir, keyword],
        queryFn: () => assessmentTypeApi.getAll({
            page,
            size,
            sortBy,
            sortDir,
            keyword: keyword || undefined
        })
    });

    // ========================================
    // CRUD Mutations
    // ========================================
    const createMutation = useMutation({
        mutationFn: assessmentTypeApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setShowCreateModal(false);
            toast({ variant: "success", title: "Success", description: "Assessment type created successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create assessment type" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: AssessmentTypeRequest }) =>
            assessmentTypeApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setShowUpdateModal(false);
            toast({ variant: "success", title: "Success", description: "Assessment type updated successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update assessment type" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: assessmentTypeApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setShowDeleteDialog(false);
            toast({ variant: "success", title: "Success", description: "Assessment type deleted successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete assessment type" });
        }
    });

    const importMutation = useMutation({
        mutationFn: assessmentTypeApi.importAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        },
        onError: (error: any) => {
            // Only show toast for network/server errors, not validation errors
            const errorMessage = error.response?.data?.message;
            if (!errorMessage || !errorMessage.includes('Missing required column')) {
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: errorMessage || "An error occurred during import",
                });
            }
        }
    });

    // ========================================
    // Handlers
    // ========================================
    const handleSearch = () => {
        setPage(0);
        refetch();
    };

    const handleReset = () => {
        setKeyword('');
        setPage(0);
        setSortBy('createdAt');
        setSortDir('desc');
    };

    const handleExport = () => {
        setShowExportModal(true);
    };

    const getBadgeStyle = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('test')) return 'bg-blue-50 text-blue-600 border-blue-100';
        if (lowerName.includes('assignment')) return 'bg-green-50 text-green-600 border-green-100';
        if (lowerName.includes('challenge')) return 'bg-cyan-50 text-cyan-600 border-cyan-100';
        if (lowerName.includes('interview')) return 'bg-gray-50 text-gray-600 border-gray-100';
        if (lowerName.includes('exam')) return 'bg-red-50 text-red-600 border-red-100';
        return 'bg-blue-50 text-blue-600 border-blue-100';
    };

    const formatDate = (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="flex flex-col gap-4">

            {/* Toolbar: Search + Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Search & Filters */}
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search by name..."
                            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 transition outline-none text-sm"
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition"
                    >
                        Search
                    </button>

                    <button
                        onClick={handleReset}
                        className="p-2 border rounded-md hover:bg-gray-50 transition"
                        title="Reset"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 transition"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    <button
                        onClick={() => setShowImportDialog(true)}
                        className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm hover:bg-gray-50 transition"
                    >
                        <Upload size={16} />
                        <span className="hidden sm:inline">Import</span>
                    </button>

                    <PermissionGate permission="ASSESSMENT_CREATE">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Assessment</span>
                        </button>
                    </PermissionGate>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden border">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">#</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200 relative">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                            <span className="text-sm text-gray-500 font-medium">Loading assessments...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : tableData?.content && tableData.content.length > 0 ? (
                                tableData.content.map((assessment, index) => (
                                    <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {page * size + index + 1}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded inline-flex text-xs font-semibold border ${getBadgeStyle(assessment.name)}`}>
                                                {assessment.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                            {assessment.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(assessment.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                <PermissionGate permission="ASSESSMENT_UPDATE">
                                                    <button
                                                        onClick={() => { setSelectedAssessment(assessment); setShowUpdateModal(true); }}
                                                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <SquarePen size={16} />
                                                    </button>
                                                </PermissionGate>

                                                <PermissionGate permission="ASSESSMENT_DELETE">
                                                    <button
                                                        onClick={() => { setSelectedAssessment(assessment); setShowDeleteDialog(true); }}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </PermissionGate>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                        No assessment types found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {tableData && tableData.totalPages > 0 && (
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{page * size + 1}</span> to{' '}
                            <span className="font-medium">
                                {Math.min((page + 1) * size, tableData.totalElements)}
                            </span>{' '}
                            of <span className="font-medium">{tableData.totalElements}</span> results
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={size}
                                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                                className="border rounded px-2 py-1 text-sm bg-white outline-none"
                            >
                                <option value={5}>5 / page</option>
                                <option value={10}>10 / page</option>
                                <option value={20}>20 / page</option>
                            </select>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= tableData.totalPages - 1}
                                    className="p-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50 transition"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateAssessmentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
            />

            <UpdateAssessmentModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                assessment={selectedAssessment}
                onSubmit={(id, data) => updateMutation.mutate({ id, data })}
                isPending={updateMutation.isPending}
            />

            <ViewAssessmentModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                assessment={selectedAssessment}
            />

            <DeleteAssessmentDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                assessment={selectedAssessment}
                onConfirm={() => selectedAssessment && deleteMutation.mutate(selectedAssessment.id)}
                isPending={deleteMutation.isPending}
            />

            <ImportAssessmentDialog
                isOpen={showImportDialog}
                onClose={() => {
                    setShowImportDialog(false);
                    importMutation.reset();
                }}
                onImport={(file) => importMutation.mutate(file)}
                isPending={importMutation.isPending}
                importResult={importMutation.data as ImportResult ?? null}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['assessments'] })}
            />

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />
        </div>
    );
};
