import React from 'react';
import { Modal } from '@/components/modal/Modal';
import type { QuestionTag } from '../../types/feature/assessment/question-tag';
import { Badge } from '@/components/ui/badge';
import { Hash } from 'lucide-react';

interface ViewQuestionTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    tag: QuestionTag | null;
}

export const ViewQuestionTagModal: React.FC<ViewQuestionTagModalProps> = ({
    isOpen,
    onClose,
    tag,
}) => {
    if (!tag) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Question Tag Details"
            size="md"
            actions={
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                    Close
                </button>
            }
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tag ID
                    </label>
                    <p className="text-gray-900 font-mono">#{tag.id}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tag Name
                    </label>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-base py-1 px-3">
                        <Hash className="h-4 w-4 mr-1" />
                        {tag.name}
                    </Badge>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border">
                        {tag.description}
                    </p>
                </div>

                {tag.createdAt && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Created At
                        </label>
                        <p className="text-gray-900">
                            {new Date(tag.createdAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}

                {tag.updatedAt && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Updated
                        </label>
                        <p className="text-gray-900">
                            {new Date(tag.updatedAt).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
