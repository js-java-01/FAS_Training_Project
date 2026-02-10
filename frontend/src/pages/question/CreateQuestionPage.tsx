import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { questionApi } from '@/api/questionApi';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, Plus, Trash2 } from 'lucide-react';
import type { QuestionCreateRequest } from '@/types/question';
import { QuestionFormFields, QuestionOptionsManager } from './components';

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
                { content: '', isCorrect: false, orderIndex: 0 },
                { content: '', isCorrect: false, orderIndex: 1 },
            ],
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

            const hasCorrectOption = formData.options.some(opt => opt.isCorrect);
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
                    { content: '', isCorrect: false, orderIndex: 0 },
                    { content: '', isCorrect: false, orderIndex: 1 },
                ],
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
        <MainLayout pathName={{ questions: "Questions", create: "Create Question" }}>
            <div className="h-full flex-1 flex flex-col gap-4">
                <MainHeader
                    title="Create Questions"
                    description={`Creating ${questions.length} question${questions.length > 1 ? 's' : ''}`}
                />

                <div className="flex justify-between gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddQuestion}
                        className="h-8"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Question
                    </Button>

                    <div className="flex gap-2">
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
                            className="bg-blue-600 hover:bg-blue-700"
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

                <div className="flex-1 flex gap-4 overflow-hidden">
                    {/* Left Sidebar - Question List */}
                    {questions.length > 1 && (
                        <div className="w-64 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">Questions</h3>
                                <p className="text-xs text-gray-500 mt-1">{questions.length} total</p>
                            </div>
                            <div className="flex-1 overflow-auto p-2">
                                {questions.map((q, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveQuestionIndex(index)}
                                        className={`w-full text-left px-3 py-2 rounded-lg mb-1 transition-colors group ${activeQuestionIndex === index
                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                            : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">
                                                    Question {index + 1}
                                                </div>
                                                {q.content && (
                                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                                        {q.content}
                                                    </div>
                                                )}
                                                {errors[index] && (
                                                    <div className="text-xs text-red-500 mt-0.5">
                                                        Has errors
                                                    </div>
                                                )}
                                            </div>
                                            {questions.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveQuestion(index);
                                                    }}
                                                    className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Right Side - Question Form */}
                    <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Question {activeQuestionIndex + 1}
                                    </h3>
                                    {errors[activeQuestionIndex] && (
                                        <p className="text-xs text-red-500 mt-1">
                                            Please fix the errors below
                                        </p>
                                    )}
                                </div>
                                {questions.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6">
                            <div className="max-w-4xl space-y-6">
                                <QuestionFormFields
                                    data={questions[activeQuestionIndex]}
                                    onChange={(data) => handleQuestionChange(activeQuestionIndex, data)}
                                    errors={errors[activeQuestionIndex] || {}}
                                />

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
        </MainLayout>
    );
}
