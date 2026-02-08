import React, { useState } from 'react';
import { Modal } from '../Modal';
import { LanguageFormFields } from './LanguageFormFields';
import { validateProgrammingLanguage } from '../../lib/programmingLanguageSchema';
import type { ProgrammingLanguageRequest } from '../../types/programmingLanguage';

interface CreateLanguageModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** Callback when form is submitted with valid data */
    onSubmit: (data: ProgrammingLanguageRequest) => void;
    /** Whether the create mutation is pending */
    isPending: boolean;
}

/**
 * Modal for creating a new programming language (3.2.9.1)
 * 
 * Handles its own form state and validation, calling onSubmit
 * only when validation passes.
 */
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
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClose = () => {
        setFormData({ name: '', version: '', description: '' });
        setErrors({});
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validation = validateProgrammingLanguage(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }
        setErrors({});
        onSubmit(formData);
    };

    // Reset form when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', version: '', description: '' });
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
                <>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        form="create-lang-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                    >
                        {isPending ? 'Creating...' : 'Create Language'}
                    </button>
                </>
            }
        >
            <form id="create-lang-form" onSubmit={handleSubmit} className="space-y-5">
                <LanguageFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="create-"
                />
            </form>
        </Modal>
    );
};
