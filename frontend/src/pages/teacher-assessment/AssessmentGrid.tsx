import React from 'react';
import { AssessmentCard } from './AssessmentCard';
import type { Assessment } from '@/types/feature/assessment/assessment';
import { Loader2 } from 'lucide-react';

interface AssessmentGridProps {
    assessments: Assessment[];
    isLoading: boolean;
    onView?: (assessment: Assessment) => void;
    onEdit?: (assessment: Assessment) => void;
    onDelete?: (assessment: Assessment) => void;
    headerActions?: React.ReactNode;
    keyword: string;
    onSearchChange: (value: string) => void;
    page: number;
    pageSize: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
}

export const AssessmentGrid: React.FC<AssessmentGridProps> = ({
    assessments,
    isLoading,
    onView,
    onEdit,
    onDelete,
    headerActions,
    keyword,
    onSearchChange,
    page,
    pageSize,
    totalPages,
    onPageChange,
    onPageSizeChange,
}) => {
    return (
        <div className="flex flex-col gap-4 h-full">
            {/* Search and Actions */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Enter title"
                    value={keyword}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {headerActions}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : assessments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <p className="text-lg font-medium">No assessments found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-auto">
                        {assessments.map((assessment) => (
                            <AssessmentCard
                                key={assessment.id}
                                assessment={assessment}
                                onView={onView}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="w-20 h-8 px-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">
                                Page {page + 1} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => onPageChange(page + 1)}
                                disabled={page >= totalPages - 1}
                                className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
