import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { questionCategoryApi } from '@/api/questionCategoryApi';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuestionCreateRequest } from '@/types/question';

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
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Question Content <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="content"
                    rows={4}
                    value={data.content}
                    onChange={(e) => onChange({ ...data, content: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.content ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter the question content"
                />
                {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-1">
                        Question Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="questionType"
                        value={data.questionType}
                        onChange={(e) => handleTypeChange(e.target.value as 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="SINGLE_CHOICE">Single Choice</option>
                        <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="categoryId"
                        value={data.categoryId}
                        onChange={(e) => onChange({ ...data, categoryId: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.categoryId ? 'border-red-300' : 'border-gray-300'
                            }`}
                        disabled={categoriesLoading}
                    >
                        <option value="">Select category</option>
                        {categories?.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id="isActive"
                    checked={data.isActive}
                    onCheckedChange={(checked) => onChange({ ...data, isActive: !!checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active
                </label>
            </div>
        </div>
    );
};
