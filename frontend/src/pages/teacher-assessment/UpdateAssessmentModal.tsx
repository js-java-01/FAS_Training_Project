import React, { useState } from 'react';
import { Modal } from '@/components/modal/Modal';
import { AssessmentFormFields } from './AssessmentFormFields';
import type { Assessment, AssessmentCreateRequest, AssessmentUpdateRequest } from '../../types/assessment';

interface UpdateAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: Assessment | null;
    onSubmit: (id: number, data: AssessmentUpdateRequest) => void;
    isPending: boolean;
}

export const UpdateAssessmentModal: React.FC<UpdateAssessmentModalProps> = ({
    isOpen,
    onClose,
    assessment,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<AssessmentUpdateRequest>({
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

    // Load assessment data when modal opens
    React.useEffect(() => {
        if (isOpen && assessment) {
            setFormData({
                title: assessment.title,
                description: assessment.description,
                assessmentTypeId: assessment.assessmentTypeId,
                totalScore: assessment.totalScore,
                passScore: assessment.passScore,
                timeLimitMinutes: assessment.timeLimitMinutes,
                attemptLimit: assessment.attemptLimit,
                isShuffleQuestion: assessment.isShuffleQuestion,
                isShuffleOption: assessment.isShuffleOption,
                status: assessment.status,
            });
            setErrors({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, assessment?.id]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
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
        if (assessment && validate()) {
            onSubmit(assessment.id, formData);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Assessment"
            size="lg"
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
                    data={{ ...formData, code: '' }}
                    onChange={(newData) => {
                        // Remove code field if it exists since it's not updateable
                        if ('code' in newData) {
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { code: _code, ...rest } = newData as AssessmentCreateRequest;
                            setFormData(rest);
                        } else {
                            setFormData(newData as AssessmentUpdateRequest);
                        }
                    }}
                    errors={errors}
                    idPrefix="update-"
                    isUpdate={true}
                />
            </form>
        </Modal>
    );
};
