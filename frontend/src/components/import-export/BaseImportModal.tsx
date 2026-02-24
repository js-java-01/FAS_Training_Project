import React, { useState } from "react";
import { FiX, FiDownload, FiUpload, FiFile } from "react-icons/fi";
import { toast } from "sonner";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  templateFileName: string;
  accept?: string;

  onClose: () => void;
  onSuccess: () => void;

  onDownloadTemplate: () => Promise<Blob>;
  onImport: (file: File) => Promise<void>;
}

export const BaseImportModal: React.FC<Props> = ({
  open,
  title,
  description,
  templateFileName,
  accept = ".xlsx,.xls",

  onClose,
  onSuccess,
  onDownloadTemplate,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await onDownloadTemplate();
      downloadBlob(blob, templateFileName);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.warning("Please select a file");
      return;
    }

    setLoading(true);
    try {
      await onImport(file);
      toast.success("Import successful!");
      onSuccess();
      onClose();
      setFile(null);
    } catch {
      toast.error("Import failed. Please check your file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold">{title}</h2>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>

        {/* Download Template */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Step 1: Download Template
          </label>
          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-2 border rounded-md hover:bg-gray-50"
          >
            <FiDownload /> Download Template
          </button>
        </div>

        {/* Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Step 2: Upload File
          </label>

          <div className="border-2 border-dashed rounded-md p-6 text-center relative">
            {file ? (
              <div className="text-blue-600 flex flex-col items-center">
                <FiFile size={28} />
                <p className="mt-2 text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            ) : (
              <>
                <FiUpload className="mx-auto text-gray-400" size={28} />
                <label className="block mt-2 cursor-pointer text-blue-600 font-medium">
                  Select File
                  <input
                    type="file"
                    className="sr-only"
                    accept={accept}
                    onChange={(e) =>
                      e.target.files && setFile(e.target.files[0])
                    }
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">{accept}</p>
              </>
            )}

            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept={accept}
              onChange={(e) =>
                e.target.files && setFile(e.target.files[0])
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};
