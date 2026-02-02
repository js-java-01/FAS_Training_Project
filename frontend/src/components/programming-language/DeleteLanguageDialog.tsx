import React from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../Modal';
import type { ProgrammingLanguage } from '../../types/programmingLanguage';

interface DeleteLanguageDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** The language to delete */
    language: ProgrammingLanguage | null;
    /** Callback when delete is confirmed */
    onConfirm: () => void;
    /** Whether the delete mutation is pending */
    isPending: boolean;
}

/**
 * Confirmation dialog for deleting a programming language (3.2.9.3)
 * 
 * Shows a warning message with the language name and requires
 * explicit confirmation before proceeding.
 */
export const DeleteLanguageDialog: React.FC<DeleteLanguageDialogProps> = ({
    isOpen,
    onClose,
    language,
    onConfirm,
    isPending,
}) => {
    return (
        <Modal
            isOpen={isOpen && !!language}
            onClose={onClose}
            title="Delete Programming Language"
            size="sm"
            actions={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 shadow-sm disabled:bg-red-400"
                    >
                        {isPending ? 'Deleting...' : 'Delete'}
                    </button>
                </>
            }
        >
            {language && (
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                            <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete <strong>{language.name}</strong>?
                            This action cannot be undone.
                        </p>
                    </div>
                </div>
            )}
        </Modal>
    );
};
