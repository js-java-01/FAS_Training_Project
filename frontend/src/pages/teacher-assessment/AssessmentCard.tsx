import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Eye, SquarePen, Trash2 } from 'lucide-react';
import { PermissionGate } from '@/components/PermissionGate';
import ActionBtn from '@/components/data_table/ActionBtn';
import type { Assessment } from '@/types';

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
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden h-full flex flex-col min-w-[360px]">
            {/* Header with gradient accent */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-7 py-6 border-b">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 truncate" title={assessment.title}>
                            {assessment.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                                className={`text-sm font-semibold border shadow-sm px-3 py-1 ${getTypeBadgeStyle(assessment.assessmentTypeName || '')}`}
                                variant="outline"
                            >
                                {assessment.assessmentTypeName || 'N/A'}
                            </Badge>
                            <Badge
                                className={`text-sm font-semibold border shadow-sm px-3 py-1 ${getStatusBadgeStyle(assessment.status)}`}
                                variant="outline"
                            >
                                {assessment.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                        <ActionBtn
                            icon={<Eye size={18} />}
                            onClick={() => onView?.(assessment)}
                            tooltipText="View"
                            className="h-9 w-9 hover:bg-white/50"
                        />
                        <PermissionGate permission="ASSESSMENT_UPDATE">
                            <ActionBtn
                                icon={<SquarePen size={18} />}
                                onClick={() => onEdit?.(assessment)}
                                tooltipText="Edit"
                                className="h-9 w-9 hover:bg-white/50"
                            />
                        </PermissionGate>
                        <PermissionGate permission="ASSESSMENT_DELETE">
                            <ActionBtn
                                icon={<Trash2 size={18} />}
                                onClick={() => onDelete?.(assessment)}
                                tooltipText="Delete"
                                className="h-9 w-9 hover:bg-white/50 hover:text-red-600"
                            />
                        </PermissionGate>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="px-7 py-6 flex-1 flex flex-col">
                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border border-blue-100 min-w-0">
                        <div className="text-3xl font-bold text-blue-600 mb-1 whitespace-nowrap">
                            {assessment.passScore}<span className="text-xl text-gray-400">/{assessment.totalScore}</span>
                        </div>
                        <div className="text-xs font-medium text-gray-600 text-center leading-tight">Pass/Total<br />Score</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 min-w-0">
                        <div className="text-3xl font-bold text-gray-700 mb-1">{assessment.attemptLimit}</div>
                        <div className="text-xs font-medium text-gray-600 text-center">Attempts</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200 min-w-0">
                        <div className="text-3xl font-bold text-gray-700 mb-1">{assessment.timeLimitMinutes}</div>
                        <div className="text-xs font-medium text-gray-600 text-center">Minutes</div>
                    </div>
                </div>

                {/* Description with fixed height */}
                <div className="mb-6 h-14">
                    <p className="text-base text-gray-600 line-clamp-2 leading-relaxed" title={assessment.description}>
                        {assessment.description || 'No description available'}
                    </p>
                </div>

                {/* Shuffle Options - Fixed height to maintain consistency */}
                <div className="flex gap-2 mb-6 min-h-[32px]">
                    {assessment.isShuffleQuestion && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200 px-2.5 py-1">
                            Shuffle Questions
                        </Badge>
                    )}
                    {assessment.isShuffleOption && (
                        <Badge variant="outline" className="text-xs bg-purple-50 text-purple-600 border-purple-200 px-2.5 py-1">
                            Shuffle Options
                        </Badge>
                    )}
                </div>

                {/* Footer - Pushed to bottom */}
                <div className="flex items-center justify-between pt-5 border-t text-sm text-gray-500 mt-auto">
                    <span>Created: {new Date(assessment.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}</span>
                    <span className="font-mono text-gray-400">{assessment.code}</span>
                </div>
            </div>
        </div>
    );
};
