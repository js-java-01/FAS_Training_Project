import React from 'react';
import { Modal } from '../../components/Modal';
import type { ProgrammingLanguage } from '../../types/programmingLanguage';

interface ViewLanguageModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: ProgrammingLanguage | null;
}

export const ViewLanguageModal: React.FC<ViewLanguageModalProps> = ({
    isOpen,
    onClose,
    language,
}) => {
    if (!language) return null;

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
            title="Programming Language Details"
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
                        {language.name}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Version</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                        {language.version || 'Not specified'}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap">
                        {language.description || 'No description provided'}
                    </p>
                </div>

                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Support Status</h4>
                    <p className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                            language.isSupported
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {language.isSupported ? 'Supported' : 'Not Supported'}
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</h4>
                        <p className="text-sm text-gray-700">{formatDate(language.createdAt)}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</h4>
                        <p className="text-sm text-gray-700">{formatDate(language.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
