import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Plus
} from 'lucide-react';
import React, { useState, useMemo, useCallback } from 'react';
import type { ColumnDef, SortingState } from "@tanstack/react-table";

import { PermissionGate } from '../../components/PermissionGate';


import { CreateQuestionCategoryModal } from './CreateQuestionCategoryModal';
import { DeleteQuestionCategoryDialog } from './DeleteQuestionCategoryDialog';
import { UpdateQuestionCategoryModal } from './UpdateQuestionCategoryModal';
import { ViewQuestionCategoryModal } from './ViewQuestionCategoryModal';

import { DataTable } from '@/components/data_table/DataTable';
import { getColumns } from './columns';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/useToast';
import { questionCategoryApi } from '@/api';
import type { QuestionCategory, QuestionCategoryRequest } from '@/types';

export const QuestionCategoryTable: React.FC = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // ========================================
    // State: Table Configuration
    // ========================================
    const [sortingClient, setSortingClient] = useState<SortingState>([]);
    const [keyword, setKeyword] = useState('');

    // ========================================
    // State: Modal Controls
    // ========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | null>(null);

    // ========================================
    // Data Loading (Queries)
    // ========================================
    const { data: categoriesResponse, isLoading, isFetching } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getPage({ page: 0, size: 1000 })
    });

    const categories = categoriesResponse?.items ?? [];

    // Safe table data with defaults
    const safeTableData = useMemo(() => {
        const items = categories ?? [];
        // Client-side filtering based on keyword
        const filteredItems = keyword
            ? items.filter(category =>
                category.name.toLowerCase().includes(keyword.toLowerCase()) ||
                category.description?.toLowerCase().includes(keyword.toLowerCase())
            )
            : items;
        return { items: filteredItems };
    }, [categories, keyword]);

    // ========================================
    // CRUD Mutations
    // ========================================
    const createMutation = useMutation({
        mutationFn: questionCategoryApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-categories'] });
            setShowCreateModal(false);
            toast({ variant: "success", title: "Success", description: "Question category created successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to create question category" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: QuestionCategoryRequest }) =>
            questionCategoryApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-categories'] });
            setShowUpdateModal(false);
            toast({ variant: "success", title: "Success", description: "Question category updated successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update question category" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: questionCategoryApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-categories'] });
            setShowDeleteDialog(false);
            toast({ variant: "success", title: "Success", description: "Question category deleted successfully" });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete question category" });
        }
    });

    // ========================================
    // Columns & Actions
    // ========================================
    const handleView = useCallback((row: QuestionCategory) => {
        setSelectedCategory(row);
        setShowViewModal(true);
    }, []);

    const handleEdit = useCallback((row: QuestionCategory) => {
        setSelectedCategory(row);
        setShowUpdateModal(true);
    }, []);

    const handleDelete = useCallback((row: QuestionCategory) => {
        setSelectedCategory(row);
        setShowDeleteDialog(true);
    }, []);

    const columns = useMemo(() => getColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete
    }), [handleView, handleEdit, handleDelete]);

    const headerActions = (
        <div className="flex gap-2">
            <PermissionGate permission="QUESTION_CREATE">
                <Button
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </Button>
            </PermissionGate>
        </div>
    );

    return (
        <div className="h-full flex flex-col">
            <DataTable<QuestionCategory, unknown>
                columns={columns as ColumnDef<QuestionCategory, unknown>[]}
                data={safeTableData.items}
                isLoading={isLoading}
                isFetching={isFetching}

                // Actions
                headerActions={headerActions}

                // Sorting
                sorting={sortingClient}
                onSortingChange={setSortingClient}
                manualSorting={false}

                // Search
                isSearch
                manualSearch
                searchPlaceholder="name"
                onSearchChange={setKeyword}
            />

            {/* Modals */}
            <CreateQuestionCategoryModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={(data) => createMutation.mutate(data)}
                isPending={createMutation.isPending}
            />

            <UpdateQuestionCategoryModal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                category={selectedCategory}
                onSubmit={(id, data) => updateMutation.mutate({ id, data })}
                isPending={updateMutation.isPending}
            />

            <ViewQuestionCategoryModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                category={selectedCategory}
            />

            <DeleteQuestionCategoryDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                category={selectedCategory}
                onConfirm={() => selectedCategory && deleteMutation.mutate(selectedCategory.id)}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
};
