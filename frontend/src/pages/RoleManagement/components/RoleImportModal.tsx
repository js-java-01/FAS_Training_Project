import React, { useState } from 'react';
import { FiX, FiDownload, FiUpload, FiFile } from 'react-icons/fi';
import { roleApi } from '../../../api/roleApi';
import { toast } from 'react-toastify';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RoleImportModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // Xử lý tải Template
  const handleDownloadTemplate = async () => {
    try {
      const blob = await roleApi.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'roles_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Xử lý Upload
  const handleImport = async () => {
    if (!file) {
      toast.warning('Please select a file first!');
      return;
    }

    setLoading(true);
    try {
      await roleApi.importRoles(file);
      toast.success('Import roles successfully! 🚀');
      onSuccess(); // Load lại bảng Role
      onClose();   // Đóng modal
      setFile(null);
    } catch (error) {
      toast.error('Import failed. Please check your file format.');
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
            <h2 className="text-lg font-bold text-gray-900">Import Roles</h2>
            <p className="text-xs text-gray-500 mt-1">
              Upload an Excel file to import roles. Download the template first to see the required format.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <FiX size={20} />
          </button>
        </div>

        {/* Step 1: Download */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Step 1: Download Template
          </label>
          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
          >
            <FiDownload /> Download Template
          </button>
        </div>

        {/* Step 2: Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Step 2: Upload File
          </label>
          
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition relative">
            <div className="space-y-1 text-center">
                {file ? (
                    <div className="flex flex-col items-center text-blue-600">
                        <FiFile size={30} />
                        <p className="text-sm mt-2 font-medium">{file.name}</p>
                        <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                ) : (
                    <>
                        <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="flex text-sm text-gray-600 justify-center">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                            <span>Select File</span>
                            <input type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500">XLSX or XLS up to 10MB</p>
                    </>
                )}
            </div>
            {/* Nếu đã có file thì cho phép click lại input để đổi file */}
            {file && <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx, .xls" onChange={handleFileChange} />}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? 'Importing...' : 'Import Roles'}
          </button>
        </div>
      </div>
    </div>
  );
};