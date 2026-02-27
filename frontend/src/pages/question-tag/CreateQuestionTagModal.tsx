import React, { useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { QuestionTagFormFields } from './QuestionTagFormFields';
import type { QuestionTagRequest } from '../../types/questionTag';

interface CreateQuestionTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: QuestionTagRequest) => void;
    isPending: boolean;
}

export const CreateQuestionTagModal: React.FC<CreateQuestionTagModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<QuestionTagRequest>({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClose = () => {
        setFormData({ name: '', description: '' });
        setErrors({});
        onClose();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Tag name is required';
        if (formData.name.length > 100) newErrors.name = 'Tag name must be less than 100 characters';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length > 500) newErrors.description = 'Description must be less than 500 characters';
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
            setFormData({ name: '', description: '' });
            setErrors({});
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Question Tag"
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
                        form="create-question-tag-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Creating...' : 'Create Tag'}
                    </button>
                </div>
            }
        >
            <form id="create-question-tag-form" onSubmit={handleSubmit}>
                <QuestionTagFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="create-"
                />
            </form>
        </Modal>
    );
};
