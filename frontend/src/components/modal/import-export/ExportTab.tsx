import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle } from "lucide-react";

export default function ExportTab({
  title,
  onExport,
}: {
  title?: string;
  onExport: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await onExport();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER CARD ===== */}
      <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Download className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Export {title ?? "Data"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Download your full dataset in Excel format for reporting, backup, or
            advanced data analysis.
          </p>
        </div>
      </div>

      {/* ===== ACTION CARD ===== */}
      <div className="bg-white border rounded-xl p-6 space-y-5 shadow-sm">
        {/* Included Info */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">
            What’s included in this export?
          </h4>

          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              All current records
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Structured Excel (.xlsx) format
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              Compatible with the import template
            </li>
          </ul>
        </div>

        {/* Export Button */}
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
          onClick={handleExport}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? "Exporting..." : "Export Now"}
        </Button>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-600 rounded-full" />
            Export completed successfully.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
