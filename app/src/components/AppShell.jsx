'use client';

import HeaderBar from '@/components/HeaderBar';
import FooterBar from '@/components/FooterBar';

export default function AppShell({ children }) {
    return (
        <div className="min-h-dvh bg-gradient-to-br from-black via-zinc-900 to-red-900 relative isolate overflow-hidden">
            <div className="absolute inset-x-0 bg-[url('/logo.png')] top-[10%] bg-no-repeat bg-center bg-cover h-[80%] opacity-[0.42] z-0 pointer-events-none" />
            <HeaderBar className="relative z-20" />
            <main className="relative z-10 pt-[calc(70px+env(safe-area-inset-top))] pb-[calc(70px+env(safe-area-inset-bottom))] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] p-4">
                <div className="mx-auto w-full max-w-sm sm:max-w-md px-3">{children}</div>
            </main>
            <FooterBar className="relative z-20" />
        </div>
    );
}
