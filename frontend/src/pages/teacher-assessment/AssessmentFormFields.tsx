import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentTypeApi } from '@/api';
import type { AssessmentCreateRequest, AssessmentUpdateRequest } from '@/types';

interface AssessmentFormFieldsProps {
    data: AssessmentCreateRequest | AssessmentUpdateRequest;
    onChange: (data: AssessmentCreateRequest | AssessmentUpdateRequest) => void;
    errors: Record<string, string>;
    idPrefix?: string;
    isUpdate?: boolean;
}

export const AssessmentFormFields: React.FC<AssessmentFormFieldsProps> = ({
    data,
    onChange,
    errors,
    idPrefix = '',
    isUpdate = false,
}) => {
    // Fetch assessment types for dropdown
    const { data: assessmentTypesData } = useQuery({
        queryKey: ['assessmentTypes'],
        queryFn: () => assessmentTypeApi.getPage({ page: 0, size: 100 })
    });

    const assessmentTypes = assessmentTypesData?.items ?? [];

    return (
        <div className="space-y-4">
            {/* Code (only for create) */}
            {!isUpdate && (
                <div>
                    <label htmlFor={`${idPrefix}code`} className="block text-sm font-medium text-gray-700 mb-1">
                        Code <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id={`${idPrefix}code`}
                        value={'code' in data ? data.code || '' : ''}
                        onChange={(e) => onChange({ ...data, code: e.target.value } as typeof data)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.code ? 'border-red-300' : 'border-gray-300'
                            }`}
                        placeholder="Enter assessment code"
                    />
                    {errors.code && (
                        <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                    )}
                </div>
            )}

            {/* Title */}
            <div>
                <label htmlFor={`${idPrefix}title`} className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id={`${idPrefix}title`}
                    value={data.title}
                    onChange={(e) => onChange({ ...data, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter title"
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {data.title.length}/255 characters
                </p>
            </div>

            {/* Description */}
            <div>
                <label htmlFor={`${idPrefix}description`} className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id={`${idPrefix}description`}
                    rows={3}
                    value={data.description}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter description"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {data.description.length}/1000 characters
                </p>
            </div>

            {/* Assessment Type */}
            <div>
                <label htmlFor={`${idPrefix}assessmentTypeId`} className="block text-sm font-medium text-gray-700 mb-1">
                    Assessment Type <span className="text-red-500">*</span>
                </label>
                <select
                    id={`${idPrefix}assessmentTypeId`}
                    value={data.assessmentTypeId || ''}
                    onChange={(e) => onChange({ ...data, assessmentTypeId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.assessmentTypeId ? 'border-red-300' : 'border-gray-300'
                        }`}
                >
                    <option value="">Select type</option>
                    {assessmentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
                {errors.assessmentTypeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.assessmentTypeId}</p>
                )}
            </div>

            {/* Score Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${idPrefix}totalScore`} className="block text-sm font-medium text-gray-700 mb-1">
                        Total Score <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id={`${idPrefix}totalScore`}
                        min="0"
                        value={data.totalScore}
                        onChange={(e) => onChange({ ...data, totalScore: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.totalScore ? 'border-red-300' : 'border-gray-300'
                            }`}
                    />
                    {errors.totalScore && (
                        <p className="mt-1 text-sm text-red-600">{errors.totalScore}</p>
                    )}
                </div>
                <div>
                    <label htmlFor={`${idPrefix}passScore`} className="block text-sm font-medium text-gray-700 mb-1">
                        Pass Score <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id={`${idPrefix}passScore`}
                        min="0"
                        value={data.passScore}
                        onChange={(e) => onChange({ ...data, passScore: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.passScore ? 'border-red-300' : 'border-gray-300'
                            }`}
                    />
                    {errors.passScore && (
                        <p className="mt-1 text-sm text-red-600">{errors.passScore}</p>
                    )}
                </div>
            </div>

            {/* Time and Attempt Limits */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`${idPrefix}timeLimitMinutes`} className="block text-sm font-medium text-gray-700 mb-1">
                        Time Limit (minutes) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id={`${idPrefix}timeLimitMinutes`}
                        min="1"
                        value={data.timeLimitMinutes}
                        onChange={(e) => onChange({ ...data, timeLimitMinutes: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.timeLimitMinutes ? 'border-red-300' : 'border-gray-300'
                            }`}
                    />
                    {errors.timeLimitMinutes && (
                        <p className="mt-1 text-sm text-red-600">{errors.timeLimitMinutes}</p>
                    )}
                </div>
                <div>
                    <label htmlFor={`${idPrefix}attemptLimit`} className="block text-sm font-medium text-gray-700 mb-1">
                        Attempt Limit <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        id={`${idPrefix}attemptLimit`}
                        min="1"
                        value={data.attemptLimit}
                        onChange={(e) => onChange({ ...data, attemptLimit: Number(e.target.value) })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.attemptLimit ? 'border-red-300' : 'border-gray-300'
                            }`}
                    />
                    {errors.attemptLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.attemptLimit}</p>
                    )}
                </div>
            </div>

            {/* Status */}
            <div>
                <label htmlFor={`${idPrefix}status`} className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                </label>
                <select
                    id={`${idPrefix}status`}
                    value={data.status}
                    onChange={(e) => onChange({ ...data, status: e.target.value as 'DRAFT' | 'ACTIVE' | 'INACTIVE' })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.status ? 'border-red-300' : 'border-gray-300'
                        }`}
                >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
            </div>

            {/* Shuffle Options */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.isShuffleQuestion}
                            onChange={(e) => onChange({ ...data, isShuffleQuestion: e.target.checked })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">Shuffle Questions</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.isShuffleOption}
                            onChange={(e) => onChange({ ...data, isShuffleOption: e.target.checked })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm text-gray-700">Shuffle Options</span>
                    </label>
                </div>
            </div>
        </div>
    );
};
