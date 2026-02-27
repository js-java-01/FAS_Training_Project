import React from 'react';
import { AlertCircle, Hash } from 'lucide-react';
import type { QuestionTag } from '../../types/questionTag';
import { Modal } from '@/components/modal/Modal';
import { Badge } from '@/components/ui/badge';

interface DeleteQuestionTagDialogProps {
    isOpen: boolean;
    onClose: () => void;
    tag: QuestionTag | null;
    onConfirm: () => void;
    isPending: boolean;
}

export const DeleteQuestionTagDialog: React.FC<DeleteQuestionTagDialogProps> = ({
    isOpen,
    onClose,
    tag,
    onConfirm,
    isPending,
}) => {
    if (!tag) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Question Tag"
            size="sm"
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
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-red-400"
                    >
                        {isPending ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            }
        >
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-50 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <p className="text-gray-900 mb-4">
                        Are you sure you want to delete this tag? This action cannot be undone.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                        <div className="space-y-2">
                            <div>
                                <span className="text-sm text-gray-600">Tag ID: </span>
                                <span className="font-mono text-sm">#{tag.id}</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Tag Name: </span>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Hash className="h-3 w-3 mr-1" />
                                    {tag.name}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
