import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Download,
    Plus,
    Upload
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, SortingState } from "@tanstack/react-table";

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

import { DataTable } from '@/components/data_table/DataTable';
import { getColumns } from './columns';
import { Button } from "@/components/ui/button";

export const AssessmentTable: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ========================================
    // State: Table Configuration
    // ========================================
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    //const [sorting] = useState([{ id: 'createdAt', desc: true }]);
    const [sortingClient, setSortingClient] = useState<SortingState>([]);

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
    const { data: tableData, isLoading, isFetching } = useQuery({
        queryKey: ['assessments', page, size, keyword],
        queryFn: () => assessmentTypeApi.getAll({
            page,
            size,
            // sortBy: sorting[0]?.id || 'createdAt',
            // sortDir: sorting[0]?.desc ? 'desc' : 'asc',
            keyword: keyword || undefined
        })
    });

    // Safe table data with defaults (similar to ModulesTable pattern)
    const safeTableData = useMemo(() => ({
        items: tableData?.content ?? [],
        page: tableData?.number ?? page,
        pageSize: tableData?.size ?? size,
        totalPages: tableData?.totalPages ?? 0,
        totalElements: tableData?.totalElements ?? 0,
    }), [tableData, page, size]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete assessment type" });
        }
    });

    const importMutation = useMutation({
        mutationFn: assessmentTypeApi.importAssessment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
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
    // Columns & Actions
    // ========================================
    const handleView = useCallback((row: AssessmentType) => {
        setSelectedAssessment(row);
        setShowViewModal(true);
    }, []);

    const handleEdit = useCallback((row: AssessmentType) => {
        setSelectedAssessment(row);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = useCallback((row: AssessmentType) => {
        setSelectedAssessment(row);
        setShowDeleteDialog(true);
    }, []);

    const columns = useMemo(() => getColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
    }), [handleView, handleEdit, handleDelete]);

    const headerActions = (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportModal(true)}
                className="h-8"
            >
                <Download className="mr-2 h-4 w-4" />
                Export
            </Button>

            <PermissionGate permission="ASSESSMENT_CREATE">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImportDialog(true)}
                    className="h-8"
                >
                    <Upload className="mr-2 h-4 w-4" />
                    Import
                </Button>
            </PermissionGate>

            <PermissionGate permission="ASSESSMENT_CREATE">
                <Button
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                </Button>
            </PermissionGate>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <DataTable<AssessmentType, unknown>
                columns={columns as ColumnDef<AssessmentType, unknown>[]}
                data={safeTableData.items}
                isLoading={isLoading}
                isFetching={isFetching}

                // Pagination
                manualPagination
                pageIndex={safeTableData.page}
                pageSize={safeTableData.pageSize}
                totalPage={safeTableData.totalPages}
                onPageChange={setPage}
                onPageSizeChange={setSize}

                // Search
                isSearch
                manualSearch
                searchPlaceholder="name"
                onSearchChange={setKeyword}

                // Actions
                headerActions={headerActions}

                // Sorting
                sorting={sortingClient}
                onSortingChange={setSortingClient}
                manualSorting={false}


            />

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
