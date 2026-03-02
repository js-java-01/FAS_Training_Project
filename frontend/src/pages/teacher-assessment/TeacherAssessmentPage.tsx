import { MainLayout } from '@/components/layout/MainLayout';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, Plus, Table as TableIcon } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from '@/components/data_table/DataTable';
import { PermissionGate } from '@/components/PermissionGate';
import { assessmentApi } from '@/api';

import { AssessmentGrid } from './AssessmentGrid';
import { getColumns } from './columns';
import { ViewAssessmentModal } from './ViewAssessmentModal';
import { DeleteAssessmentDialog } from './DeleteAssessmentDialog';
import { useToast } from '@/hooks/useToast';
import type { Assessment, AssessmentStatus } from '@/types';

type ViewMode = 'card' | 'table';

export default function TeacherAssessmentPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // ========================================
    // State: View Mode
    // ========================================
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    // ========================================
    // State: Table Configuration
    // ========================================
    const [keyword, setKeyword] = useState('');
    const [statusFilter] = useState<AssessmentStatus | ''>('');
    const [assessmentTypeFilter] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [sortingClient, setSortingClient] = useState<SortingState>([]);

    // ========================================
    // State: Modal Controls
    // ========================================
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

    // ========================================
    // Data Loading (Queries)
    // ========================================
    const { data: tableData, isLoading, isFetching } = useQuery({
        queryKey: ['assessments', page, size, keyword, statusFilter, assessmentTypeFilter],
        queryFn: () => assessmentApi.getPage({
            page,
            size,
            keyword: keyword || undefined,
            status: statusFilter || undefined,
            assessmentTypeId: assessmentTypeFilter || undefined,
        })
    });

    // Safe table data with defaults
    const safeTableData = useMemo(() => ({
        items: tableData?.items ?? [],
        page: tableData?.number ?? page,
        pageSize: tableData?.size ?? size,
        totalPages: tableData?.totalPages ?? 0,
        totalElements: tableData?.totalElements ?? 0,
    }), [tableData, page, size]);

    // ========================================
    // CRUD Mutations
    // ========================================
    const deleteMutation = useMutation({
        mutationFn: assessmentApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessments'] });
            setShowDeleteDialog(false);
            toast({ variant: "success", title: "Success", description: "Assessment deleted successfully" });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete assessment" });
        }
    });

    // ========================================
    // Actions
    // ========================================
    const handleView = useCallback((assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setShowViewModal(true);
    }, []);

    const handleEdit = useCallback((assessment: Assessment) => {
        navigate(`/teacher-assessment/${assessment.id}/edit`);
    }, [navigate]);

    const handleDelete = useCallback((assessment: Assessment) => {
        setSelectedAssessment(assessment);
        setShowDeleteDialog(true);
    }, []);

    const columns = useMemo(() => getColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
    }), [handleView, handleEdit, handleDelete]);

    const headerActions = (
        <div className="flex gap-2">
            {/* View Mode Toggle - ProTable style */}
            <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
                title={viewMode === 'table' ? 'Switch to card view' : 'Switch to table view'}
            >
                {viewMode === 'table' ? (
                    <LayoutGrid className="h-4 w-4" />
                ) : (
                    <TableIcon className="h-4 w-4" />
                )}
            </Button>

            <PermissionGate permission="ASSESSMENT_CREATE">
                <Button
                    size="sm"
                    onClick={() => navigate('/teacher-assessment/create')}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Assessment
                </Button>
            </PermissionGate>
        </div>
    );

    return (
        <MainLayout pathName={{ assessments: "Teacher Assessment" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                {/* <MainHeader title="Teacher Assessment" description="Teacher assessment" /> */}

                {viewMode === 'table' ? (
                    <DataTable<Assessment, unknown>
                        columns={columns as ColumnDef<Assessment, unknown>[]}
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
                        searchPlaceholder="Enter title"
                        onSearchChange={setKeyword}

                        // Actions
                        headerActions={headerActions}

                        // Sorting
                        sorting={sortingClient}
                        onSortingChange={setSortingClient}
                        manualSorting={false}
                    />
                ) : (
                    <AssessmentGrid
                        assessments={safeTableData.items}
                        isLoading={isLoading}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        headerActions={headerActions}
                        keyword={keyword}
                        onSearchChange={setKeyword}
                        page={safeTableData.page}
                        pageSize={safeTableData.pageSize}
                        totalPages={safeTableData.totalPages}
                        onPageChange={setPage}
                        onPageSizeChange={setSize}
                    />
                )}

                {/* Modals */}
                <ViewAssessmentModal
                    isOpen={showViewModal}
                    onClose={() => setShowViewModal(false)}
                    assessment={selectedAssessment}
                />

                <DeleteAssessmentDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    assessment={selectedAssessment}
                    onConfirm={() => selectedAssessment && deleteMutation.mutate(String(selectedAssessment.id))}
                    isPending={deleteMutation.isPending}
                />
            </div>
        </MainLayout>
    );
}
