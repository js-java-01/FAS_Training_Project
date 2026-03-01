import React from 'react';

import { getLanguageBadgeStyle, getSupportedBadgeStyle, formatDate, displayValue } from './utils';
import type { ProgrammingLanguage } from '../../types/feature/assessment/programming-language';
import { Modal } from '@/components/modal/Modal';

interface ViewLanguageModalProps {
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback when modal is closed */
    onClose: () => void;
    /** The language to display */
    language: ProgrammingLanguage | null;
}

/**
 * Modal for viewing programming language details (3.2.9.6)
 * 
 * Read-only display of all language properties including
 * audit timestamps.
 */
export const ViewLanguageModal: React.FC<ViewLanguageModalProps> = ({
    isOpen,
    onClose,
    language,
}) => {
    return (
        <Modal
            isOpen={isOpen && !!language}
            onClose={onClose}
            title="Programming Language Details"
            size="md"
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 shadow-sm"
                >
                    Close
                </button>
            }
        >
            {language && (
                <div className="space-y-5">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getLanguageBadgeStyle(language.name)}`}>
                                {language.name}
                            </span>
                        </div>
                    </div>

                    {/* Version */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
                        <p className="text-sm text-gray-900">{displayValue(language.version)}</p>
                    </div>

                    {/* Supported Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supported</label>
                        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getSupportedBadgeStyle(language.isSupported)}`}>
                            {language.isSupported ? 'Supported' : 'Not Supported'}
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{displayValue(language.description)}</p>
                    </div>

                    {/* Audit Information */}
                    <div className="pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                            <div>
                                <span className="font-medium">Created:</span>
                                <br />
                                {formatDate(language.createdAt)}
                            </div>
                            <div>
                                <span className="font-medium">Updated:</span>
                                <br />
                                {formatDate(language.updatedAt)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};
