import React, { useState, useEffect } from 'react';

import { LanguageFormFields } from './LanguageFormFields';
import { getSupportedBadgeStyle } from './utils';
import { validateProgrammingLanguage } from '../../lib/programmingLanguageSchema';
import type { ProgrammingLanguage, ProgrammingLanguageRequest } from '../../types/feature/assessment/programming-language';
import { Modal } from '@/components/modal/Modal';

interface UpdateLanguageModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** The language to update */
    language: ProgrammingLanguage | null;
    /** Callback when form is submitted with valid data */
    onSubmit: (id: number, data: ProgrammingLanguageRequest) => void;
    /** Whether the update mutation is pending */
    isPending: boolean;
}

/**
 * Modal for updating an existing programming language (3.2.9.2)
 * 
 * Shows the current supported status (read-only per BR-PL-03)
 * and allows editing name, version, and description.
 */
export const UpdateLanguageModal: React.FC<UpdateLanguageModalProps> = ({
    isOpen,
    onClose,
    language,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<ProgrammingLanguageRequest>({
        name: '',
        version: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Sync form data when language changes
    useEffect(() => {
        if (language) {
            setFormData({
                name: language.name,
                version: language.version || '',
                description: language.description || '',
            });
            setErrors({});
        }
    }, [language]);

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!language) return;

        const validation = validateProgrammingLanguage(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        setErrors({});
        onSubmit(language.id, formData);
    };

    return (
        <Modal
            isOpen={isOpen && !!language}
            onClose={handleClose}
            title="Update Programming Language"
            size="md"
            actions={
                <>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        form="update-lang-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                    >
                        {isPending ? 'Updating...' : 'Update Language'}
                    </button>
                </>
            }
        >
            {language && (
                <form id="update-lang-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Supported Badge (BR-PL-03: Cannot directly edit isSupported) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getSupportedBadgeStyle(language.isSupported)}`}>
                            {language.isSupported ? 'Supported' : 'Not Supported'}
                        </span>
                        <p className="mt-1 text-xs text-gray-500">Status is determined by the backend</p>
                    </div>

                    <LanguageFormFields
                        data={formData}
                        onChange={setFormData}
                        errors={errors}
                        idPrefix="update-"
                    />
                </form>
            )}
        </Modal>
    );
};
