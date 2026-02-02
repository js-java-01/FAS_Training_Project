import React, { type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    actions,
    size = 'lg',
    showCloseButton = true,
}) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg', 
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-600/50 backdrop-blur-sm" 
                onClick={onClose} 
            />

            {/* Modal Container */}
            <div className={`relative bg-white rounded-xl shadow-xl w-full ${sizeClasses[size]} overflow-hidden flex flex-col max-h-[calc(100vh-5rem)]`}>
                
                {/* Header - Fixed at top */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                    {showCloseButton && (
                        <button 
                            onClick={onClose} 
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Content - Scrollable area */}
                <div className="p-6 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer - Fixed at bottom */}
                {actions && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};