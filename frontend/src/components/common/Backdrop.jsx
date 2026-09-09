import React, { useEffect } from 'react';

const Backdrop = ({ children, onClose }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && onClose) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div
                className="absolute inset-0"
                onClick={onClose}
            />
            <div className="relative z-10 w-full animate-in fade-in zoom-in-95 duration-200 flex justify-center">
                {children}
            </div>
        </div>
    );
};

export default Backdrop;
