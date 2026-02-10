import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionApi } from '@/api/questionApi';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X } from 'lucide-react';
import type { QuestionCreateRequest } from '@/types/question';
import { QuestionFormFields, QuestionOptionsManager } from './components';

export default function EditQuestionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<QuestionCreateRequest>({
        content: '',
        questionType: 'SINGLE_CHOICE',
        isActive: true,
        categoryId: '',
        options: [
            { content: '', isCorrect: false, orderIndex: 0 },
            { content: '', isCorrect: false, orderIndex: 1 },
        ],
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch question data
    const { data: question, isLoading } = useQuery({
        queryKey: ['question', id],
        queryFn: () => questionApi.getById(id!),
        enabled: !!id,
    });

    // Populate form when question data is loaded
    useEffect(() => {
        if (question) {
            setFormData({
                content: question.content,
                questionType: question.questionType,
                isActive: question.isActive,
                categoryId: question.category.id,
                options: question.options.map(opt => ({
                    content: opt.content,
                    isCorrect: opt.isCorrect,
                    orderIndex: opt.orderIndex,
                }))
            });
        }
    }, [question]);

    const updateMutation = useMutation({
        mutationFn: async (data: QuestionCreateRequest) => {
            return await questionApi.update(id!, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
            queryClient.invalidateQueries({ queryKey: ['question', id] });
            toast({
                variant: "success",
                title: "Success",
                description: "Question updated successfully"
            });
            navigate('/questions');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to update question"
            });
        }
    });

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.content.trim()) {
            newErrors.content = 'Question content is required';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Category is required';
        }

        if (formData.options.length < 2) {
            newErrors.options = 'At least 2 options are required';
        }

        const hasCorrectOption = formData.options.some(opt => opt.isCorrect);
        if (!hasCorrectOption) {
            newErrors.correctOption = 'At least one option must be marked as correct';
        }

        formData.options.forEach((option, index) => {
            if (!option.content.trim()) {
                newErrors[`option_${index}`] = `Option ${index + 1} content is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (validate()) {
            updateMutation.mutate(formData);
        } else {
            toast({
                variant: "destructive",
                title: "Validation Error",
                description: "Please fix all errors before submitting"
            });
        }
    };

    const handleCancel = () => {
        navigate('/questions');
    };

    if (isLoading) {
        return (
            <MainLayout pathName={{ questions: "Questions", edit: "Edit Question" }}>
                <div className="h-full flex items-center justify-center">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading question...</span>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!question) {
        return (
            <MainLayout pathName={{ questions: "Questions", edit: "Edit Question" }}>
                <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">Question not found</p>
                        <Button onClick={() => navigate('/questions')}>
                            Back to Questions
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pathName={{ questions: "Questions", edit: "Edit Question" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title="Edit Question"
                    description="Update question details and options"
                />

                <div className="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                    >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {updateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Question
                            </>
                        )}
                    </Button>
                </div>

                <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">Question Details</h3>
                        {Object.keys(errors).length > 0 && (
                            <p className="text-xs text-red-500 mt-1">
                                Please fix the errors below
                            </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        <div className="max-w-4xl space-y-6">
                            <QuestionFormFields
                                data={formData}
                                onChange={setFormData}
                                errors={errors}
                            />

                            <QuestionOptionsManager
                                data={formData}
                                onChange={setFormData}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
