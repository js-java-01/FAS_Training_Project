import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { questionApi } from '@/api/questionApi';
import { Loader2, Search, Plus } from 'lucide-react';
import type { Question } from '@/types/question';

interface AddQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (questionId: string, score: number) => void;
    existingQuestionIds: string[];
}

export function AddQuestionModal({ isOpen, onClose, onAdd, existingQuestionIds }: AddQuestionModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [score, setScore] = useState(10);

    // Fetch all available questions
    const { data: allQuestions = [], isLoading } = useQuery({
        queryKey: ['questions'],
        queryFn: () => questionApi.getAll(),
        enabled: isOpen,
    });

    // Filter out questions that are already added to the assessment
    const availableQuestions = useMemo(() => {
        return allQuestions.filter(q => !existingQuestionIds.includes(q.id));
    }, [allQuestions, existingQuestionIds]);

    // Filter questions based on search term
    const filteredQuestions = useMemo(() => {
        if (!searchTerm.trim()) return availableQuestions;
        const term = searchTerm.toLowerCase();
        return availableQuestions.filter(q =>
            q.content.toLowerCase().includes(term) ||
            q.category.name.toLowerCase().includes(term)
        );
    }, [availableQuestions, searchTerm]);

    const handleAdd = () => {
        if (selectedQuestion) {
            onAdd(selectedQuestion.id, score);
            setSelectedQuestion(null);
            setScore(10);
            setSearchTerm('');
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedQuestion(null);
        setScore(10);
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Question to Assessment</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search questions by content or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Questions List */}
                    <div className="flex-1 overflow-auto border rounded-lg">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <p className="text-sm">
                                    {searchTerm ? 'No questions match your search' : 'All questions have been added'}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredQuestions.map((question) => (
                                    <div
                                        key={question.id}
                                        onClick={() => setSelectedQuestion(question)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            selectedQuestion?.id === question.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{question.content}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                                        {question.category.name}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                        {question.questionType}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {question.options.length} options
                                                    </span>
                                                </div>
                                            </div>
                                            {selectedQuestion?.id === question.id && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Score Input */}
                    {selectedQuestion && (
                        <div className="bg-gray-50 border rounded-lg p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-700">Selected Question:</p>
                                    <p className="text-sm text-gray-900 mt-1">{selectedQuestion.content}</p>
                                </div>
                                <div className="w-32">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Score
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={score}
                                        onChange={(e) => setScore(Number(e.target.value))}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={!selectedQuestion}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
