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
import { Modal } from '../modal/Modal.tsx';
import { useToast } from '../../hooks/use-toast';
import { programmingLanguageApi } from '../../api/programmingLanguageApi';
import type { 
    ExportFormat, 
    ExportRequest, 
    ExportPreviewResponse 
} from '../../types/programmingLanguage';

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
                selectedFields: selectedFields.length > 0 ? selectedFields : ['id', 'name', 'version', 'description', 'isSupported'],
                format
            };
            const response = await programmingLanguageApi.getExportPreview(request);
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
            const blob = await programmingLanguageApi.downloadExport(request);
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const extension = format === 'EXCEL' ? 'xlsx' : format.toLowerCase();
            link.download = `programming-languages-${new Date().toISOString().split('T')[0]}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast({
                variant: "success",
                title: "Export Successful",
                description: `Programming languages exported to ${format.toLowerCase()} format successfully!`,
            });
            
            onClose();
        } catch (error: any) {
            console.error('Export failed:', error);
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: error.response?.data?.message || 'Error exporting programming languages',
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
            title="Export Programming Languages"
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
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                            >
                                Search
                            </button>
                        </div>

                        {/* Field Filters */}
                        <div className="flex gap-2">
                            <select
                                value={filters.isSupported ?? ''}
                                onChange={(e) => setFilters(prev => 
                                    e.target.value 
                                        ? { ...prev, isSupported: e.target.value }
                                        : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== 'isSupported'))
                                )}
                                className="flex-1 border border-gray-300 rounded px-2 py-2 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="true">Supported</option>
                                <option value="false">Not Supported</option>
                            </select>
                        </div>
                    </div>

                    {/* Export Options */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">Export Options</h3>
                        
                        {/* Format Selection */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormat('EXCEL')}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                                    format === 'EXCEL' 
                                        ? 'border-green-500 bg-green-50 text-green-700' 
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                            </button>
                            <button
                                onClick={() => setFormat('CSV')}
                                className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                                    format === 'CSV' 
                                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <FileText className="h-4 w-4" />
                                CSV
                            </button>
                        </div>

                        {/* Total Entries */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Export limit:</label>
                            <select
                                value={totalEntries ?? ''}
                                onChange={(e) => setTotalEntries(e.target.value ? Number(e.target.value) : undefined)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value="">All records</option>
                                <option value="10">10 records</option>
                                <option value="50">50 records</option>
                                <option value="100">100 records</option>
                                <option value="500">500 records</option>
                                <option value="1000">1000 records</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Field Selection */}
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Select Columns to Export</h3>
                    <div className="flex flex-wrap gap-2">
                        {previewData?.availableFields.map((field) => (
                            <label
                                key={field.name}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-sm ${
                                    selectedFields.includes(field.name)
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedFields.includes(field.name)}
                                    onChange={() => handleFieldToggle(field.name)}
                                    className="sr-only"
                                />
                                {field.label}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Preview Table */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-gray-700">
                            Preview ({previewData?.totalElements ?? 0} records)
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={size}
                                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                            </select>
                        </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        {isLoadingPreview ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                <p className="mt-2 text-sm text-gray-500">Loading preview...</p>
                            </div>
                        ) : previewData && previewData.content.length > 0 ? (
                            <>
                                <div className="overflow-x-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                {selectedFields.map((field) => (
                                                    <th
                                                        key={field}
                                                        onClick={() => handleSort(field)}
                                                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                                    >
                                                        <div className="flex items-center gap-1">
                                                            {previewData.availableFields.find(f => f.name === field)?.label ?? field}
                                                            {getSortIcon(field)}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {previewData.content.map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50">
                                                    {selectedFields.map((field) => (
                                                        <td key={field} className="px-4 py-2 text-gray-900">
                                                            {formatCellValue(row[field])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {previewData.totalPages > 1 && (
                                    <div className="px-4 py-2 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                                        <span className="text-sm text-gray-600">
                                            Page {page + 1} of {previewData.totalPages}
                                        </span>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setPage(p => p - 1)}
                                                disabled={page === 0}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setPage(p => p + 1)}
                                                disabled={page >= previewData.totalPages - 1}
                                                className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No data to preview
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

// ==================== Helpers ====================

function formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}
