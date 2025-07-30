import React, { useEffect } from 'react';
import { SyncIcon } from './icons';

interface ToastProps {
    message: string;
    type: 'success' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        if (type === 'success') {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    const baseClasses = "fixed top-5 right-5 z-50 flex items-center py-3 px-5 rounded-lg shadow-xl text-white font-semibold animate-slide-in";
    const typeClasses = {
        success: "bg-green-600",
        info: "bg-blue-600",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {type === 'info' && <SyncIcon className="animate-spin w-5 h-5 mr-3" />}
            <span>{message}</span>
            {type === 'success' && (
                <button 
                    onClick={onClose} 
                    className="ml-4 -mr-2 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label="Fechar notificação"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export default Toast;