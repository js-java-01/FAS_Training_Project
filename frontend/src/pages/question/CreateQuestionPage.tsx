import { MainLayout } from '@/components/layout/MainLayout';
import MainHeader from '@/components/layout/MainHeader';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { questionApi } from '@/api/questionApi';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
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
        <MainLayout pathName={{ questions: "Question Bank", create: "Create Questions" }}>
            <div className="h-full flex-1 flex flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <MainHeader
                                title="✨ Create New Questions"
                                description={`Building ${questions.length} question${questions.length > 1 ? 's' : ''} for your assessment`}
                            />
                            <div className="mt-3 flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {questions.filter((_, idx) => !errors[idx] || Object.keys(errors[idx]).length === 0).length} Complete
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                        {questions.filter((_, idx) => errors[idx] && Object.keys(errors[idx]).length > 0).length} Need Attention
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={createMutation.isPending}
                                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createMutation.isPending}
                                className="bg-white text-blue-700 hover:bg-gray-100 font-semibold shadow-lg"
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
                </div>

                {/* Add Question Button */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleAddQuestion}
                        className="border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 text-blue-700 font-semibold"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Add Another Question
                    </Button>
                    <p className="text-sm text-gray-500">
                        💡 <span className="font-medium">Tip:</span> Create multiple questions at once to save time
                    </p>
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Left Sidebar - Question List */}
                    {questions.length > 1 && (
                        <div className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
                                <h3 className="font-bold text-lg text-gray-900">📝 Questions Queue</h3>
                                <p className="text-sm text-gray-600 mt-1">{questions.length} questions in total</p>
                            </div>
                            <div className="flex-1 overflow-auto p-3">
                                {questions.map((q, index) => {
                                    const hasErrors = errors[index] && Object.keys(errors[index]).length > 0;
                                    const isComplete = q.content && q.categoryId && q.options.some(opt => opt.isCorrect);
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setActiveQuestionIndex(index)}
                                            className={`w-full text-left p-4 rounded-lg mb-2 transition-all group ${activeQuestionIndex === index
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md scale-[1.02]'
                                                : 'hover:bg-gray-100 text-gray-700 border-2 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`font-bold text-sm ${activeQuestionIndex === index ? 'text-white' : 'text-gray-900'}`}>
                                                            Question {index + 1}
                                                        </span>
                                                        {isComplete && !hasErrors && (
                                                            <CheckCircle2 className={`h-4 w-4 ${activeQuestionIndex === index ? 'text-green-300' : 'text-green-600'}`} />
                                                        )}
                                                        {hasErrors && (
                                                            <AlertCircle className={`h-4 w-4 ${activeQuestionIndex === index ? 'text-red-300' : 'text-red-600'}`} />
                                                        )}
                                                    </div>
                                                    {q.content ? (
                                                        <div className={`text-sm truncate ${activeQuestionIndex === index ? 'text-white/90' : 'text-gray-600'}`}>
                                                            {q.content}
                                                        </div>
                                                    ) : (
                                                        <div className={`text-xs italic ${activeQuestionIndex === index ? 'text-white/70' : 'text-gray-400'}`}>
                                                            No content yet...
                                                        </div>
                                                    )}
                                                    {hasErrors && (
                                                        <div className={`text-xs mt-1 font-medium ${activeQuestionIndex === index ? 'text-red-300' : 'text-red-600'}`}>
                                                            ⚠ {Object.keys(errors[index]).length} error(s)
                                                        </div>
                                                    )}
                                                </div>
                                                {questions.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveQuestion(index);
                                                        }}
                                                        className={`ml-2 hover:scale-110 transition-transform ${activeQuestionIndex === index
                                                            ? 'text-red-300 hover:text-red-200'
                                                            : 'text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100'
                                                            }`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
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
                    <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b-2 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-xl text-blue-900 flex items-center gap-2">
                                        📋 Question {activeQuestionIndex + 1}
                                        {questions.length > 1 && (
                                            <span className="text-sm font-normal text-blue-600">
                                                of {questions.length}
                                            </span>
                                        )}
                                    </h3>
                                    {errors[activeQuestionIndex] && Object.keys(errors[activeQuestionIndex]).length > 0 ? (
                                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1 font-medium">
                                            <AlertCircle className="h-4 w-4" />
                                            Please fix {Object.keys(errors[activeQuestionIndex]).length} error(s) below
                                        </p>
                                    ) : questions[activeQuestionIndex].content && questions[activeQuestionIndex].categoryId ? (
                                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1 font-medium">
                                            <CheckCircle2 className="h-4 w-4" />
                                            Looking good!
                                        </p>
                                    ) : (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Fill out the details below
                                        </p>
                                    )}
                                </div>
                                {questions.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(activeQuestionIndex)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Remove This Question
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto p-6 bg-gradient-to-b from-gray-50 to-white">
                            <div className="max-w-5xl mx-auto space-y-8">
                                <QuestionFormFields
                                    data={questions[activeQuestionIndex]}
                                    onChange={(data) => handleQuestionChange(activeQuestionIndex, data)}
                                    errors={errors[activeQuestionIndex] || {}}
                                />

                                <div className="border-t-2 border-gray-200 pt-6">
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
