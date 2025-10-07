'use client';

import { _, getClaims } from '@/lib/auth';
import { useMounted } from '@/hooks/useMounted';

export default function HeaderBar() {
    const mounted = useMounted();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-b border-red-700/40 pt-[calc(env(safe-area-inset-top)+8px)] pb-2">
            <div className="flex flex-col items-start gap-0 min-w-0 pl-3">
                <span className="block text-red-500 font-extrabold tracking-widest text-base sm:text-lg whitespace-nowrap">
                    IMPERIAL WATCH APP
                </span>
                <span className="block text-zinc-400 text-xs sm:text-sm whitespace-nowrap">
                    {mounted ? getClaims()?.sub || 'Unknown Operative' : ''}
                </span>
            </div>
        </header>
    );
}
