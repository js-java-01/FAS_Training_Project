import React from "react";

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}> = ({ open, onClose, title, size = "md", children }) => {
  if (!open) return null;
  const sizeClass = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-lg shadow-xl overflow-hidden ${sizeClass} w-full mx-4 transform transition-all duration-200 scale-100`}>
        <header className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
