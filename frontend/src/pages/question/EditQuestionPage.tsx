import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { questionApi } from '@/api/questionApi';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
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
            <MainLayout pathName={{ questions: "Question Bank", edit: "Edit Question" }}>
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium text-lg">Loading question...</p>
                        <p className="text-gray-400 text-sm mt-2">Please wait while we fetch the details</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!question) {
        return (
            <MainLayout pathName={{ questions: "Question Bank", edit: "Edit Question" }}>
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
                    <div className="text-center bg-white p-8 rounded-xl shadow-lg border-2 border-red-200">
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <p className="text-red-600 font-bold text-xl mb-2">Question Not Found</p>
                        <p className="text-gray-500 mb-6">The question you're looking for doesn't exist or has been deleted.</p>
                        <Button
                            onClick={() => navigate('/questions')}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Questions
                        </Button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout pathName={{ questions: "Question Bank", edit: "Edit Question" }}>
            <div className="h-full flex-1 flex flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <MainHeader
                                title="✏️ Edit Question"
                                description="Update question details and options"
                            />
                            <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    {Object.keys(errors).length === 0 ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-sm font-medium">Ready to save</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {Object.keys(errors).length} error(s) to fix
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <span className="text-sm font-medium">
                                        ID: {id}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateMutation.isPending}
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={updateMutation.isPending}
                                className="bg-white text-orange-700 hover:bg-gray-100 font-semibold shadow-lg"
                            >
                                {updateMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-5 border-b-2 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-xl text-orange-900">📝 Question Details</h3>
                                {Object.keys(errors).length > 0 ? (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1 font-medium">
                                        <AlertCircle className="h-4 w-4" />
                                        Please fix the errors below before saving
                                    </p>
                                ) : (
                                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1 font-medium">
                                        <CheckCircle2 className="h-4 w-4" />
                                        All fields are valid
                                    </p>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/questions')}
                                className="hover:bg-orange-50"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to List
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                        <div className="max-w-5xl mx-auto space-y-8">
                            <QuestionFormFields
                                data={formData}
                                onChange={setFormData}
                                errors={errors}
                            />

                            <div className="border-t-2 border-gray-200 pt-6">
                                <QuestionOptionsManager
                                    data={formData}
                                    onChange={setFormData}
                                    errors={errors}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
