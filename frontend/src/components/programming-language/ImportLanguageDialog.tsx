import React, { useState, useEffect } from 'react';
import { Download, FileCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../modal/Modal.tsx';
import { Button } from '../ui/button';
import { downloadTemplate } from '../../hooks/useProgrammingLanguages';
import { useToast } from '../../hooks/useToast.ts';
import type { ImportResult } from '../../types/programmingLanguage';

interface ImportLanguageDialogProps {
    /** Whether the dialog is open */
    isOpen: boolean;
    /** Callback when dialog is closed */
    onClose: () => void;
    /** Callback when import is submitted with selected file */
    onImport: (file: File) => void;
    /** Whether the import mutation is pending */
    isPending: boolean;
    /** Import results from the last import operation */
    importResult: ImportResult | null;
    /** Callback when import is successful */
    onSuccess?: () => void;
}

/**
 * Dialog for importing programming languages from Excel (3.2.9.4)
 * 
 * Provides a 3-step workflow:
 * 1. Download template
 * 2. Select filled Excel file
 * 3. Import and view results (BR-PL-06)
 */
export const ImportLanguageDialog: React.FC<ImportLanguageDialogProps> = ({
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

    // Reset file selection when dialog opens
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
                const message = importResult.failureCount > 0 
                    ? `Import partially successful: ${importResult.successCount} added, ${importResult.failureCount} failed`
                    : `Import successful: ${importResult.successCount} programming languages added`;
                
                toast({
                    variant: "success",
                    title: "Import Success",
                    description: message,
                });
            }
            
            if (importResult.failureCount > 0 && importResult.successCount === 0) {
                toast({
                    variant: "destructive",
                    title: "Import Failed", 
                    description: `Import failed: ${importResult.failureCount} errors. Check details below.`,
                });
            }
            
            // Auto-close on full success after a delay
            if (importResult.successCount > 0 && importResult.failureCount === 0) {
                setTimeout(() => {
                    onSuccess?.();
                    onClose();
                }, 2000);
            }
        }
    }, [importResult, isPending, hasShownSuccess, onSuccess, onClose]);

    const handleImport = () => {
        if (selectedFile) {
            onImport(selectedFile);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Import Programming Languages"
            size="md"
            actions={
                <>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        {importResult && importResult.successCount > 0 && importResult.failureCount === 0 ? 'Done' : 'Cancel'}
                    </Button>
                    {selectedFile && !isPending && (
                        <Button
                            onClick={handleImport}
                            disabled={isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <FileCheck className="h-4 w-4" />
                            Import Languages
                        </Button>
                    )}
                    {isPending && (
                        <Button disabled>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Importing...
                        </Button>
                    )}
                </>
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
                                    Header row must contain: <strong>Name</strong> (required), Version, Description
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
                            accept=".xlsx,.xls"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg"
                            disabled={isPending}
                        />
                        {selectedFile && (
                            <div className="text-xs text-gray-500">
                                💡 Tip: Make sure your Excel file has the headers as shown in the template
                            </div>
                        )}
                    </div>
                </div>

                {/* Step 3: Preview/Import */}
                {selectedFile && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Step 3: Import</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileCheck className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-900">Ready to import:</span>
                                </div>
                                <div className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                                {selectedFile.name}
                            </p>
                            {!isPending && !importResult && (
                                <div className="text-xs text-blue-600 font-medium">
                                    Click "Import Languages" to proceed
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Import Results (BR-PL-06) */}
                {importResult && (
                    <div className="border-t pt-4">
                        <div className="flex items-center gap-2 mb-3">
                            {importResult.failureCount === 0 ? (
                                <FileCheck className="h-5 w-5 text-green-600" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                            )}
                            <h3 className="text-sm font-medium text-gray-900">Import Results</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className={`p-3 rounded-lg border ${
                                importResult.successCount > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="text-xs text-gray-600 mb-1">Successful</div>
                                <div className={`text-lg font-semibold ${
                                    importResult.successCount > 0 ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                    {importResult.successCount}
                                </div>
                            </div>
                            <div className={`p-3 rounded-lg border ${
                                importResult.failureCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                            }`}>
                                <div className="text-xs text-gray-600 mb-1">Failed</div>
                                <div className={`text-lg font-semibold ${
                                    importResult.failureCount > 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                    {importResult.failureCount}
                                </div>
                            </div>
                        </div>
                        
                        {/* Display errors if any */}
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-xs font-medium text-red-800 mb-2 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Import Errors:
                                </h4>
                                <div className="max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-lg p-3">
                                    {importResult.errors.map((error, index) => (
                                        <div key={index} className="text-xs text-red-700 mb-2 last:mb-0">
                                            <span className="font-semibold">Row {error.row}:</span> {error.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Success message for complete success */}
                        {importResult.successCount > 0 && importResult.failureCount === 0 && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm text-green-800 font-medium">
                                    ✅ All programming languages imported successfully!
                                </div>
                                <div className="text-xs text-green-600 mt-1">
                                    This dialog will close automatically in a moment...
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
};
