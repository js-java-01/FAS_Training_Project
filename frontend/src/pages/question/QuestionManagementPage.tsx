import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, SquarePen, Trash2 } from 'lucide-react';
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

    // Filter questions by selected category
    const filteredQuestions = useMemo(() => {
        if (!selectedCategoryId) return allQuestions;
        return allQuestions.filter(q => q.category.id === selectedCategoryId);
    }, [allQuestions, selectedCategoryId]);

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
        if (type === 'SINGLE_CHOICE') {
            return <Badge className="bg-blue-50 text-blue-600 border-blue-100">Single Choice</Badge>;
        }
        return <Badge className="bg-purple-50 text-purple-600 border-purple-100">Multiple Choice</Badge>;
    };

    return (
        <MainLayout pathName={{ questions: "Question Management" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title="Question Management"
                    description="Manage questions by category"
                />

                <div className="flex gap-2 justify-end">
                    <PermissionGate permission="QUESTION_CREATE">
                        <Button
                            size="sm"
                            onClick={() => navigate('/questions/create')}
                            className="h-8 bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Question
                        </Button>
                    </PermissionGate>
                </div>

                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Left Sidebar - Categories */}
                    <div className="w-64 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                            <p className="text-xs text-gray-500 mt-1">Select a category</p>
                        </div>
                        <div className="flex-1 overflow-auto">
                            {categoriesLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : (
                                <div className="p-2">
                                    <button
                                        onClick={() => setSelectedCategoryId('')}
                                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${!selectedCategoryId
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>All Questions</span>
                                            <Badge variant="outline" className="text-xs">
                                                {allQuestions.length}
                                            </Badge>
                                        </div>
                                    </button>
                                    {categories.map((category: QuestionCategory) => {
                                        const count = allQuestions.filter(q => q.category.id === category.id).length;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategoryId(category.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors ${selectedCategoryId === category.id
                                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate">{category.name}</span>
                                                    <Badge variant="outline" className="text-xs">
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
                    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">
                                {selectedCategoryId
                                    ? categories.find((c: QuestionCategory) => c.id === selectedCategoryId)?.name
                                    : 'All Questions'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-4">
                            {questionsLoading ? (
                                <div className="text-center text-gray-500 py-8">Loading questions...</div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    No questions found in this category
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredQuestions.map((question: Question) => (
                                        <div
                                            key={question.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getQuestionTypeBadge(question.questionType)}
                                                        <Badge
                                                            variant="outline"
                                                            className={question.isActive
                                                                ? 'bg-green-50 text-green-600 border-green-200'
                                                                : 'bg-gray-50 text-gray-600 border-gray-200'}
                                                        >
                                                            {question.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-900 font-medium mb-2 line-clamp-2">
                                                        {question.content}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>Category: {question.category.name}</span>
                                                        <span>Options: {question.options.length}</span>
                                                        <span>
                                                            Correct: {question.options.filter(o => o.isCorrect).length}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <ActionBtn
                                                        icon={<Eye size={16} />}
                                                        onClick={() => {/* TODO: View modal */ }}
                                                        tooltipText="View"
                                                    />
                                                    <PermissionGate permission="QUESTION_UPDATE">
                                                        <ActionBtn
                                                            icon={<SquarePen size={16} />}
                                                            onClick={() => {/* TODO: Edit page */ }}
                                                            tooltipText="Edit"
                                                        />
                                                    </PermissionGate>
                                                    <PermissionGate permission="QUESTION_DELETE">
                                                        <ActionBtn
                                                            icon={<Trash2 size={16} />}
                                                            onClick={() => handleDelete(question.id)}
                                                            className="hover:text-red-500 hover:border-red-500"
                                                            tooltipText="Delete"
                                                        />
                                                    </PermissionGate>
                                                </div>
                                            </div>

                                            {/* Options Preview */}
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <p className="text-xs font-medium text-gray-600 mb-2">Options:</p>
                                                <div className="space-y-1">
                                                    {question.options
                                                        .sort((a, b) => a.orderIndex - b.orderIndex)
                                                        .map((option) => (
                                                            <div
                                                                key={option.id}
                                                                className={`text-xs px-2 py-1 rounded ${option.isCorrect
                                                                    ? 'bg-green-50 text-green-700 font-medium'
                                                                    : 'bg-gray-50 text-gray-600'
                                                                    }`}
                                                            >
                                                                {option.isCorrect && '✓ '}
                                                                {option.content}
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
