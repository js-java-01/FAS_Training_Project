import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Download,
    Plus,
    Upload
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, SortingState } from "@tanstack/react-table";

import { programmingLanguageApi } from '../../api/service/assessment/programmingLanguageApi';
import { PermissionGate } from '../../components/PermissionGate';

import type { ProgrammingLanguageRequest, ImportResult } from '../../types/feature/assessment/programming-language';
import type { ProgrammingLanguage } from '../../types/feature/assessment/programming-language';

import { CreateLanguageModal } from './CreateLanguageModal';
import { DeleteLanguageDialog } from './DeleteLanguageDialog';
import { ImportLanguageDialog } from './ImportLanguageDialog';
import { UpdateLanguageModal } from './UpdateLanguageModal';
import { ViewLanguageModal } from './ViewLanguageModal';
// import { ExportModal } from './ExportModal';

import { DataTable } from '@/components/data_table/DataTable';
import { getColumns } from './column';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/useToast';

export const ProgrammingLanguageTable: React.FC = () => {
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
    const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage | null>(null);

    // ========================================
    // Data Loading (Queries)
    // ========================================
    const { data: tableData, isLoading, isFetching } = useQuery({
        queryKey: ['programmingLanguages', page, size, keyword],
        queryFn: () => programmingLanguageApi.getAll({
            page,
            size,
            // sortBy: sorting[0]?.id || 'createdAt',
            // sortDir: sorting[0]?.desc ? 'desc' : 'asc',
            search: keyword || undefined
        })
    });

    // Safe table data with defaults
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
        mutationFn: programmingLanguageApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            setShowCreateModal(false);
            toast({ variant: "success", title: "Success", description: "Programming language created successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create programming language" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: ProgrammingLanguageRequest }) =>
            programmingLanguageApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            setShowUpdateModal(false);
            toast({ variant: "success", title: "Success", description: "Programming language updated successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update programming language" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: programmingLanguageApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
            setShowDeleteDialog(false);
            toast({ variant: "success", title: "Success", description: "Programming language deleted successfully" });
        },
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete programming language" });
        }
    });

    const importMutation = useMutation({
        mutationFn: programmingLanguageApi.import,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] });
        },
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
    const handleView = useCallback((row: ProgrammingLanguage) => {
        setSelectedLanguage(row);
        setShowViewModal(true);
    }, []);

    const handleEdit = useCallback((row: ProgrammingLanguage) => {
        setSelectedLanguage(row);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = useCallback((row: ProgrammingLanguage) => {
        setSelectedLanguage(row);
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

            <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
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

            <PermissionGate permission="PROGRAMMING_LANGUAGE_CREATE">
                <Button
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Language
                </Button>
            </PermissionGate>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <DataTable<ProgrammingLanguage, unknown>
                columns={columns as ColumnDef<ProgrammingLanguage, unknown>[]}
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
            <CreateLanguageModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
            />

            <UpdateLanguageModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                language={selectedLanguage}
                onSubmit={(id, data) => updateMutation.mutate({ id, data })}
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
                onConfirm={() => selectedLanguage && deleteMutation.mutate(selectedLanguage.id)}
                isPending={deleteMutation.isPending}
            />

            <ImportLanguageDialog
                isOpen={showImportDialog}
                onClose={() => {
                    setShowImportDialog(false);
                    importMutation.reset();
                }}
                onImport={(file) => importMutation.mutate(file)}
                isPending={importMutation.isPending}
                importResult={importMutation.data as ImportResult ?? null}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ['programmingLanguages'] })}
            />

            {/* <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            /> */}
        </div>
    );
};