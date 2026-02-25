import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle } from "lucide-react";

interface ImportError {
  rowNumber: number;
  message: string;
}

interface ImportResult {
  successCount: number;
  failureCount: number;
  errors: ImportError[];
}

interface ImportResultModalProps {
  result: ImportResult;
}

const ImportResultModal = ({ result }: ImportResultModalProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold">
              Thành công
            </h4>
          </div>
          <p className="text-3xl font-bold text-center text-green-700 dark:text-green-300">
            {result.successCount}
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-semibold">
              Thất bại
            </h4>
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
                    Dòng
                  </th>
                  <th className="px-4 py-2 text-left font-medium border-b">
                    Thông báo lỗi
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

export default ImportResultModal;
