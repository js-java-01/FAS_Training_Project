import React from 'react';
import { Modal } from '../../components/Modal';
import { AlertCircle } from 'lucide-react';
import type { ProgrammingLanguage } from '../../types/programmingLanguage';

interface DeleteLanguageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    language: ProgrammingLanguage | null;
    onConfirm: () => void;
    isPending: boolean;
}

export const DeleteLanguageDialog: React.FC<DeleteLanguageDialogProps> = ({
    isOpen,
    onClose,
    language,
    onConfirm,
    isPending,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Delete Programming Language"
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
                    <p className="text-sm text-gray-900 font-medium">Are you sure you want to delete this programming language?</p>
                    <p className="mt-1 text-sm text-gray-500">
                        This action cannot be undone. This will permanently delete
                        <span className="font-semibold text-gray-700"> "{language?.name}"</span>.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
