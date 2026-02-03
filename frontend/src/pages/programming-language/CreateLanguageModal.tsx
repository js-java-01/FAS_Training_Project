import React, { useState } from 'react';
import { Modal } from '../../components/Modal';
import { ProgrammingLanguageFormFields } from './ProgrammingLanguageFormFields';
import type { ProgrammingLanguageRequest } from '../../types/programmingLanguage';

interface CreateLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProgrammingLanguageRequest) => void;
    isPending: boolean;
}

export const CreateLanguageModal: React.FC<CreateLanguageModalProps> = ({
    isOpen,
    onClose,
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

    const handleClose = () => {
        setFormData({ name: '', version: '', description: '', isSupported: false });
        setErrors({});
        onClose();
    };

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
        if (validate()) {
            onSubmit(formData);
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', version: '', description: '', isSupported: false });
            setErrors({});
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Programming Language"
            size="md"
            actions={
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        form="create-language-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Creating...' : 'Create Language'}
                    </button>
                </div>
            }
        >
            <form id="create-language-form" onSubmit={handleSubmit}>
                <ProgrammingLanguageFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="create-"
                />
            </form>
        </Modal>
    );
};
