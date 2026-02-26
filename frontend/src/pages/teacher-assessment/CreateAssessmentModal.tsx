import React, { useState } from 'react';

import { AssessmentFormFields } from './AssessmentFormFields';
import type { AssessmentCreateRequest } from '../../types/assessment';
import { Modal } from '@/components/modal/Modal';

interface CreateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AssessmentCreateRequest) => void;
    isPending: boolean;
}

export const CreateAssessmentModal: React.FC<CreateAssessmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<AssessmentCreateRequest>({
        code: '',
        title: '',
        description: '',
        assessmentTypeId: '',
        totalScore: 100,
        passScore: 60,
        timeLimitMinutes: 60,
        attemptLimit: 1,
        isShuffleQuestion: false,
        isShuffleOption: false,
        status: 'DRAFT',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleClose = () => {
        setFormData({
            code: '',
            title: '',
            description: '',
            assessmentTypeId: '',
            totalScore: 100,
            passScore: 60,
            timeLimitMinutes: 60,
            attemptLimit: 1,
            isShuffleQuestion: false,
            isShuffleOption: false,
            status: 'DRAFT',
        });
        setErrors({});
        onClose();
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.code.trim()) newErrors.code = 'Code is required';
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.assessmentTypeId) newErrors.assessmentTypeId = 'Assessment type is required';
        if (formData.totalScore <= 0) newErrors.totalScore = 'Total score must be greater than 0';
        if (formData.passScore <= 0) newErrors.passScore = 'Pass score must be greater than 0';
        if (formData.passScore > formData.totalScore) newErrors.passScore = 'Pass score cannot exceed total score';
        if (formData.timeLimitMinutes <= 0) newErrors.timeLimitMinutes = 'Time limit must be greater than 0';
        if (formData.attemptLimit <= 0) newErrors.attemptLimit = 'Attempt limit must be greater than 0';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    // Reset form when modal opens
    React.useEffect(() => {
        if (!isOpen) {
            // Only reset when closing
            setFormData({
                code: '',
                title: '',
                description: '',
                assessmentTypeId: '',
                totalScore: 100,
                passScore: 60,
                timeLimitMinutes: 60,
                attemptLimit: 1,
                isShuffleQuestion: false,
                isShuffleOption: false,
                status: 'DRAFT',
            });
            setErrors({});
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Create Assessment"
            size="lg"
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
                    onChange={(data) => setFormData(data as AssessmentCreateRequest)}
                    errors={errors}
                    idPrefix="create-"
                    isUpdate={false}
                />
            </form>
        </Modal>
    );
};
