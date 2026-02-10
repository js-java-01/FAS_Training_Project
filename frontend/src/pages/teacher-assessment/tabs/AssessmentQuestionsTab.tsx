import { Plus, FileQuestion, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AssessmentQuestionsTab() {
    // Temporary placeholder data
    const questions = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        content: `Sample question ${i + 1}: What is the correct answer for this question?`,
        type: i % 3 === 0 ? 'Multiple Choice' : i % 3 === 1 ? 'True/False' : 'Short Answer',
        points: 5,
        hasCorrectAnswer: i % 4 !== 0,
    }));

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Quiz Questions</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage quiz questions for this assessment</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a temporary placeholder. Question management features will be implemented when the API is available.
                </p>
            </div>

            {/* Questions Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Questions</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{questions.length}</p>
                        </div>
                        <FileQuestion className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Points</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{questions.length * 5}</p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Incomplete</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {questions.filter(q => !q.hasCorrectAnswer).length}
                            </p>
                        </div>
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3">
                {questions.map((question, index) => (
                    <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-sm">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <p className="text-sm text-gray-900 font-medium">{question.content}</p>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {question.hasCorrectAnswer ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span className="px-2 py-1 rounded-full bg-gray-100">
                                        {question.type}
                                    </span>
                                    <span className="font-medium">{question.points} points</span>
                                    {!question.hasCorrectAnswer && (
                                        <span className="text-red-600">No correct answer set</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
