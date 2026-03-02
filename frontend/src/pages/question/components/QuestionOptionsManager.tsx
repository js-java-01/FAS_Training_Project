import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical, CheckCircle2, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import type { QuestionCreateRequest, QuestionOptionRequest } from '@/types';
import { useToast } from '@/hooks/useToast';

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
                { content: '', correct: false, orderIndex: data.options.length, questionId: '' }
            ]
        });
    };

    const handleRemoveOption = (index: number) => {
        if (data.options.length <= 2) {
            toast({ variant: "destructive", title: "Minimum Required", description: "At least 2 options are required" });
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
                opt.correct = i === index;
            });
        } else {
            newOptions[index].correct = !newOptions[index].correct;
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

    const correctCount = data.options.filter(opt => opt.correct).length;

    return (
        <div>
            <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                            🎯 Answer Options <span className="text-red-500">*</span>
                        </h3>
                        {correctCount > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg font-bold text-sm">
                                <CheckCircle2 className="h-4 w-4" />
                                {correctCount} Correct
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            {data.questionType === 'SINGLE_CHOICE'
                                ? '📌 Select exactly one correct answer (radio buttons)'
                                : '📋 Select one or more correct answers (checkboxes)'}
                        </p>
                        {correctCount === 0 && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-200">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <span className="font-medium">Please mark at least one option as correct</span>
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddOption}
                    className="border-2 border-dashed border-blue-400 hover:border-blue-600 hover:bg-blue-50 text-blue-700 font-semibold shadow-sm"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Option
                </Button>
            </div>

            {errors.options && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border-2 border-red-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{errors.options}</span>
                </div>
            )}
            {errors.correctOption && (
                <div className="mb-4 flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg border-2 border-orange-200">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{errors.correctOption}</span>
                </div>
            )}

            <div className="space-y-3">
                {data.options.map((option, index) => (
                    <div key={index} className={`group flex items-center gap-3 p-4 border-2 rounded-xl transition-all ${option.correct
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-400 shadow-lg ring-2 ring-green-300'
                        : errors[`option_${index}`]
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                        }`}>

                        {/* Move Buttons */}
                        <div className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => handleMoveOption(index, 'up')}
                                disabled={index === 0}
                                className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="Move up"
                            >
                                <ChevronUp className="h-5 w-5" />
                            </button>
                            <GripVertical className="h-5 w-5 text-gray-300" />
                            <button
                                type="button"
                                onClick={() => handleMoveOption(index, 'down')}
                                disabled={index === data.options.length - 1}
                                className="text-gray-400 hover:text-blue-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                title="Move down"
                            >
                                <ChevronDown className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Option Number Badge */}
                        <div className={`flex items-center justify-center h-10 w-10 rounded-full text-sm font-bold flex-shrink-0 ${option.correct
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-300 text-gray-700'
                            }`}>
                            {String.fromCharCode(65 + index)}
                        </div>

                        {/* Correct Toggle */}
                        <div className="flex items-center flex-shrink-0">
                            {data.questionType === 'SINGLE_CHOICE' ? (
                                <input
                                    type="radio"
                                    checked={option.correct}
                                    onChange={() => handleCorrectChange(index)}
                                    className="h-5 w-5 text-green-600 border-gray-400 focus:ring-green-500 cursor-pointer"
                                />
                            ) : (
                                <Checkbox
                                    checked={option.correct}
                                    onCheckedChange={() => handleCorrectChange(index)}
                                    className="h-5 w-5 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                            )}
                        </div>

                        {/* Option Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                {option.correct && (
                                    <div className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-xs font-bold flex-shrink-0 shadow-sm">
                                        <CheckCircle2 className="h-3 w-3" />
                                        CORRECT ANSWER
                                    </div>
                                )}
                                <span className="text-xs font-semibold text-gray-500">Option {index + 1}</span>
                            </div>
                            <input
                                type="text"
                                value={option.content}
                                onChange={(e) => handleOptionChange(index, 'content', e.target.value)}
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:border-transparent transition-all ${errors[`option_${index}`]
                                    ? 'border-red-400 focus:ring-red-500 bg-red-50'
                                    : option.correct
                                        ? 'border-green-400 focus:ring-green-500 bg-white font-bold text-green-900'
                                        : 'border-gray-300 focus:ring-blue-500 bg-white'
                                    }`}
                                placeholder={`Enter option ${String.fromCharCode(65 + index)} text...`}
                            />
                            {errors[`option_${index}`] && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 font-medium">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors[`option_${index}`]}
                                </div>
                            )}
                        </div>

                        {/* Delete Button */}
                        <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            disabled={data.options.length <= 2}
                            className="text-red-500 hover:text-red-700 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 p-2 rounded-lg transition-all"
                            title={data.options.length <= 2 ? "Minimum 2 options required" : "Remove option"}
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Helper Text */}
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <span className="font-bold">💡 Tip:</span> Use the radio button/checkbox to mark correct answers.
                    Use the arrow buttons to reorder options. At least {data.questionType === 'SINGLE_CHOICE' ? 'one' : 'one'} option must be marked correct.
                </p>
            </div>
        </div>
    );
};
