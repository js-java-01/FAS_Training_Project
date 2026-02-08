import React from 'react';
import type { AssessmentTypeRequest } from '../../types/assessmentType';

interface AssessmentFormFieldsProps {
    data: AssessmentTypeRequest;
    onChange: (data: AssessmentTypeRequest) => void;
    errors: Record<string, string>;
    idPrefix?: string;
}

export const AssessmentFormFields: React.FC<AssessmentFormFieldsProps> = ({
    data,
    onChange,
    errors,
    idPrefix = '',
}) => {
    const nameId = `${idPrefix}name`;
    const descriptionId = `${idPrefix}description`;

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id={nameId}
                    value={data.name}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter assessment type name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
            </div>

            <div>
                <label htmlFor={descriptionId} className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                </label>
                <textarea
                    id={descriptionId}
                    rows={4}
                    value={data.description}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder="Enter description"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
            </div>
        </div>
    );
};
