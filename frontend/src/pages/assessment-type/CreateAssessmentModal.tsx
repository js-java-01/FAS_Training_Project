import React, { useState } from 'react';


import { AssessmentFormFields } from './AssessmentFormFields';
import type { AssessmentTypeRequest } from '../../types/assessmentType';
import { Modal } from '@/components/modal/Modal';

interface CreateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AssessmentTypeRequest) => void;
    isPending: boolean;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<AssessmentTypeRequest>({
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
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
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
            title="Create Assessment Type"
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
                        form="create-assessment-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Creating...' : 'Create Assessment'}
                    </button>
                </div>
            }
        >
            <form id="create-assessment-form" onSubmit={handleSubmit}>
                <AssessmentFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="create-"
                />
            </form>
        </Modal>
    );
};
