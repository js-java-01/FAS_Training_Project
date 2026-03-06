import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileQuestion, CheckCircle2, XCircle, Save, Trash2, Loader2, ChevronDown, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AssessmentQuestion } from '@/types/features/assessment/assessment-question';
import type { AssessmentQuestionOption } from '@/types/features/assessment/assessment-question-options';

import { AddQuestionModal } from './AddQuestionModal';
import { useToast } from '@/hooks/useToast';
import { assessmentQuestionApi, assessmentQuestionOptionApi, questionCategoryApi } from '@/api';
import { questionApi } from '@/api/questionApi';

// ─── Assessment Options Panel ────────────────────────────────────────────────
function AssessmentOptionsPanel({ assessmentQuestionId }: { assessmentQuestionId: string }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ content: '', correct: false });
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editOptionData, setEditOptionData] = useState({ content: '', correct: false });

    const { data: optionsPage, isLoading: optionsLoading } = useQuery({
        queryKey: ['assessmentQuestionOptions', assessmentQuestionId],
        queryFn: () => assessmentQuestionOptionApi.getPage(
            { page: 0, size: 100 },
            undefined,
            { assessmentQuestionId }
        ),
    });
    const options: AssessmentQuestionOption[] = optionsPage?.content ?? [];

    const createOptionMutation = useMutation({
        mutationFn: (data: AssessmentQuestionOption) => assessmentQuestionOptionApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestionOptions', assessmentQuestionId] });
            setShowForm(false);
            setFormData({ content: '', correct: false });
            toast({ variant: 'success', title: 'Option added' });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to add option' });
        },
    });

    const deleteOptionMutation = useMutation({
        mutationFn: (id: string) => assessmentQuestionOptionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestionOptions', assessmentQuestionId] });
            toast({ variant: 'success', title: 'Option deleted' });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to delete option' });
        },
    });

    const updateOptionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: AssessmentQuestionOption }) =>
            assessmentQuestionOptionApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestionOptions', assessmentQuestionId] });
            setEditingOptionId(null);
            toast({ variant: 'success', title: 'Option updated' });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to update option' });
        },
    });

    const handleEditOption = (opt: AssessmentQuestionOption) => {
        setEditingOptionId(opt.id);
        setEditOptionData({ content: opt.content, correct: opt.correct });
    };

    const handleSaveOption = (opt: AssessmentQuestionOption) => {
        if (!editOptionData.content.trim()) return;
        updateOptionMutation.mutate({
            id: opt.id,
            data: { ...opt, content: editOptionData.content, correct: editOptionData.correct },
        });
    };

    const handleSubmit = () => {
        if (!formData.content.trim()) return;
        createOptionMutation.mutate({
            id: '',
            content: formData.content,
            correct: formData.correct,
            orderIndex: options.length,
            assessmentQuestionId,
        });
    };

    return (
        <div className="mt-3 pt-3 border-t border-dashed border-blue-200">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Assessment Options</p>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-blue-600 hover:text-blue-700 px-2"
                    onClick={() => setShowForm(v => !v)}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Option
                </Button>
            </div>

            {optionsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-blue-500 my-1" />
            ) : (
                <div className="space-y-1.5">
                    {options.length === 0 && !showForm && (
                        <p className="text-xs text-gray-400 italic">No assessment-specific options yet</p>
                    )}
                    {[...options]
                        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                        .map((opt, idx) => (
                            <div
                                key={opt.id}
                                className={`px-3 py-2 rounded-lg text-sm border ${editingOptionId === opt.id
                                        ? 'bg-yellow-50 border-yellow-300'
                                        : opt.correct
                                            ? 'bg-green-50 border-green-200 text-green-800'
                                            : 'bg-white border-gray-200 text-gray-700'
                                    }`}
                            >
                                {editingOptionId === opt.id ? (
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            value={editOptionData.content}
                                            onChange={e => setEditOptionData(prev => ({ ...prev, content: e.target.value }))}
                                            className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                                        />
                                        <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={editOptionData.correct}
                                                onChange={e => setEditOptionData(prev => ({ ...prev, correct: e.target.checked }))}
                                                className="w-3.5 h-3.5 accent-green-500"
                                            />
                                            Mark as correct
                                        </label>
                                        <div className="flex gap-1.5">
                                            <Button
                                                size="sm"
                                                className="bg-yellow-500 hover:bg-yellow-600 h-6 text-xs px-2"
                                                onClick={() => handleSaveOption(opt)}
                                                disabled={!editOptionData.content.trim() || updateOptionMutation.isPending}
                                            >
                                                {updateOptionMutation.isPending
                                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                                    : 'Save'}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 text-xs px-2"
                                                onClick={() => setEditingOptionId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${opt.correct ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="flex-1">{opt.content}</span>
                                        {opt.correct && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-yellow-500 hover:text-yellow-600"
                                            onClick={() => handleEditOption(opt)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-red-400 hover:text-red-600"
                                            onClick={() => deleteOptionMutation.mutate(opt.id)}
                                            disabled={deleteOptionMutation.isPending}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}

            {showForm && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                    <input
                        type="text"
                        placeholder="Option content..."
                        value={formData.content}
                        onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />
                    <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={formData.correct}
                            onChange={e => setFormData(prev => ({ ...prev, correct: e.target.checked }))}
                            className="w-4 h-4 accent-green-500"
                        />
                        Mark as correct answer
                    </label>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                            onClick={handleSubmit}
                            disabled={!formData.content.trim() || createOptionMutation.isPending}
                        >
                            {createOptionMutation.isPending
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : 'Save'}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => { setShowForm(false); setFormData({ content: '', correct: false }); }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

interface AssessmentQuestionsTabProps {
    assessmentId?: string;
}

export function AssessmentQuestionsTab({ assessmentId }: AssessmentQuestionsTabProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
    const [editQuestionData, setEditQuestionData] = useState({ score: 0, orderIndex: 0 });

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Fetch assessment questions
    const { data: assessmentQuestions = [], isLoading, error: fetchError } = useQuery<AssessmentQuestion[]>({
        queryKey: ['assessmentQuestions', assessmentId],
        queryFn: () => assessmentQuestionApi.getByAssessmentId(assessmentId!),
        enabled: !!assessmentId,
    });

    // Fetch all questions to enrich the flat assessment question data
    const { data: allQuestions = [] } = useQuery({
        queryKey: ['questions-all'],
        queryFn: () => questionApi.getAllContent(),
        enabled: !!assessmentId,
    });

    // Fetch all categories for category name lookup
    const { data: categoriesResponse } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getPage({ page: 0, size: 1000 }),
        enabled: !!assessmentId,
    });

    const categoryMap = useMemo(() => {
        const map = new Map<string, string>();
        (categoriesResponse?.content ?? []).forEach(cat => {
            if (cat.id) map.set(cat.id, cat.name);
        });
        return map;
    }, [categoriesResponse]);

    // Merge flat assessment questions with full question data
    const enrichedQuestions = useMemo(() => {
        const questionMap = new Map(allQuestions.map(q => [q.id, q]));
        const raw = Array.isArray(assessmentQuestions) ? assessmentQuestions : [];
        return raw.map(aq => {
            const q = questionMap.get(aq.questionId);
            return {
                ...aq,
                question: q ? {
                    id: q.id,
                    content: q.content,
                    questionType: q.questionType,
                    category: { name: categoryMap.get(q.categoryId) ?? '' },
                    options: q.options,
                } : undefined,
            };
        });
    }, [assessmentQuestions, allQuestions, categoryMap]);

    // Create assessment question mutation
    const createMutation = useMutation({
        mutationFn: (data: { questionId: string; score: number; orderIndex: number }) => {
            console.log("🔵 Creating assessment question with data:", data);
            return assessmentQuestionApi.create({
                assessmentId: assessmentId!,
                questionId: data.questionId,
                score: data.score,
                orderIndex: data.orderIndex,
            });
        },
        onSuccess: (response) => {
            console.log("✅ Question added successfully:", response);
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestions', assessmentId] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            console.error("❌ Failed to add question:", error);
            console.error("❌ Error response:", error.response);
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to add question' });
        },
    });

    // Delete assessment question mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => assessmentQuestionApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestions', assessmentId] });
            toast({ variant: 'success', title: 'Success', description: 'Question removed from assessment' });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to remove question' });
        },
    });

    // Update assessment question mutation
    const updateQuestionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { score: number; orderIndex: number } }) =>
            assessmentQuestionApi.update(id, data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestions', assessmentId] });
            setEditingQuestionId(null);
            toast({ variant: 'success', title: 'Question updated' });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({ variant: 'destructive', title: 'Error', description: error.response?.data?.message || 'Failed to update question' });
        },
    });

    const handleEditQuestion = (aq: { id: string; score: number; orderIndex: number }) => {
        setEditingQuestionId(aq.id);
        setEditQuestionData({ score: aq.score, orderIndex: aq.orderIndex });
    };

    // Show message if not in edit mode (no assessmentId)
    if (!assessmentId) {
        return (
            <div className="max-w-4xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <Save className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Assessment First</h3>
                    <p className="text-sm text-gray-600">
                        You need to create and save the assessment before you can add questions to it.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                        Please fill out the basic information and click "Create Assessment" to continue.
                    </p>
                </div>
            </div>
        );
    }

    const handleAddQuestions = async (selected: { questionId: string; score: number }[]) => {
        const startOrderIndex = enrichedQuestions.length > 0
            ? Math.max(...enrichedQuestions.map(aq => aq.orderIndex)) + 1
            : 0;

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < selected.length; i++) {
            const item = selected[i];
            try {
                await createMutation.mutateAsync({
                    questionId: item.questionId,
                    score: item.score,
                    orderIndex: startOrderIndex + i,
                });
                successCount++;
            } catch (error: unknown) {
                failCount++;
                console.error('Failed to add question:', error);
                const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
                    || (error as Error)?.message
                    || 'Unknown error';
                toast({
                    variant: 'destructive',
                    title: 'Failed to add question',
                    description: `${errorMessage}`
                });
            }
        }

        if (successCount > 0) {
            toast({
                variant: 'success',
                title: 'Success',
                description: `${successCount} question(s) added successfully${failCount > 0 ? `, ${failCount} failed` : ''}`
            });
        }
    };

    const handleDeleteQuestion = (assessmentQuestionId: string) => {
        if (confirm('Are you sure you want to remove this question from the assessment?')) {
            deleteMutation.mutate(assessmentQuestionId);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="max-w-4xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Questions</h3>
                    <p className="text-sm text-gray-600">
                        {(fetchError as { response?: { data?: { message?: string } } })?.response?.data?.message || (fetchError as Error)?.message || 'Unable to fetch assessment questions'}
                    </p>
                    <Button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['assessmentQuestions', assessmentId] })}
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate statistics using enriched data
    const totalScore = enrichedQuestions.reduce((sum, aq) => sum + aq.score, 0);
    const questionsWithoutCorrectAnswer = enrichedQuestions.filter(
        aq => !aq.question?.options?.some((opt: { correct: boolean }) => opt.correct)
    ).length;
    const existingQuestionIds = enrichedQuestions.map(aq => aq.question?.id).filter(Boolean) as string[];

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Assessment Questions</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage questions for this assessment</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={createMutation.isPending}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Questions Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Questions</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{enrichedQuestions.length}</p>
                        </div>
                        <FileQuestion className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Points</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{totalScore}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {enrichedQuestions.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <FileQuestion className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No questions added yet</h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Start building your assessment by adding questions from your question bank.
                    </p>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Question
                    </Button>
                </div>
            ) : (
                /* Questions List */
                <div className="space-y-3">
                    {enrichedQuestions.map((assessmentQuestion, index) => {
                        const hasCorrectAnswer = assessmentQuestion.question?.options?.some((opt: { correct: boolean }) => opt.correct) ?? false;
                        const isExpanded = expandedIds.has(assessmentQuestion.id);
                        const options = assessmentQuestion.question?.options ?? [];

                        return (
                            <div
                                key={assessmentQuestion.id}
                                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4 p-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <p className="text-sm text-gray-900 font-medium">
                                                {assessmentQuestion.question?.content}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <span className="px-2 py-1 rounded-full bg-gray-100">
                                                {assessmentQuestion.question?.category?.name}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {assessmentQuestion.question?.questionType}
                                            </span>
                                            {editingQuestionId === assessmentQuestion.id ? (
                                                <div className="flex items-center gap-3">
                                                    <label className="flex items-center gap-1">
                                                        <span className="text-gray-500">Score:</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={editQuestionData.score}
                                                            onChange={e => setEditQuestionData(prev => ({ ...prev, score: Number(e.target.value) }))}
                                                            className="w-16 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                        />
                                                    </label>
                                                    <label className="flex items-center gap-1">
                                                        <span className="text-gray-500">Order:</span>
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            value={editQuestionData.orderIndex}
                                                            onChange={e => setEditQuestionData(prev => ({ ...prev, orderIndex: Number(e.target.value) }))}
                                                            className="w-16 border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                                        />
                                                    </label>
                                                    <Button
                                                        size="sm"
                                                        className="bg-yellow-500 hover:bg-yellow-600 h-6 text-xs px-2"
                                                        onClick={() => updateQuestionMutation.mutate({ id: assessmentQuestion.id, data: editQuestionData })}
                                                        disabled={updateQuestionMutation.isPending}
                                                    >
                                                        {updateQuestionMutation.isPending
                                                            ? <Loader2 className="h-3 w-3 animate-spin" />
                                                            : 'Save'}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="font-medium text-green-700">
                                                    {assessmentQuestion.score} points
                                                </span>
                                            )}
                                            {!hasCorrectAnswer && (
                                                <span className="text-red-600">No correct answer set</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-yellow-500 hover:text-yellow-600"
                                            onClick={() => {
                                                if (editingQuestionId === assessmentQuestion.id) {
                                                    setEditingQuestionId(null);
                                                } else {
                                                    handleEditQuestion(assessmentQuestion);
                                                }
                                            }}
                                        >
                                            {editingQuestionId === assessmentQuestion.id
                                                ? <X className="h-4 w-4" />
                                                : <Pencil className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => toggleExpand(assessmentQuestion.id)}
                                        >
                                            <ChevronDown
                                                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                            />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteQuestion(assessmentQuestion.id)}
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Expandable Options */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                                        <AssessmentOptionsPanel assessmentQuestionId={assessmentQuestion.id} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Question Modal */}
            <AddQuestionModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddQuestions}
                existingQuestionIds={existingQuestionIds}
            />
        </div>
    );
}
