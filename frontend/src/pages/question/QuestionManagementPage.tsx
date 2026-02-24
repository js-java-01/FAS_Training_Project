import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, SquarePen, Trash2, Search, Filter, LayoutGrid, List, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PermissionGate } from '@/components/PermissionGate';
import { useToast } from '@/hooks/use-toast';
import { questionApi } from '@/api/questionApi';
import { questionCategoryApi } from '@/api/questionCategoryApi';
import type { Question } from '@/types/question';
import type { QuestionCategory } from '@/types/questionCategory';
import { Badge } from '@/components/ui/badge';
import ActionBtn from '@/components/data_table/ActionBtn';

export default function QuestionManagementPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [categorySearch, setCategorySearch] = useState('');
    const [questionSearch, setQuestionSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryPage, setCategoryPage] = useState(1);
    const [pageSize] = useState(10);
    const [categoryPageSize] = useState(8);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Fetch categories
    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getAll()
    });

    // Fetch questions
    const { data: allQuestions = [], isLoading: questionsLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: () => questionApi.getAll()
    });

    // Filter categories by search
    const filteredCategories = useMemo(() => {
        if (!categorySearch) return categories;
        return categories.filter((c: QuestionCategory) =>
            c.name.toLowerCase().includes(categorySearch.toLowerCase())
        );
    }, [categories, categorySearch]);

    // Pagination for categories
    const totalCategoryPages = Math.ceil(filteredCategories.length / categoryPageSize);
    const safeCategoryPage = Math.min(categoryPage, Math.max(1, totalCategoryPages));

    const paginatedCategories = useMemo(() => {
        const startIndex = (safeCategoryPage - 1) * categoryPageSize;
        const endIndex = startIndex + categoryPageSize;
        return filteredCategories.slice(startIndex, endIndex);
    }, [filteredCategories, safeCategoryPage, categoryPageSize]);

    // Filter questions by selected category and search
    const filteredQuestions = useMemo(() => {
        let filtered = allQuestions;

        // Filter by category
        if (selectedCategoryId) {
            filtered = filtered.filter(q => q.category?.id === selectedCategoryId);
        }

        // Filter by search
        if (questionSearch) {
            filtered = filtered.filter(q =>
                q.content.toLowerCase().includes(questionSearch.toLowerCase()) ||
                q.category?.name.toLowerCase().includes(questionSearch.toLowerCase())
            );
        }

        return filtered;
    }, [allQuestions, selectedCategoryId, questionSearch]);

    // Pagination
    const totalPages = Math.ceil(filteredQuestions.length / pageSize);

    // Ensure current page is within bounds
    const safePage = Math.min(currentPage, Math.max(1, totalPages));

    const paginatedQuestions = useMemo(() => {
        const startIndex = (safePage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredQuestions.slice(startIndex, endIndex);
    }, [filteredQuestions, safePage, pageSize]);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: questionApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
            toast({ variant: "success", title: "Success", description: "Question deleted successfully" });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete question" });
        }
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteMutation.mutate(id);
        }
    };

    const getQuestionTypeBadge = (type: string) => {
        const badgeClasses: Record<string, string> = {
            SINGLE_CHOICE: 'bg-blue-50 text-blue-600 border-blue-200',
            MULTIPLE_CHOICE: 'bg-purple-50 text-purple-600 border-purple-200',
            TRUE_FALSE: 'bg-green-50 text-green-600 border-green-200',
            ESSAY: 'bg-orange-50 text-orange-600 border-orange-200'
        };

        const labels: Record<string, string> = {
            SINGLE_CHOICE: 'Single Choice',
            MULTIPLE_CHOICE: 'Multiple Choice',
            TRUE_FALSE: 'True/False',
            ESSAY: 'Essay'
        };

        return (
            <Badge variant="outline" className={badgeClasses[type] || ''}>
                {labels[type] || type}
            </Badge>
        );
    };

    return (
        <MainLayout pathName={{ questions: "Question Bank" }}>
            <div className="h-full flex flex-col overflow-hidden gap-6 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <MainHeader
                        title="Question Bank"
                        description="Manage your assessment questions"
                    />
                    <PermissionGate permission="QUESTION_CREATE">
                        <Button onClick={() => navigate('/questions/create')}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Question
                        </Button>
                    </PermissionGate>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Total Questions</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{allQuestions.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Active</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                            {allQuestions.filter(q => q.isActive).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Categories</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{categories.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border">
                        <p className="text-sm text-gray-600">Filtered</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredQuestions.length}</p>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-64 bg-white rounded-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                            <p className="text-xs text-gray-600 mt-1">
                                {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
                            </p>
                            {/* Category Search */}
                            <div className="pt-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>



                        <div className="flex-1 overflow-auto p-4">
                            {categoriesLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedCategoryId('')}
                                        className={`w-full text-left px-3 py-2 rounded-md transition-all ${!selectedCategoryId
                                            ? 'bg-blue-600 text-white'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">All Questions</span>
                                            <span className={`text-xs ${!selectedCategoryId ? 'text-white' : 'text-gray-600'}`}>
                                                {allQuestions.length}
                                            </span>
                                        </div>
                                    </button>
                                    {paginatedCategories.map((category: QuestionCategory) => {
                                        const count = allQuestions.filter(q => q.category?.id === category.id).length;
                                        const isSelected = selectedCategoryId === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategoryId(category.id)}
                                                className={`w-full text-left px-3 py-2 rounded-md transition-all ${isSelected
                                                    ? 'bg-blue-600 text-white'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate text-sm font-medium">{category.name}</span>
                                                    <span className={`text-xs ml-2 ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                                        {count}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Category Pagination */}
                        {filteredCategories.length > 0 && totalCategoryPages > 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Showing {((safeCategoryPage - 1) * categoryPageSize) + 1}-{Math.min(safeCategoryPage * categoryPageSize, filteredCategories.length)} of {filteredCategories.length}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                                            disabled={safeCategoryPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCategoryPage(p => Math.min(totalCategoryPages, p + 1))}
                                            disabled={safeCategoryPage === totalCategoryPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Questions */}
                    <div className="flex-1 bg-white rounded-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {selectedCategoryId
                                            ? categories.find((c: QuestionCategory) => c.id === selectedCategoryId)?.name
                                            : 'All Questions'}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="h-9"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-9"
                                    >
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Question Search */}
                            <div className="relative mt-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={questionSearch}
                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {questionsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-500 mt-3 text-sm">Loading...</p>
                                    </div>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600 font-medium">No questions found</p>
                                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
                                    : "space-y-4"
                                }>
                                    {paginatedQuestions.map((question: Question) => (
                                        <div
                                            key={question.id}
                                            className="border rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        {getQuestionTypeBadge(question.questionType)}
                                                        <Badge
                                                            variant="outline"
                                                            className={question.isActive
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : 'bg-gray-50 text-gray-600 border-gray-200'}
                                                        >
                                                            {question.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-purple-50 text-purple-600 border-purple-200"
                                                        >
                                                            {question.category?.name || 'Uncategorized'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-900 font-medium mb-2">
                                                        {question.content}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        <span>{question.options.length} options</span>
                                                        <span>·</span>
                                                        <span className="text-green-600">
                                                            {question.options.filter(o => o.isCorrect).length} correct
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <ActionBtn
                                                        icon={<Eye size={16} />}
                                                        onClick={() => {/* TODO: View modal */ }}
                                                        tooltipText="View Details"
                                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                                    />
                                                    <PermissionGate permission="QUESTION_UPDATE">
                                                        <ActionBtn
                                                            icon={<SquarePen size={16} />}
                                                            onClick={() => navigate(`/questions/${question.id}/edit`)}
                                                            tooltipText="Edit Question"
                                                            className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                                                        />
                                                    </PermissionGate>
                                                    <PermissionGate permission="QUESTION_DELETE">
                                                        <ActionBtn
                                                            icon={<Trash2 size={16} />}
                                                            onClick={() => handleDelete(question.id)}
                                                            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                                            tooltipText="Delete Question"
                                                        />
                                                    </PermissionGate>
                                                </div>
                                            </div>

                                            {/* Options Preview */}
                                            <div className="mt-3 pt-3 border-t">
                                                <p className="text-xs font-semibold text-gray-600 mb-2">Options</p>
                                                <div className="space-y-1.5">
                                                    {question.options
                                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                                        .map((option, idx) => (
                                                            <div
                                                                key={option.id}
                                                                className={`text-sm px-3 py-2 rounded-md border ${option.isCorrect
                                                                    ? 'bg-green-50 text-green-900 border-green-300 font-medium'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium ${option.isCorrect
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-gray-300 text-gray-600'
                                                                        }`}>
                                                                        {String.fromCharCode(65 + idx)}
                                                                    </span>
                                                                    <span>{option.content}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {filteredQuestions.length > 0 && totalPages > 1 && (
                            <div className="p-4 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600">
                                        Showing {((safePage - 1) * pageSize) + 1}-{Math.min(safePage * pageSize, filteredQuestions.length)} of {filteredQuestions.length}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safePage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    return page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - safePage) <= 1;
                                                })
                                                .map((page, index, array) => {
                                                    const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                                                    return (
                                                        <div key={page} className="flex items-center">
                                                            {showEllipsis && <span className="px-1 text-gray-400">...</span>}
                                                            <Button
                                                                variant={safePage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(page)}
                                                                className="min-w-[2rem]"
                                                            >
                                                                {page}
                                                            </Button>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safePage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
