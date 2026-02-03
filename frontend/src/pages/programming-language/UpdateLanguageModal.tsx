import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { ProgrammingLanguageFormFields } from './ProgrammingLanguageFormFields';
import type { ProgrammingLanguage, ProgrammingLanguageRequest } from '../../types/programmingLanguage';

interface UpdateLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: ProgrammingLanguage | null;
    onSubmit: (id: number, data: ProgrammingLanguageRequest) => void;
    isPending: boolean;
}

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
        isSupported: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && language) {
            setFormData({
                name: language.name,
                version: language.version || '',
                description: language.description || '',
                isSupported: (language as any).supported ?? language.isSupported ?? false,
            });
            setErrors({});
        }
    }, [isOpen, language]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (formData.name.length > 255) newErrors.name = 'Name must be at most 255 characters';
        if (formData.version && formData.version.length > 255) newErrors.version = 'Version must be at most 255 characters';
        if (formData.description && formData.description.length > 1000) newErrors.description = 'Description must be at most 1000 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (language && validate()) {
            onSubmit(language.id, formData);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Programming Language"
            size="md"
            actions={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        form="update-language-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Updating...' : 'Update Language'}
                    </button>
                </div>
            }
        >
            <form id="update-language-form" onSubmit={handleSubmit}>
                <ProgrammingLanguageFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="update-"
                />
            </form>
        </Modal>
    );
};
