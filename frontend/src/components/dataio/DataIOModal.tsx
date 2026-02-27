import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExport } from "@/hooks/useExport";
import { useImport } from "@/hooks/useImport";
import type { ExportFormat } from "@/types/export";
import { DatabaseBackup } from "lucide-react";
import { useEffect, useState } from "react";
import { ExportTab } from "./ExportTab";
import { ImportTab } from "./ImportTab";
import ImportResultModal from "./ImportResultModal";

interface DataIOModalProps {
    entity: string;
    exportUrl: string;
    importUrl: string;
    open?: boolean;
    setOpen?: (open: boolean) => void;
    title?: string;
    description?: string;
    buttonText?: string;
    buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export default function DataIOModal({
    entity,
    exportUrl,
    importUrl,
    open: controlledOpen,
    setOpen: controlledSetOpen,
    title,
    description,
    buttonText = "Import & Export",
    buttonVariant = "secondary",
}: DataIOModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const open = controlledOpen ?? internalOpen;
    const setOpen = controlledSetOpen ?? setInternalOpen;

    const [resultOpen, setResultOpen] = useState(false);

    const { loading: importLoading, result, handleImport } = useImport(importUrl);
    const { exportFile, loading: exportLoading } = useExport(exportUrl);

    useEffect(() => {
        if (result && !importLoading) {
            setOpen(false);
            setResultOpen(true);
        }
    }, [result, importLoading, setOpen]);

    const handleBackToImport = () => {
        setResultOpen(false);
        setOpen(true);
    };

    const handleImportFile = async (file: File) => {
        await handleImport(file);
    };

    const handleExportFile = async (format: ExportFormat) => {
        await exportFile(format);
    };

    const displayTitle =
        title || `Import & Export ${entity.charAt(0).toUpperCase() + entity.slice(1)}`;

    const displayDescription =
        description || "Bulk import data or export your records for backup and analysis";

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant={buttonVariant} className="gap-2">
                        <DatabaseBackup className="h-4 w-4" />
                        {buttonText || "Import / Export"}
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl min-h-[440px] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{displayTitle}</DialogTitle>
                        <DialogDescription>{displayDescription}</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="import" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="import">Import</TabsTrigger>
                            <TabsTrigger value="export">Export</TabsTrigger>
                        </TabsList>

                        <ImportTab
                            entity={entity}
                            loading={importLoading}
                            onImport={handleImportFile}
                        />

                        <ExportTab loading={exportLoading} onExport={handleExportFile} />
                    </Tabs>

                    <DialogFooter>
                        <Button
                            variant="default"
                            onClick={() => setOpen(false)}
                            disabled={importLoading || exportLoading}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ImportResultModal
                open={resultOpen}
                onOpenChange={setResultOpen}
                result={result}
                onBackToImport={handleBackToImport}
            />
        </>
    );
}
