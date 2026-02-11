import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionCategoryApi } from '@/api/questionCategoryApi';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuestionCreateRequest } from '@/types/question';
import { AlertCircle, FileText, Layers, Settings } from 'lucide-react';

interface QuestionFormFieldsProps {
    data: QuestionCreateRequest;
    onChange: (data: QuestionCreateRequest) => void;
    errors: Record<string, string>;
}

export const QuestionFormFields: React.FC<QuestionFormFieldsProps> = ({
    data,
    onChange,
    errors,
}) => {
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['question-categories'],
        queryFn: () => questionCategoryApi.getAll()
    });

    const handleTypeChange = (newType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE') => {
        const newOptions = [...data.options];
        if (newType === 'SINGLE_CHOICE') {
            const firstCorrect = newOptions.findIndex(opt => opt.isCorrect);
            newOptions.forEach((opt, i) => {
                opt.isCorrect = i === (firstCorrect >= 0 ? firstCorrect : 0);
            });
        }
        onChange({ ...data, questionType: newType, options: newOptions });
    };

    return (
        <div className="space-y-6">
            {/* Question Content */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <label htmlFor="content" className="text-base font-bold text-gray-900">
                        Question Content <span className="text-red-500">*</span>
                    </label>
                </div>
                <textarea
                    id="content"
                    rows={5}
                    value={data.content}
                    onChange={(e) => onChange({ ...data, content: e.target.value })}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 ${errors.content ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                    placeholder="Enter your question here... Be clear and specific."
                />
                {errors.content && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                        <AlertCircle className="h-4 w-4" />
                        {errors.content}
                    </div>
                )}
                {data.content && !errors.content && (
                    <p className="mt-2 text-xs text-gray-500">
                        ✓ Character count: <span className="font-medium">{data.content.length}</span>
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Question Type */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-purple-300 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Settings className="h-5 w-5 text-purple-600" />
                        </div>
                        <label htmlFor="questionType" className="text-base font-bold text-gray-900">
                            Question Type <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <select
                        id="questionType"
                        value={data.questionType}
                        onChange={(e) => handleTypeChange(e.target.value as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 font-medium"
                    >
                        <option value="SINGLE_CHOICE">📌 Single Choice (One Correct Answer)</option>
                        <option value="MULTIPLE_CHOICE">📋 Multiple Choice (Multiple Answers)</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                        {data.questionType === 'SINGLE_CHOICE'
                            ? '✓ Students can select only one option'
                            : '✓ Students can select multiple options'}
                    </p>
                </div>

                {/* Category */}
                <div className="bg-white rounded-lg border-2 border-gray-200 p-5 hover:border-green-300 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Layers className="h-5 w-5 text-green-600" />
                        </div>
                        <label htmlFor="categoryId" className="text-base font-bold text-gray-900">
                            Category <span className="text-red-500">*</span>
                        </label>
                    </div>
                    <select
                        id="categoryId"
                        value={data.categoryId}
                        onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 font-medium ${errors.categoryId ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                        disabled={categoriesLoading}
                    >
                        <option value="">Select a category...</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            {errors.categoryId}
                        </div>
                    )}
                    {categoriesLoading && (
                        <p className="mt-2 text-xs text-gray-500">Loading categories...</p>
                    )}
                </div>
            </div>

            {/* Active Toggle */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200 p-5">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="isActive"
                        checked={data.isActive}
                        onCheckedChange={(checked) => onChange({ ...data, isActive: !!checked })}
                        className="h-5 w-5"
                    />
                    <label htmlFor="isActive" className="flex-1 cursor-pointer">
                        <div className="font-bold text-gray-900">Active Question</div>
                        <div className="text-sm text-gray-600">
                            {data.isActive
                                ? '✓ This question will be available for use in assessments'
                                : '○ This question will be hidden from assessments'}
                        </div>
                    </label>
                    {data.isActive && (
                        <div className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                            Active
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
