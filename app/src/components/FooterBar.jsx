'use client';

import { useEffect, useState } from 'react';
import { getAppVersion } from '@/pwa/utils/version';
import { getClaims, clearToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useMounted } from '@/hooks/useMounted';
import { getAppDomain } from '@/lib/env';

export default function FooterBar() {
    const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const roleClient = typeof window !== 'undefined' ? (getClaims()?.role || '').toUpperCase() : '';
    const mounted = useMounted();

    useEffect(() => {
        function on() {
            setOnline(true);
        }
        function off() {
            setOnline(false);
        }
        window.addEventListener('online', on);
        window.addEventListener('offline', off);
        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
        };
    }, []);

    const router = useRouter();
    const onLogout = () => {
        clearToken();
        router.replace('/login');
    };

    return (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 border-t border-red-700/40 pb-[env(safe-area-inset-bottom)]">
            <div className="h-14 px-3 sm:px-4 flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 uppercase">
                <div>
                    <div className="flex items-center gap-2 justify-start">
                        <span
                            className={`inline-block w-2 h-2 rounded-full ${
                                mounted ? (online ? 'bg-green-500' : 'bg-red-500') : 'bg-zinc-500'
                            }`}
                        ></span>
                        <span className='text-white'>
                            {mounted ? (online ? 'Online' : 'Offline') : ''} - v{getAppVersion()}
                        </span>
                    </div>
                    <div className="text-[6px] w-full text-center">{getAppDomain()}</div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <div className="text-[6px]">Role</div>
                        <div className="text-white">{mounted && roleClient ? `${roleClient}` : ''}</div>
                    </div>
                    <button
                        className="btn btn-error btn-xs btn-square"
                        title="Logout"
                        aria-label="Logout"
                        type="button"
                        onClick={onLogout}
                    >
                        <FontAwesomeIcon icon={faRightFromBracket} />
                    </button>
                </div>
            </div>
        </footer>
    );
}
