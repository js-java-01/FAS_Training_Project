import React from 'react';
import { Modal } from '../../components/Modal';
import type { QuestionCategory } from '../../types/questionCategory';

interface ViewQuestionCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: QuestionCategory | null;
}

export const ViewQuestionCategoryModal: React.FC<ViewQuestionCategoryModalProps> = ({
    isOpen,
    onClose,
    category,
}) => {
    if (!category) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Question Category Details"
            size="md"
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                    Close
                </button>
            }
        >
            <div className="space-y-6">
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Name</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                        {category.name}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap">
                        {category.description || 'No description provided'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</h4>
                        <p className="text-sm text-gray-700">{formatDate(category.createdAt)}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</h4>
                        <p className="text-sm text-gray-700">{formatDate(category.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
