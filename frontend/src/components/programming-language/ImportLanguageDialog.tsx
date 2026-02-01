import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Modal } from '../Modal';
import { downloadTemplate } from '../../hooks/useProgrammingLanguages';
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
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Reset file selection when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFile(null);
        }
    }, [isOpen]);

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
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                        Close
                    </button>
                    {selectedFile && !isPending && (
                        <button
                            onClick={handleImport}
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-blue-400"
                        >
                            Import Languages
                        </button>
                    )}
                    {isPending && (
                        <div className="px-4 py-2 text-blue-600 text-sm font-medium">
                            Importing...
                        </div>
                    )}
                </>
            }
        >
            <div className="space-y-5">
                {/* Step 1: Download Template */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Step 1: Download Template</h3>
                    <button
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                        <Download className="h-4 w-4" />
                        Download Template
                    </button>
                </div>

                {/* Step 2: Select File */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Step 2: Select File</h3>
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                    />
                </div>

                {/* Step 3: Preview/Import */}
                {selectedFile && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Step 3: Import</h3>
                        <div className="bg-gray-50 p-3 rounded border">
                            <p className="text-sm text-gray-600">
                                Selected file: <span className="font-medium">{selectedFile.name}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Import Results (BR-PL-06) */}
                {importResult && (
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Import Results</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Successful:</span>
                                <span className="font-medium">{importResult.successCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-red-600">Failed:</span>
                                <span className="font-medium">{importResult.failureCount}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
