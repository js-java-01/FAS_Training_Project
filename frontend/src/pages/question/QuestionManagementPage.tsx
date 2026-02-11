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
    const [pageSize] = useState(10);
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
                    <div>
                        <MainHeader
                            title="Question Bank"
                            description="Create, organize, and manage your assessment questions"
                        />
                    </div>
                    <PermissionGate permission="QUESTION_CREATE">
                        <Button
                            onClick={() => navigate('/questions/create')}
                            size="lg"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Create Question
                        </Button>
                    </PermissionGate>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Total Questions</p>
                                <p className="text-2xl font-bold text-blue-900 mt-1">{allQuestions.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Filter className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Active</p>
                                <p className="text-2xl font-bold text-green-900 mt-1">
                                    {allQuestions.filter(q => q.isActive).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                                ✓
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-600 font-medium">Categories</p>
                                <p className="text-2xl font-bold text-purple-900 mt-1">{categories.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <LayoutGrid className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-600 font-medium">Filtered</p>
                                <p className="text-2xl font-bold text-orange-900 mt-1">{filteredQuestions.length}</p>
                            </div>
                            <div className="h-12 w-12 bg-orange-600 rounded-lg flex items-center justify-center">
                                <Search className="h-6 w-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Filter className="h-5 w-5" />
                                <h3 className="font-bold text-lg">Filter by Category</h3>
                            </div>
                        </div>

                        {/* Category Search */}
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-3">
                            {categoriesLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : (
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setSelectedCategoryId('')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${!selectedCategoryId
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-[1.02]'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">📚 All Questions</span>
                                            <Badge
                                                variant="outline"
                                                className={`text-xs font-semibold ${!selectedCategoryId
                                                    ? 'bg-white/20 text-white border-white/30'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}
                                            >
                                                {allQuestions.length}
                                            </Badge>
                                        </div>
                                    </button>
                                    {filteredCategories.map((category: QuestionCategory) => {
                                        const count = allQuestions.filter(q => q.category?.id === category.id).length;
                                        const isSelected = selectedCategoryId === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategoryId(category.id)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all group ${isSelected
                                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-[1.02]'
                                                    : 'hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                                        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                                        <span className="truncate font-medium">{category.name}</span>
                                                    </div>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs font-semibold ml-2 ${isSelected
                                                            ? 'bg-white/20 text-white border-white/30'
                                                            : 'bg-gray-50 text-gray-700 border-gray-300'
                                                            }`}
                                                    >
                                                        {count}
                                                    </Badge>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Questions */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                        {selectedCategoryId
                                            ? categories.find((c: QuestionCategory) => c.id === selectedCategoryId)?.name
                                            : '📝 All Questions'}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found
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
                            <div className="relative mt-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions by content or category..."
                                    value={questionSearch}
                                    onChange={(e) => setQuestionSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-5">
                            {questionsLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-500 mt-4">Loading questions...</p>
                                    </div>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-12 w-12 text-gray-400" />
                                        </div>
                                        <p className="text-gray-600 font-medium text-lg">No questions found</p>
                                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search query</p>
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
                                            className="group border-2 border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200 bg-white"
                                        >
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {getQuestionTypeBadge(question.questionType)}
                                                        <Badge
                                                            variant="outline"
                                                            className={question.isActive
                                                                ? 'bg-green-100 text-green-700 border-green-300 font-semibold'
                                                                : 'bg-gray-100 text-gray-600 border-gray-300'}
                                                        >
                                                            {question.isActive ? '✓ Active' : '○ Inactive'}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="bg-purple-50 text-purple-600 border-purple-200"
                                                        >
                                                            {question.category?.name || 'Uncategorized'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-base text-gray-900 font-semibold mb-3 leading-relaxed">
                                                        {question.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium">Options:</span> {question.options.length}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-medium text-green-600">✓ Correct:</span>
                                                            <span className="font-bold text-green-600">
                                                                {question.options.filter(o => o.isCorrect).length}
                                                            </span>
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
                                            <div className="mt-4 pt-4 border-t-2 border-gray-100">
                                                <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Answer Options</p>
                                                <div className="space-y-2">
                                                    {question.options
                                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                                        .map((option, idx) => (
                                                            <div
                                                                key={option.id}
                                                                className={`text-sm px-4 py-2.5 rounded-lg border-2 transition-all ${option.isCorrect
                                                                    ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-900 border-green-400 font-bold shadow-sm'
                                                                    : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${option.isCorrect
                                                                        ? 'bg-green-600 text-white'
                                                                        : 'bg-gray-300 text-gray-600'
                                                                        }`}>
                                                                        {String.fromCharCode(65 + idx)}
                                                                    </span>
                                                                    {option.isCorrect && (
                                                                        <span className="bg-green-600 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                                                                            ✓ CORRECT
                                                                        </span>
                                                                    )}
                                                                    <span className={option.isCorrect ? 'font-bold' : ''}>{option.content}</span>
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
                            <div className="p-5 border-t-2 border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700 font-medium">
                                        Showing <span className="font-bold text-blue-600">{((safePage - 1) * pageSize) + 1}</span> to <span className="font-bold text-blue-600">{Math.min(safePage * pageSize, filteredQuestions.length)}</span> of <span className="font-bold text-blue-600">{filteredQuestions.length}</span> questions
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={safePage === 1}
                                            className="font-semibold"
                                        >
                                            ← Previous
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
                                                            {showEllipsis && <span className="px-2 text-gray-400 font-bold">...</span>}
                                                            <Button
                                                                variant={safePage === page ? 'default' : 'outline'}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(page)}
                                                                className={`min-w-[2.5rem] font-semibold ${safePage === page
                                                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md'
                                                                    : ''
                                                                    }`}
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
                                            className="font-semibold"
                                        >
                                            Next →
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
