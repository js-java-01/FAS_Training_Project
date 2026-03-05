import { Plus, Code2, Clock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AssessmentChallengesTab() {
    // Temporary placeholder data
    const challenges = [
        {
            id: 1,
            title: 'Array Manipulation Challenge',
            difficulty: 'Medium',
            points: 100,
            timeLimit: 30,
            language: 'Java',
        }
    ];

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Programming Challenges</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage programming language challenges for this assessment</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Challenge
                </Button>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This is a temporary placeholder. Challenge management features will be implemented when the API is available.
                </p>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Code2 className="h-5 w-5 text-blue-600" />
                                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                        {challenge.difficulty}
                                    </span>
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                        {challenge.language}
                                    </span>
                                </div>

                                <div className="flex items-center gap-6 text-sm text-gray-600 ml-8">
                                    <div className="flex items-center gap-1">
                                        <Trophy className="h-4 w-4" />
                                        <span>{challenge.points} points</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{challenge.timeLimit} minutes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Edit</Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">Delete</Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State (when no challenges) */}
            {challenges.length === 0 && (
                <div className="text-center py-12">
                    <Code2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No challenges</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first programming challenge.</p>
                    <div className="mt-6">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Challenge
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
