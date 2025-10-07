'use client';

import { useEffect, useId } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Modal({ open, title, onClose, children, maxWidth = 'lg', showClose = true }) {
    const labelledBy = useId();

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose?.();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const maxWidthClass =
        {
            sm: 'max-w-sm',
            md: 'max-w-md',
            lg: 'max-w-lg',
            xl: 'max-w-xl',
        }[maxWidth] || 'max-w-lg';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />

            {/* Dialog */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelledBy}
                className={`relative z-10 w-[95vw] ${maxWidthClass} bg-base-100 rounded-xl shadow-2xl border border-red-700/40 overflow-hidden`}
            >
                <div className="px-4 py-3 bg-black text-red-500 flex items-center justify-between">
                    <div id={labelledBy} className="font-bold tracking-wider text-sm sm:text-base">
                        {title}
                    </div>
                    {showClose && (
                        <button className="btn btn-ghost btn-xs btn-square" onClick={onClose} aria-label="Close">
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    )}
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
