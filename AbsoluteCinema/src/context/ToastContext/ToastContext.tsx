import React, { createContext, useContext, useState, useCallback } from 'react';
import styles from './ToastContext.module.css';

type ToastType = 'success' | 'error';

interface ToastContextType {
    showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [isExit, setIsExit] = useState(false);

    const showToast = useCallback((type: ToastType, message: string) => {
        setToast({ type, message });
        setIsExit(false);

        setTimeout(() => {
            setIsExit(true);
            setTimeout(() => {
                setToast(null);
                setIsExit(false);
            }, 400); // Час анімації виходу
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]} ${isExit ? styles.exit : ''}`}>
                    {toast.type === 'success' ? '✅' : '⚠️'} {toast.message}
                </div>
            )}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};