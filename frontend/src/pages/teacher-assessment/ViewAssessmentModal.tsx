import React from 'react';

import { Badge } from '@/components/ui/badge';
import type { Assessment } from '../../types/assessment';
import { Modal } from '@/components/modal/Modal';

interface ViewAssessmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: Assessment | null;
}

export const ViewAssessmentModal: React.FC<ViewAssessmentModalProps> = ({
    isOpen,
    onClose,
    assessment,
}) => {
    if (!assessment) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-50 text-green-600 border-green-100';
            case 'INACTIVE':
                return 'bg-red-50 text-red-600 border-red-100';
            case 'DRAFT':
                return 'bg-gray-50 text-gray-600 border-gray-100';
            default:
                return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assessment Details"
            size="lg"
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                >
                    Close
                </button>
            }
        >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Code and Status */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Code</h4>
                        <p className="text-sm font-mono text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {assessment.code}
                        </p>
                    </div>
                    <Badge
                        className={`ml-4 font-medium border shadow-none ${getStatusBadgeStyle(assessment.status)}`}
                        variant="outline"
                    >
                        {assessment.status}
                    </Badge>
                </div>

                {/* Title */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Title</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                        {assessment.title}
                    </p>
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border whitespace-pre-wrap">
                        {assessment.description || 'No description provided'}
                    </p>
                </div>

                {/* Assessment Type */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assessment Type</h4>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                        {assessment.assessmentTypeName || 'Not specified'}
                    </p>
                </div>

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Score</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {assessment.totalScore}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pass Score</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {assessment.passScore}
                        </p>
                    </div>
                </div>

                {/* Time and Attempts */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Time Limit</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {assessment.timeLimitMinutes} minutes
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attempt Limit</h4>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {assessment.attemptLimit}
                        </p>
                    </div>
                </div>

                {/* Shuffle Options */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Options</h4>
                    <div className="flex gap-2">
                        {assessment.isShuffleQuestion && (
                            <Badge variant="outline" className="text-xs">Shuffle Questions</Badge>
                        )}
                        {assessment.isShuffleOption && (
                            <Badge variant="outline" className="text-xs">Shuffle Options</Badge>
                        )}
                        {!assessment.isShuffleQuestion && !assessment.isShuffleOption && (
                            <span className="text-sm text-gray-500">No shuffle options enabled</span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Created At</h4>
                        <p className="text-sm text-gray-700">{formatDate(assessment.createdAt)}</p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Updated</h4>
                        <p className="text-sm text-gray-700">{formatDate(assessment.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
