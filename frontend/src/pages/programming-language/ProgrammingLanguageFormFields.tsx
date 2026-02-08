import React from 'react';
import type { ProgrammingLanguageRequest } from '../../types/programmingLanguage';

interface ProgrammingLanguageFormFieldsProps {
    data: ProgrammingLanguageRequest;
    onChange: (data: ProgrammingLanguageRequest) => void;
    errors: Record<string, string>;
    idPrefix?: string;
}

export const ProgrammingLanguageFormFields: React.FC<ProgrammingLanguageFormFieldsProps> = ({
    data,
    onChange,
    errors,
    idPrefix = '',
}) => {
    const nameId = `${idPrefix}name`;
    const versionId = `${idPrefix}version`;
    const descriptionId = `${idPrefix}description`;
    const isSupportedId = `${idPrefix}isSupported`;

    return (
        <div className="space-y-4">
            {/* Name Field */}
            <div>
                <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id={nameId}
                    value={data.name}
                    onChange={(e) => onChange({ ...data, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter programming language name"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {data.name.length}/255 characters
                </p>
            </div>

            {/* Version Field */}
            <div>
                <label htmlFor={versionId} className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                </label>
                <input
                    type="text"
                    id={versionId}
                    value={data.version || ''}
                    onChange={(e) => onChange({ ...data, version: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.version ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter version (e.g., 17, 3.11)"
                />
                {errors.version && (
                    <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {(data.version || '').length}/255 characters
                </p>
            </div>

            {/* Description Field */}
            <div>
                <label htmlFor={descriptionId} className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                </label>
                <textarea
                    id={descriptionId}
                    rows={4}
                    value={data.description || ''}
                    onChange={(e) => onChange({ ...data, description: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter description"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                    {(data.description || '').length}/1000 characters
                </p>
            </div>

            {/* Supported Status */}
            <div>
                <label htmlFor={isSupportedId} className="block text-sm font-medium text-gray-700 mb-1">
                    Support Status
                </label>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={isSupportedId}
                            checked={data.isSupported === true}
                            onChange={() => onChange({ ...data, isSupported: true })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Supported</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={isSupportedId}
                            checked={data.isSupported === false || data.isSupported === undefined}
                            onChange={() => onChange({ ...data, isSupported: false })}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Not Supported</span>
                    </label>
                </div>
            </div>
        </div>
    );
};
