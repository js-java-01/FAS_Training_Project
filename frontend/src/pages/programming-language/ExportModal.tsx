import React, { useState, useEffect, useCallback } from 'react';
import {
    Download,
    Search,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    FileSpreadsheet,
    FileText,
    Loader2
} from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useToast } from '../../hooks/use-toast';
import { assessmentTypeApi } from '../../api/assessmentTypeApi';
import type {
    ExportFormat,
    ExportRequest,
    ExportPreviewResponse
} from '../../types/assessmentExport';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Export Preview Modal
 * 
 * Allows users to:
 * - Preview data before exporting
 * - Select fields/columns to export
 * - Configure pagination and sorting
 * - Apply filters
 * - Choose export format
 */
export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    // ========================================
    // State: Preview Data
    // ========================================
    const [previewData, setPreviewData] = useState<ExportPreviewResponse | null>(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // ========================================
    // State: Export Configuration
    // ========================================
    const [keyword, setKeyword] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [sortBy, setSortBy] = useState('name');
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>('ASC');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalEntries, setTotalEntries] = useState<number | undefined>(undefined);
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [format, setFormat] = useState<ExportFormat>('EXCEL');

    // ========================================
    // Load Preview
    // ========================================
    const loadPreview = useCallback(async () => {
        setIsLoadingPreview(true);
        try {
            const request: ExportRequest = {
                keyword: keyword || undefined,
                filters: Object.keys(filters).length > 0 ? filters : undefined,
                sortBy,
                sortDirection,
                page,
                size,
                selectedFields: selectedFields.length > 0 ? selectedFields : ['name', 'description'],
                format
            };
            const response = await assessmentTypeApi.getExportPreview(request);
            setPreviewData(response);

            // Initialize selected fields from available fields on first load
            if (selectedFields.length === 0 && response.availableFields.length > 0) {
                setSelectedFields(
                    response.availableFields
                        .filter(f => f.defaultSelected)
                        .map(f => f.name)
                );
            }
        } catch (error) {
            console.error('Failed to load preview:', error);
        } finally {
            setIsLoadingPreview(false);
        }
    }, [keyword, filters, sortBy, sortDirection, page, size, selectedFields, format]);

    // Load preview when modal opens or config changes
    useEffect(() => {
        if (isOpen) {
            loadPreview();
        }
    }, [isOpen, page, size, sortBy, sortDirection, loadPreview]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setKeyword('');
            setFilters({});
            setSortBy('name');
            setSortDirection('ASC');
            setPage(0);
            setSize(10);
            setTotalEntries(undefined);
            setSelectedFields([]);
            setPreviewData(null);
        }
    }, [isOpen]);

    // ========================================
    // Event Handlers
    // ========================================
    const handleSearch = () => {
        setPage(0);
        loadPreview();
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortDirection(prev => prev === 'ASC' ? 'DESC' : 'ASC');
        } else {
            setSortBy(field);
            setSortDirection('ASC');
        }
        setPage(0);
    };

    const handleFieldToggle = (fieldName: string) => {
        setSelectedFields(prev =>
            prev.includes(fieldName)
                ? prev.filter(f => f !== fieldName)
                : [...prev, fieldName]
        );
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const request: ExportRequest = {
                keyword: keyword || undefined,
                filters: Object.keys(filters).length > 0 ? filters : undefined,
                sortBy,
                sortDirection,
                totalEntries,
                selectedFields,
                format
            };
            const blob = await assessmentTypeApi.export(request);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'EXCEL' ? 'xlsx' : format.toLowerCase();
            link.download = `assessment-types-${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                variant: "success",
                title: "Export Successful",
                description: `Assessment types exported to ${format.toLowerCase()} format successfully!`,
            });

            onClose();
        } catch (error: any) {
            console.error('Export failed:', error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: error.response?.data?.message || 'Error exporting assessment.ts types',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const getSortIcon = (field: string) => {
        if (sortBy !== field) {
            return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
        }
        return sortDirection === 'ASC'
            ? <ArrowUp className="h-4 w-4 text-blue-500" />
            : <ArrowDown className="h-4 w-4 text-blue-500" />;
    };

    // ========================================
    // Render
    // ========================================
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Assessment Types"
            size="xl"
            actions={
                <>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || selectedFields.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                    >
                        {isExporting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export {totalEntries ?? previewData?.totalElements ?? 0} Records
                            </>
                        )}
                    </button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Configuration Section */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Search & Filters */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Search & Filters</h3>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                            >
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Export Format</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormat('EXCEL')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${format === 'EXCEL'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-200'
                                    }`}
                            >
                                <FileSpreadsheet className="h-6 w-6 mb-1" />
                                <span className="text-xs font-medium">Excel</span>
                            </button>
                            <button
                                onClick={() => setFormat('CSV')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${format === 'CSV'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-200'
                                    }`}
                            >
                                <FileText className="h-6 w-6 mb-1" />
                                <span className="text-xs font-medium">CSV</span>
                            </button>
                            <button
                                onClick={() => setFormat('PDF')}
                                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${format === 'PDF'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-blue-200'
                                    }`}
                            >
                                <FileText className="h-6 w-6 mb-1" />
                                <span className="text-xs font-medium">PDF</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Field Selection */}
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-700">Fields to Export</h3>
                    <div className="flex flex-wrap gap-2">
                        {previewData?.availableFields.map((field) => (
                            <button
                                key={field.name}
                                onClick={() => handleFieldToggle(field.name)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedFields.includes(field.name)
                                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                                    }`}
                            >
                                {field.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Preview Table */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-700">Preview Data</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                                Total: {previewData?.totalElements || 0}
                            </span>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {selectedFields.map(field => {
                                            const fieldInfo = previewData?.availableFields.find(f => f.name === field);
                                            return (
                                                <th
                                                    key={field}
                                                    onClick={() => handleSort(field)}
                                                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                >
                                                    <div className="flex items-center gap-1">
                                                        {fieldInfo?.label || field}
                                                        {getSortIcon(field)}
                                                    </div>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoadingPreview ? (
                                        <tr>
                                            <td colSpan={selectedFields.length} className="px-4 py-8 text-center text-gray-500">
                                                <div className="flex justify-center items-center gap-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Loading preview...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : previewData?.content.length === 0 ? (
                                        <tr>
                                            <td colSpan={selectedFields.length} className="px-4 py-8 text-center text-gray-500">
                                                No data matching your criteria
                                            </td>
                                        </tr>
                                    ) : (
                                        previewData?.content.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                {selectedFields.map(field => (
                                                    <td key={field} className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                                                        {String(row[field] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                    Rows per page:
                                </span>
                                <select
                                    value={size}
                                    onChange={(e) => setSize(Number(e.target.value))}
                                    className="text-xs border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <span className="text-xs text-gray-700">
                                    Page {page + 1} of {previewData?.totalPages || 1}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min((previewData?.totalPages || 1) - 1, p + 1))}
                                    disabled={page >= (previewData?.totalPages || 1) - 1}
                                    className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
