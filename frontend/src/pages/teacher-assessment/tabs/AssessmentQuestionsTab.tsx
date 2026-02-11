import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FileQuestion, CheckCircle2, XCircle, Save, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { assessmentQuestionApi } from '@/api/assessmentQuestionApi';
import { useToast } from '@/hooks/use-toast';
import { AddQuestionModal } from './AddQuestionModal';

interface AssessmentQuestionsTabProps {
    assessmentId?: number;
}

export function AssessmentQuestionsTab({ assessmentId }: AssessmentQuestionsTabProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch assessment questions
    const { data: assessmentQuestions = [], isLoading, error: fetchError } = useQuery({
        queryKey: ['assessmentQuestions', assessmentId],
        queryFn: () => assessmentQuestionApi.getByAssessmentId(assessmentId!),
        enabled: !!assessmentId,
    });

    // Create assessment question mutation
    const createMutation = useMutation({
        mutationFn: (data: { questionId: string; score: number; orderIndex: number }) =>
            assessmentQuestionApi.create({
                assessmentId: assessmentId!,
                questionId: data.questionId,
                score: data.score,
                orderIndex: data.orderIndex,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessmentQuestions', assessmentId] });
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
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
        const startOrderIndex = assessmentQuestions.length > 0
            ? Math.max(...assessmentQuestions.map(aq => aq.orderIndex)) + 1
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
            } catch (error: any) {
                failCount++;
                console.error('Failed to add question:', error);
                const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error';
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

    // Calculate statistics
    const totalScore = assessmentQuestions.reduce((sum, aq) => sum + aq.score, 0);
    const questionsWithoutCorrectAnswer = assessmentQuestions.filter(
        aq => !aq.question.options.some(opt => opt.correct)
    ).length;
    const existingQuestionIds = assessmentQuestions.map(aq => aq.question.id);

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
                        {(fetchError as any)?.response?.data?.message || (fetchError as Error)?.message || 'Unable to fetch assessment questions'}
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
                            <p className="text-2xl font-bold text-gray-900 mt-1">{assessmentQuestions.length}</p>
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
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Incomplete</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {questionsWithoutCorrectAnswer}
                            </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {assessmentQuestions.length === 0 ? (
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
                    {assessmentQuestions.map((assessmentQuestion, index) => {
                        const hasCorrectAnswer = assessmentQuestion.question.options.some(opt => opt.correct);

                        return (
                            <div
                                key={assessmentQuestion.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <p className="text-sm text-gray-900 font-medium">
                                                {assessmentQuestion.question.content}
                                            </p>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {hasCorrectAnswer ? (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-gray-600">
                                            <span className="px-2 py-1 rounded-full bg-gray-100">
                                                {assessmentQuestion.question.category.name}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                {assessmentQuestion.question.questionType}
                                            </span>
                                            <span className="font-medium text-green-700">
                                                {assessmentQuestion.score} points
                                            </span>
                                            {!hasCorrectAnswer && (
                                                <span className="text-red-600">No correct answer set</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-shrink-0">
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
