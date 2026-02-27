// src/components/ImportModal.tsx
import React, { useState, useRef } from 'react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onDownloadTemplate: () => void;            // Hàm gọi API tải file mẫu
    onImport: (file: File) => Promise<void>;   // Hàm gọi API upload file
    acceptedFileTypes?: string;                // Mặc định: .xlsx, .xls, .csv
}

export const ImportModal: React.FC<ImportModalProps> = ({
                                                            isOpen,
                                                            onClose,
                                                            title,
                                                            onDownloadTemplate,
                                                            onImport,
                                                            acceptedFileTypes = ".xlsx, .xls, .csv"
                                                        }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state khi đóng modal
    const handleClose = () => {
        setFile(null);
        setError(null);
        setIsUploading(false);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            await onImport(file);
            // Nếu thành công -> Đóng modal
            handleClose();
        } catch (err: any) {
            // Nếu lỗi -> Hiển thị lỗi, giữ modal mở để user thử lại
            console.error(err);
            // --- ĐOẠN CODE FIX LỖI HIỂN THỊ ---
            // Backend trả về text (String) nên ta ưu tiên lấy err.response.data trực tiếp
            let msg = "Import failed. Please check your file.";

            if (err.response?.data) {
                // Trường hợp 1: Backend trả về String ("Validation Error: ...")
                if (typeof err.response.data === 'string') {
                    msg = err.response.data;
                }
                // Trường hợp 2: Backend trả về JSON chuẩn ({ message: "..." })
                else if (err.response.data.message) {
                    msg = err.response.data.message;
                }
            }
            // ------------------------------------
            setError(msg);
        } finally {
            setIsUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

                {/* Backdrop mờ */}
                <div
                    className="fixed inset-0 bg-black/40"
                    aria-hidden="true"
                    onClick={handleClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Panel */}
                <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg relative">

                    {/* Nút X đóng modal */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Header */}
                    <h3 className="text-xl font-bold leading-6 text-gray-900 mb-6" id="modal-title">
                        {title}
                    </h3>

                    <div className="space-y-6">
                        {/* Step 1: Download Template */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Step 1: Download Template</p>
                            <button
                                type="button"
                                onClick={onDownloadTemplate}
                                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <svg className="mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Template
                            </button>
                        </div>

                        {/* Step 2: Upload File */}
                        <div>
                            <p className="text-sm font-semibold text-gray-700 mb-2">Step 2: Upload File</p>

                            {/* Vùng chọn file (Clickable) */}
                            <div
                                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="font-medium text-blue-600 hover:text-blue-500">
                                            {file ? "Change file" : "Select a file"}
                                        </span>
                                        <input
                                            ref={fileInputRef}
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept={acceptedFileTypes}
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {acceptedFileTypes.replace(/,/g, ', ')} up to 10MB
                                    </p>
                                </div>
                            </div>

                            {/* Hiển thị tên file đã chọn hoặc Lỗi */}
                            {file && !error && (
                                <div className="mt-3 flex items-center p-2 bg-green-50 rounded-md text-sm text-green-700 border border-green-100 animate-fade-in-up">
                                    <svg className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium truncate">{file.name}</span>
                                </div>
                            )}

                            {error && (
                                <div className="mt-3 flex items-start p-2 bg-red-50 rounded-md text-sm text-red-600 border border-red-100 animate-fade-in-up">
                                    <svg className="mr-2 h-5 w-5 flex-shrink-0 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!file || isUploading}
                            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[100px]"
                        >
                            {isUploading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                "Import"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};