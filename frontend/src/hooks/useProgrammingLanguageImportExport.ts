import { useState } from 'react';
import { programmingLanguageApi } from '../api/programmingLanguageApi';
import { toast } from '../lib/toast';
import type { ImportResult } from '../types/programmingLanguage';

export const useProgrammingLanguageImportExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    const exportToFile = async () => {
        try {
            setIsExporting(true); // BR-PL-05: Disable export button while processing
            const blob = await programmingLanguageApi.export();
            
            const today = new Date().toISOString().split('T')[0];
            const filename = `programming-languages-${today}.xlsx`;
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Programming languages exported successfully!');
            return { success: true };
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Error exporting programming languages';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsExporting(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const blob = await programmingLanguageApi.downloadTemplate();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'programming-languages-template.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('Template downloaded successfully!');
            return { success: true };
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Error downloading template';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const importFromFile = async (file: File, onSuccess?: () => void) => {
        try {
            setIsImporting(true);
            const result = await programmingLanguageApi.import(file);
            
            setImportResult(result);
            // BR-PL-06: Display count of successful/failed rows
            toast.success(`Import completed: ${result.successCount} successful, ${result.failureCount} failed`);
            
            if (result.successCount > 0) {
                onSuccess?.(); // Trigger reload if any successful imports
            }
            
            return { success: true, result };
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || 'Error importing programming languages';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setIsImporting(false);
        }
    };

    const downloadErrorReport = () => {
        if (!importResult?.errors) return;
        
        const csv = 'Row,Error\n' + importResult.errors.map(e => `${e.row},"${e.message}"`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'import-errors.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const clearImportResult = () => {
        setImportResult(null);
    };

    return {
        isExporting,
        isImporting,
        importResult,
        exportToFile,
        downloadTemplate,
        importFromFile,
        downloadErrorReport,
        clearImportResult,
    };
};