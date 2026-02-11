import React, { useState, useEffect } from 'react';
import { Download, FileCheck, AlertCircle, X } from 'lucide-react';
import { Modal } from '../modal/Modal.tsx';
import { Button } from '../ui/button';
import { downloadTemplate } from '../../hooks/useAssessment';
import { useToast } from '../../hooks/use-toast';
import type { ImportResult } from '../../types/assessmentType';

interface ImportAssessmentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (file: File) => void;
    isPending: boolean;
    importResult: ImportResult | null;
    onSuccess?: () => void;
}

export const ImportAssessmentDialog: React.FC<ImportAssessmentDialogProps> = ({
    isOpen,
    onClose,
    onImport,
    isPending,
    importResult,
    onSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [hasShownSuccess, setHasShownSuccess] = useState(false);
    const { toast } = useToast();

    // Reset file when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
            setHasShownSuccess(false);
        }
    }, [isOpen]);

    // Handle successful import with enhanced feedback
    useEffect(() => {
        if (importResult && !isPending && !hasShownSuccess) {
            setHasShownSuccess(true);

            if (importResult.successCount > 0) {
                const message = importResult.errorCount > 0
                    ? `Import partially successful: ${importResult.successCount} added, ${importResult.errorCount} failed`
                    : `Import successful: ${importResult.successCount} assessment types added`;

                toast({
                    variant: "success",
                    title: "Import Success",
                    description: message,
                });
            }

            if (importResult.errorCount > 0 && importResult.successCount === 0) {
                toast({
                    variant: "destructive",
                    title: "Import Failed",
                    description: `Import failed: ${importResult.errorCount} errors. Check details below.`,
                });
            }

            // Auto-close on full success after a delay
            if (importResult.successCount > 0 && importResult.errorCount === 0) {
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 2000);
            }
        }
    }, [importResult, isPending, hasShownSuccess, onSuccess, onClose, toast]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Assessment Types"
            size="md"
            actions={
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        {importResult && importResult.successCount > 0 && importResult.errorCount === 0 ? 'Done' : 'Cancel'}
                    </Button>
                    {selectedFile && !isPending && (
                        <Button
                            onClick={handleImport}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <FileCheck size={16} />
                            Start Import
                        </Button>
                    )}
                    {isPending && (
                        <Button disabled>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                            Importing...
                        </Button>
                    )}
                </div>
            }
        >
            <div className="space-y-6">
                {/* Format Requirements */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">File Format Requirements</h4>
                            <ul className="text-xs text-blue-800 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                    Excel file (.xlsx format only)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                    Header row must contain: <strong>Name</strong> (required), Description (required)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                    Column order doesn't matter - headers will be matched by name
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                    Use the template below for best results
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Step 1: Download Template */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Step 1: Download Template</h3>
                    <Button
                        onClick={() => downloadTemplate(toast)}
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Download className="h-4 w-4" />
                        Download Template
                    </Button>
                </div>

                {/* Step 2: Select File */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Step 2: Select File</h3>
                    <div className="space-y-2">
                        <input
                            type="file"
                            id="assessment-import"
                            className="hidden"
                            accept=".xlsx"
                            onChange={handleFileChange}
                            disabled={isPending}
                        />
                        {!selectedFile ? (
                            <label
                                htmlFor="assessment-import"
                                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            >
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-blue-600">
                                    <FileCheck size={24} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Choose Excel File</span>
                                {/* <span className="text-xs text-gray-500 mt-1">Maximum size: 10MB</span> */}
                            </label>
                        ) : (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 w-full">
                                <FileCheck className="text-green-600" size={20} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-400"
                                    disabled={isPending}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 3: results */}
                {importResult && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            {importResult.errorCount === 0 ? (
                                <FileCheck className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                            )}
                            <h3 className="text-sm font-medium text-gray-900">Import Results</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`p-3 rounded-lg border ${importResult.successCount > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="text-xs text-gray-600 mb-1">Successful</div>
                                <div className={`text-lg font-semibold ${importResult.successCount > 0 ? 'text-green-600' : 'text-gray-400'
                                    }`}>
                                    {importResult.successCount}
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg border ${importResult.errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                                }`}>
                                <div className="text-xs text-gray-600 mb-1">Failed</div>
                                <div className={`text-lg font-semibold ${importResult.errorCount > 0 ? 'text-red-600' : 'text-gray-400'
                                    }`}>
                                    {importResult.errorCount}
                                </div>
                            </div>
                        </div>

                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="border border-red-200 rounded-lg overflow-hidden">
                                <div className="bg-red-50 px-4 py-2 border-b border-red-200">
                                    <span className="text-xs font-bold text-red-800 uppercase">Import Errors</span>
                                </div>
                                <div className="max-h-32 overflow-y-auto p-4 bg-white space-y-2">
                                    {importResult.errors.map((err, i) => (
                                        <p key={i} className="text-xs text-red-600 italic">
                                            Row {err.row}: {err.message}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {importResult.successCount > 0 && importResult.errorCount === 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm text-green-800 font-medium">
                                    ✅ All assessment types imported successfully!
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
