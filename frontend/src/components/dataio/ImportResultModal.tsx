import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export interface ImportError {
  rowNumber: number;
  message: string;
}

export interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: ImportError[];
}

interface ImportResultContentProps {
  result: ImportResult;
}

export const ImportResultContent = ({ result }: ImportResultContentProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold">Success</h4>
          </div>
          <p className="text-3xl font-bold text-center text-green-700 dark:text-green-300">
            {result.successCount}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold">Failed</h4>
          </div>
          <p className="text-3xl font-bold text-center text-red-700 dark:text-red-300">
            {result.failureCount}
          </p>
        </div>
      </div>
      {result.errors.length > 0 && (
        <ScrollArea className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-medium border-b w-24">
                  Row
                </th>
                <th className="px-4 py-2 text-left font-medium border-b">
                  Error Message
                </th>
              </tr>
            </thead>
            <tbody>
              {result.errors.map((err, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-muted/50 transition-colors"
                >
                  <td className="px-4 py-3 border-r">
                    <Badge variant="outline" className="font-mono">
                      #{err.rowNumber}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-red-600 dark:text-red-400">
                      {err.message}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      )}
    </div>
  );
};

interface ImportResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ImportResult | null;
  onBackToImport?: () => void;
}

const ImportResultModal = ({
  open,
  onOpenChange,
  result,
  onBackToImport,
}: ImportResultModalProps) => {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl min-h-[440px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Import Result
          </DialogTitle>
          <DialogDescription>Detailed import result</DialogDescription>
        </DialogHeader>

        <div className="flex-1 max-h-[400px] overflow-y-auto py-4">
          <ImportResultContent result={result} />
        </div>

        <DialogFooter>
          <div className="flex-1 flex justify-between">
            {onBackToImport && (
              <Button variant="outline" onClick={onBackToImport}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Import
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportResultModal;
