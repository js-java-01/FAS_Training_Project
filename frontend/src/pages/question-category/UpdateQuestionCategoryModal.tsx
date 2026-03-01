import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/modal/Modal';

import { QuestionCategoryFormFields } from './QuestionCategoryFormFields';
import type { QuestionCategory, QuestionCategoryRequest } from '../../types/feature/assessment/question-category';

interface UpdateQuestionCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: QuestionCategory | null;
    onSubmit: (id: string, data: QuestionCategoryRequest) => void;
    isPending: boolean;
}

export const UpdateQuestionCategoryModal: React.FC<UpdateQuestionCategoryModalProps> = ({
    isOpen,
    onClose,
    category,
    onSubmit,
    isPending,
}) => {
    const [formData, setFormData] = useState<QuestionCategoryRequest>({
        name: '',
        description: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen && category) {
            setFormData({
                name: category.name,
                description: category.description,
            });
            setErrors({});
        }
    }, [isOpen, category]);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (category && validate()) {
            onSubmit(category.id, formData);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Question Category"
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
                        form="update-question-category-form"
                        type="submit"
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isPending ? 'Updating...' : 'Update Category'}
                    </button>
                </div>
            }
        >
            <form id="update-question-category-form" onSubmit={handleSubmit}>
                <QuestionCategoryFormFields
                    data={formData}
                    onChange={setFormData}
                    errors={errors}
                    idPrefix="update-"
                />
            </form>
        </Modal>
    );
};
