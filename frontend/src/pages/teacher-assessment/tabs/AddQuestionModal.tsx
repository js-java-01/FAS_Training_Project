import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Search, Plus, CheckCircle2 } from 'lucide-react';
import type { QuestionCategory } from '@/types';
import type { QuestionListItem } from '@/types/question';
import { questionApi } from '@/api/questionApi';
import { questionCategoryApi } from '@/api';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (selected: { questionId: string; score: number }[]) => void;
    existingQuestionIds: string[];
}

export function AddQuestionModal({ isOpen, onClose, onAdd, existingQuestionIds }: AddQuestionModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuestions, setSelectedQuestions] = useState<QuestionListItem[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [defaultScore, setDefaultScore] = useState(10);

    // Fetch all available questions
    const { data: allQuestions = [], isLoading: questionsLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: () => questionApi.getAllContent(),
        enabled: isOpen,
    });

    // Fetch all categories
    const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getPage({ page: 0, size: 1000 }),
        enabled: isOpen,
    });

    const categories = categoriesResponse?.items ?? [];

    // Filter out questions that are already added to the assessment
    const availableQuestions = useMemo(() => {
        return allQuestions.filter(q => !existingQuestionIds.includes(q.id));
    }, [allQuestions, existingQuestionIds]);

    // Filter questions based on category and search term
    const filteredQuestions = useMemo(() => {
        let filtered = availableQuestions;

        // Filter by selected category
        if (selectedCategoryId) {
            filtered = filtered.filter(q => q.category?.id === selectedCategoryId);
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(q =>
                q.content.toLowerCase().includes(term) ||
                (q.category?.name?.toLowerCase().includes(term) ?? false)
            );
        }

        return filtered;
    }, [availableQuestions, selectedCategoryId, searchTerm]);

    const toggleQuestion = (question: QuestionListItem) => {
        setSelectedQuestions(prev => {
            const isSelected = prev.find(q => q.id === question.id);
            if (isSelected) {
                return prev.filter(q => q.id !== question.id);
            } else {
                return [...prev, question];
            }
        });
    };

    const handleAdd = () => {
        if (selectedQuestions.length > 0) {
            const itemsToAdd = selectedQuestions.map(q => ({
                questionId: q.id,
                score: defaultScore
            }));
            onAdd(itemsToAdd);
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedQuestions([]);
        setDefaultScore(10);
        setSearchTerm('');
        setSelectedCategoryId('');
        onClose();
    };

    const isLoading = questionsLoading || categoriesLoading;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-7xl w-[95vw] h-[90vh] flex flex-col sm:max-w-none lg:max-w-7xl" aria-describedby={undefined}>
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <div>
                            <DialogTitle className="text-xl font-bold">Add Questions to Assessment</DialogTitle>
                            <p className="text-sm text-gray-500 mt-1">Select multiple questions from your question bank</p>
                        </div>
                        {selectedQuestions.length > 0 && (
                            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2 border border-blue-100 animate-in fade-in zoom-in duration-200">
                                <CheckCircle2 className="h-4 w-4" />
                                <span className="text-sm font-semibold">{selectedQuestions.length} questions selected</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                                    onClick={() => setSelectedQuestions([])}
                                >
                                    Clear
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex gap-6 pt-4">
                    {/* Left Sidebar - Categories */}
                    <div className="w-72 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm">
                        <div className="p-4 border-b bg-white">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {categories.length} categories available
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-3 space-y-1">
                            {categoriesLoading ? (
                                <div className="flex flex-col items-center justify-center h-40 gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="text-xs text-gray-400">Loading categories...</span>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setSelectedCategoryId('')}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${!selectedCategoryId
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'hover:bg-white hover:shadow-sm text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold">All Questions</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedCategoryId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                {availableQuestions.length}
                                            </span>
                                        </div>
                                    </button>
                                    {categories.map((category: QuestionCategory) => {
                                        const count = availableQuestions.filter(q => q.category?.id === category.id).length;
                                        const isSelected = selectedCategoryId === category.id;
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => setSelectedCategoryId(category.id)}
                                                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${isSelected
                                                    ? 'bg-blue-600 text-white shadow-md'
                                                    : 'hover:bg-white hover:shadow-sm text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="truncate font-medium">{category.name}</span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                        {count}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Questions */}
                    <div className="flex-1 overflow-hidden flex flex-col gap-4">
                        {/* Search & Bulk Actions */}
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search by question content..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-11 shadow-sm"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const allSelected = filteredQuestions.every(q => selectedQuestions.some(sq => sq.id === q.id));
                                    if (allSelected) {
                                        setSelectedQuestions(prev => prev.filter(pq => !filteredQuestions.some(fq => fq.id === pq.id)));
                                    } else {
                                        setSelectedQuestions(prev => {
                                            const newBatch = filteredQuestions.filter(fq => !prev.some(pq => pq.id === fq.id));
                                            return [...prev, ...newBatch];
                                        });
                                    }
                                }}
                                className="h-11 px-4 border-dashed border-2 hover:border-blue-500 hover:text-blue-600"
                            >
                                {filteredQuestions.every(q => selectedQuestions.some(sq => sq.id === q.id))
                                    ? 'Deselect All Visible'
                                    : 'Select All Visible'
                                }
                            </Button>
                            <div className="flex items-center gap-3 bg-gray-50 p-1.5 px-3 rounded-lg border shadow-sm">
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Default Points
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={defaultScore}
                                    onChange={(e) => setDefaultScore(Number(e.target.value))}
                                    className="w-20 h-8 text-sm"
                                />
                            </div>
                        </div>

                        {/* Questions List */}
                        <div className="flex-1 overflow-auto border-2 border-gray-100 rounded-xl bg-gray-50/30 p-2">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                    <p className="text-sm text-gray-500">Retrieving questions...</p>
                                </div>
                            ) : filteredQuestions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-700">No questions found</p>
                                    <p className="text-sm max-w-xs mt-1">
                                        {searchTerm || selectedCategoryId
                                            ? 'Try adjusting your search terms or category selection'
                                            : 'Excellent! You have already added all available questions to this assessment.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredQuestions.map((question) => {
                                        const isSelected = selectedQuestions.some(q => q.id === question.id);
                                        return (
                                            <div
                                                key={question.id}
                                                onClick={() => toggleQuestion(question)}
                                                className={`group p-4 rounded-xl cursor-pointer border-2 transition-all duration-200 ${isSelected
                                                    ? 'bg-blue-50 border-blue-600 shadow-sm'
                                                    : 'bg-white border-transparent hover:border-gray-200 hover:shadow-md'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="pt-1">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => {
                                                                // No need to call toggleQuestion here as it will bubble to the div
                                                            }}
                                                            className="h-5 w-5 rounded border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={`text-sm font-medium transition-colors ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                                            {question.content}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                                {question.category?.name || 'No Category'}
                                                            </span>
                                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                                                                {question.questionType}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                • {question.options.length} options
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t mt-2">
                    <p className="text-sm text-gray-500">
                        {selectedQuestions.length > 0
                            ? `${selectedQuestions.length} questions will be added with ${defaultScore} points each`
                            : 'Select one or more questions to continue'
                        }
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={selectedQuestions.length === 0}
                            className="bg-blue-600 hover:bg-blue-700 px-8 h-10 shadow-lg shadow-blue-200"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Selected Questions
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

