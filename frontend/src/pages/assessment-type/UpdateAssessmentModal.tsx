import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/modal/Modal';
import { AssessmentFormFields } from './AssessmentFormFields';
import type { AssessmentType, AssessmentTypeRequest } from '@/types';

interface UpdateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: AssessmentType | null;
    onSubmit: (id: string, data: AssessmentTypeRequest) => void;
    isPending: boolean;
}

export const UpdateAssessmentModal: React.FC<UpdateAssessmentModalProps> = ({
    isOpen,
    onClose,
    assessment,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<AssessmentTypeRequest>({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && assessment) {
            setFormData({
                name: assessment.name,
                description: assessment.description,
            });
            setErrors({});
        }
    }, [isOpen, assessment]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (assessment && validate()) {
            onSubmit(assessment.id, formData);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Assessment Type"
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
                        form="update-assessment-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Updating...' : 'Update Assessment'}
                    </button>
                </div>
            }
        >
            <form id="update-assessment-form" onSubmit={handleSubmit}>
                <AssessmentFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="update-"
                />
            </form>
        </Modal>
    );
};
