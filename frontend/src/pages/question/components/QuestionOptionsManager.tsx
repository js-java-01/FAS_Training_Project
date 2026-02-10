import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { QuestionCreateRequest, QuestionOptionRequest } from '@/types/question';

interface QuestionOptionsManagerProps {
    data: QuestionCreateRequest;
    onChange: (data: QuestionCreateRequest) => void;
    errors: Record<string, string>;
}

export const QuestionOptionsManager: React.FC<QuestionOptionsManagerProps> = ({
    data,
    onChange,
    errors,
}) => {
    const { toast } = useToast();

    const handleAddOption = () => {
        onChange({
            ...data,
            options: [
                ...data.options,
                { content: '', isCorrect: false, orderIndex: data.options.length }
            ]
        });
    };

    const handleRemoveOption = (index: number) => {
        if (data.options.length <= 2) {
            toast({ variant: "destructive", title: "Error", description: "At least 2 options are required" });
            return;
        }
        const newOptions = data.options.filter((_, i) => i !== index);
        newOptions.forEach((opt, i) => opt.orderIndex = i);
        onChange({ ...data, options: newOptions });
    };

    const handleOptionChange = (index: number, field: keyof QuestionOptionRequest, value: string | boolean) => {
        const newOptions = [...data.options];
        newOptions[index] = { ...newOptions[index], [field]: value };
        onChange({ ...data, options: newOptions });
    };

    const handleCorrectChange = (index: number) => {
        const newOptions = [...data.options];

        if (data.questionType === 'SINGLE_CHOICE') {
            newOptions.forEach((opt, i) => {
                opt.isCorrect = i === index;
            });
        } else {
            newOptions[index].isCorrect = !newOptions[index].isCorrect;
        }

        onChange({ ...data, options: newOptions });
    };

    const handleMoveOption = (index: number, direction: 'up' | 'down') => {
        const newOptions = [...data.options];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newOptions.length) return;

        [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
        newOptions.forEach((opt, i) => opt.orderIndex = i);

        onChange({ ...data, options: newOptions });
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-medium text-gray-700">
                        Options <span className="text-red-500">*</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {data.questionType === 'SINGLE_CHOICE'
                            ? 'Select one correct answer'
                            : 'Select one or more correct answers'}
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                </Button>
            </div>

            {errors.options && (
                <p className="mb-2 text-sm text-red-600">{errors.options}</p>
            )}
            {errors.correctOption && (
                <p className="mb-2 text-sm text-red-600">{errors.correctOption}</p>
            )}

            <div className="space-y-3">
                {data.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex flex-col gap-1 mt-2">
                            <button
                                type="button"
                                onClick={() => handleMoveOption(index, 'up')}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <GripVertical className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex items-center mt-2">
                            {data.questionType === 'SINGLE_CHOICE' ? (
                                <input
                                    type="radio"
                                    checked={option.isCorrect}
                                    onChange={() => handleCorrectChange(index)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                            ) : (
                                <Checkbox
                                    checked={option.isCorrect}
                                    onCheckedChange={() => handleCorrectChange(index)}
                                />
                            )}
                        </div>

                        <div className="flex-1">
                            <input
                                type="text"
                                value={option.content}
                                onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[`option_${index}`] ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                placeholder={`Option ${index + 1}`}
                            />
                            {errors[`option_${index}`] && (
                                <p className="mt-1 text-sm text-red-600">{errors[`option_${index}`]}</p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            disabled={data.options.length <= 2}
                            className="mt-2 text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
