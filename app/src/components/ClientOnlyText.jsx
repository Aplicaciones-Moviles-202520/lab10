'use client';

export default function ClientOnlyText({ getValue, placeholder = '', className = '' }) {
    const isServer = typeof window === 'undefined';
    const text = isServer ? placeholder : typeof getValue === 'function' ? getValue() : '';
    return (
        <span suppressHydrationWarning className={className}>
            {text}
        </span>
    );
}
