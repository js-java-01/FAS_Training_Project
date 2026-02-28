import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings, SquarePen, Trash2, Copy } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';
import ActionBtn from '@/components/data_table/ActionBtn';
import type { Assessment } from '@/types/feature/assessment/assessment';

interface AssessmentCardProps {
    assessment: Assessment;
    onView?: (assessment: Assessment) => void;
    onEdit?: (assessment: Assessment) => void;
    onDelete?: (assessment: Assessment) => void;
}

const getStatusBadgeStyle = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100';
        case 'INACTIVE':
            return 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100';
        case 'DRAFT':
            return 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100';
        default:
            return 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100';
    }
};

const getTypeBadgeStyle = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('exam')) return 'bg-red-50 text-red-600 border-red-100';
    if (lowerType.includes('assignment')) return 'bg-cyan-50 text-cyan-600 border-cyan-100';
    if (lowerType.includes('quiz')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-purple-50 text-purple-600 border-purple-100';
};

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
    assessment,
    onView,
    onEdit,
    onDelete,
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{assessment.title}</h3>
                        <Badge
                            className={`text-xs font-medium border shadow-none ${getTypeBadgeStyle(assessment.assessmentTypeName || '')}`}
                            variant="outline"
                        >
                            {assessment.assessmentTypeName || 'N/A'}
                        </Badge>
                    </div>
                    <Badge
                        className={`text-xs font-medium border shadow-none ${getStatusBadgeStyle(assessment.status)}`}
                        variant="outline"
                    >
                        {assessment.status}
                    </Badge>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 py-3 border-t border-b">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {assessment.passScore}/{assessment.totalScore}
                    </div>
                    <div className="text-xs text-gray-500">Pass/Total Score</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{assessment.attemptLimit}</div>
                    <div className="text-xs text-gray-500">Attempts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700">{assessment.timeLimitMinutes}</div>
                    <div className="text-xs text-gray-500">Minutes</div>
                </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2" title={assessment.description}>
                {assessment.description || 'No description'}
            </p>

            {/* Footer - Shuffle Info */}
            <div className="flex gap-2 mb-3 text-xs text-gray-500">
                {assessment.isShuffleQuestion && (
                    <Badge variant="outline" className="text-xs">Shuffle Questions</Badge>
                )}
                {assessment.isShuffleOption && (
                    <Badge variant="outline" className="text-xs">Shuffle Options</Badge>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex gap-2">
                    <ActionBtn
                        icon={<Eye size={16} />}
                        onClick={() => onView?.(assessment)}
                        tooltipText="Preview"
                        className="text-blue-600 hover:text-blue-700"
                    />
                    <ActionBtn
                        icon={<Copy size={16} />}
                        onClick={() => { }}
                        tooltipText="Duplicate"
                        className="text-gray-600 hover:text-gray-700"
                    />
                    <ActionBtn
                        icon={<Settings size={16} />}
                        onClick={() => { }}
                        tooltipText="Settings"
                        className="text-gray-600 hover:text-gray-700"
                    />
                </div>
                <div className="flex gap-2">
                    <PermissionGate permission="ASSESSMENT_UPDATE">
                        <ActionBtn
                            icon={<SquarePen size={16} />}
                            onClick={() => onEdit?.(assessment)}
                            tooltipText="Edit"
                        />
                    </PermissionGate>
                    <PermissionGate permission="ASSESSMENT_DELETE">
                        <ActionBtn
                            icon={<Trash2 size={16} />}
                            onClick={() => onDelete?.(assessment)}
                            className="hover:text-red-500 hover:border-red-500"
                            tooltipText="Delete"
                        />
                    </PermissionGate>
                </div>
            </div>

            {/* Creator Info */}
            <div className="text-xs text-gray-400 mt-2">
                Created: {new Date(assessment.createdAt).toLocaleDateString('en-GB')}
            </div>
        </div>
    );
};
