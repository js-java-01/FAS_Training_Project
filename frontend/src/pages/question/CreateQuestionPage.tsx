import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { QuestionFormFields, QuestionOptionsManager } from './components';
import { useToast } from '@/hooks/useToast';
import type { QuestionCreateRequest } from '@/types';
import { questionApi } from '@/api';

export default function CreateQuestionPage() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [questions, setQuestions] = useState<QuestionCreateRequest[]>([
        {
            content: '',
            questionType: 'SINGLE_CHOICE',
            isActive: true,
            categoryId: '',
            options: [
                { content: '', correct: false, orderIndex: 0 },
                { content: '', correct: false, orderIndex: 1 },
            ],
            tagIds: [],
        }
    ]);
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

    const createMutation = useMutation({
        mutationFn: async (questionsData: QuestionCreateRequest[]) => {
            const results = [];
            for (const question of questionsData) {
                const result = await questionApi.create(question);
                results.push(result);
            }
            return results;
        },
        onSuccess: (data) => {
            toast({
                variant: "success",
                title: "Success",
                description: `${data.length} question${data.length > 1 ? 's' : ''} created successfully`
            });
            navigate('/questions');
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Failed to create questions"
            });
        }
    });

    const validate = () => {
        const allErrors: Record<string, Record<string, string>> = {};
        let hasErrors = false;

        questions.forEach((formData, qIndex) => {
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

            const hasCorrectOption = formData.options.some(opt => opt.correct);
            if (!hasCorrectOption) {
                newErrors.correctOption = 'At least one option must be marked as correct';
            }

            formData.options.forEach((option, index) => {
                if (!option.content.trim()) {
                    newErrors[`option_${index}`] = `Option ${index + 1} content is required`;
                }
            });

            if (Object.keys(newErrors).length > 0) {
                allErrors[qIndex] = newErrors;
                hasErrors = true;
            }
        });

        setErrors(allErrors);
        return !hasErrors;
    };

    const handleSubmit = () => {
        if (validate()) {
            createMutation.mutate(questions);
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

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {
                content: '',
                questionType: 'SINGLE_CHOICE',
                isActive: true,
                categoryId: '',
                options: [
                    { content: '', correct: false, orderIndex: 0 },
                    { content: '', correct: false, orderIndex: 1 },
                ],
                tagIds: [],
            }
        ]);
        setActiveQuestionIndex(questions.length);
    };

    const handleRemoveQuestion = (index: number) => {
        if (questions.length === 1) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "At least one question is required"
            });
            return;
        }
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
        if (activeQuestionIndex >= newQuestions.length) {
            setActiveQuestionIndex(newQuestions.length - 1);
        }
        // Remove errors for deleted question
        const newErrors = { ...errors };
        delete newErrors[index];
        setErrors(newErrors);
    };

    const handleQuestionChange = (index: number, data: QuestionCreateRequest) => {
        const newQuestions = [...questions];
        newQuestions[index] = data;
        setQuestions(newQuestions);
    };

    return (
        <MainLayout pathName={{ questions: "Question Bank", create: "Create Questions" }}>
            <div className="h-full flex-1 flex flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    {/* <MainHeader
                        title="Create New Questions"
                        description={`${questions.length} question${questions.length > 1 ? 's' : ''} to create`}
                    /> */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            disabled={createMutation.isPending}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Create {questions.length} Question{questions.length > 1 ? 's' : ''}
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Add Question Button */}
                <Button
                    variant="outline"
                    onClick={handleAddQuestion}
                    className="border-dashed w-fit"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Question
                </Button>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left Sidebar - Question List */}
                    {questions.length > 1 && (
                        <div className="w-64 bg-white rounded-lg border overflow-hidden flex flex-col">
                            <div className="p-4 border-b bg-gray-50">
                                <h3 className="font-semibold text-gray-900">Questions</h3>
                                <p className="text-xs text-gray-600 mt-1">{questions.length} total</p>
                            </div>
                            <div className="flex-1 overflow-auto p-3">
                                {questions.map((q, index) => {
                                    const hasErrors = errors[index] && Object.keys(errors[index]).length > 0;
                                    const isComplete = q.content && q.categoryId && q.options.some(opt => opt.correct);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setActiveQuestionIndex(index)}
                                            className={`w-full text-left p-3 rounded-md mb-2 transition-all group ${activeQuestionIndex === index
                                                ? 'bg-blue-600 text-white'
                                                : 'hover:bg-gray-100 text-gray-700 border'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-sm font-medium ${activeQuestionIndex === index ? 'text-white' : 'text-gray-900'}`}>
                                                            Question {index + 1}
                                                        </span>
                                                        {isComplete && !hasErrors && (
                                                            <CheckCircle2 className={`h-3 w-3 ${activeQuestionIndex === index ? 'text-green-300' : 'text-green-600'}`} />
                                                        )}
                                                        {hasErrors && (
                                                            <AlertCircle className={`h-3 w-3 ${activeQuestionIndex === index ? 'text-red-300' : 'text-red-600'}`} />
                                                        )}
                                                    </div>
                                                    {q.content ? (
                                                        <div className={`text-xs truncate ${activeQuestionIndex === index ? 'text-white/80' : 'text-gray-600'}`}>
                                                            {q.content}
                                                        </div>
                                                    ) : (
                                                        <div className={`text-xs italic ${activeQuestionIndex === index ? 'text-white/60' : 'text-gray-400'}`}>
                                                            No content
                                                        </div>
                                                    )}
                                                </div>
                                                {questions.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveQuestion(index);
                                                        }}
                                                        className={`hover:scale-110 transition-transform ${activeQuestionIndex === index
                                                            ? 'text-red-300 hover:text-red-100'
                                                            : 'text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100'
                                                            }`}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Right Side - Question Form */}
                    <div className="flex-1 bg-white rounded-lg border overflow-hidden flex flex-col">
                        <div className="p-4 border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Question {activeQuestionIndex + 1}
                                        {questions.length > 1 && (
                                            <span className="text-sm font-normal text-gray-600 ml-2">
                                                of {questions.length}
                                            </span>
                                        )}
                                    </h3>
                                    {errors[activeQuestionIndex] && Object.keys(errors[activeQuestionIndex]).length > 0 ? (
                                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {Object.keys(errors[activeQuestionIndex]).length} error(s)
                                        </p>
                                    ) : questions[activeQuestionIndex].content && questions[activeQuestionIndex].categoryId ? (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Complete
                                        </p>
                                    ) : null}
                                </div>
                                {questions.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="max-w-4xl mx-auto space-y-6">
                                <QuestionFormFields
                                    data={questions[activeQuestionIndex]}
                                    onChange={(data) => handleQuestionChange(activeQuestionIndex, data)}
                                    errors={errors[activeQuestionIndex] || {}}
                                />

                                <div className="border-t pt-6">
                                    <QuestionOptionsManager
                                        data={questions[activeQuestionIndex]}
                                        onChange={(data) => handleQuestionChange(activeQuestionIndex, data)}
                                        errors={errors[activeQuestionIndex] || {}}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
