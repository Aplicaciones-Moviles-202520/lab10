import { useState, useEffect } from 'react';

export function useInstall() {
    const [mounted, setMounted] = useState(false);
    const [ios, setIos] = useState(false);
    const [standalone, setStandalone] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [canInstall, setCanInstall] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
                const userAgent = navigator.userAgent || '';
                const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
                const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

                setIos(isIOS);
                setStandalone(isStandalone);
                setMounted(true);

                setCanInstall(!isStandalone && (isIOS || deferredPrompt !== null));
            }
        }, 100);

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setCanInstall(true);
        };

        const handleAppInstalled = () => {
            setDeferredPrompt(null);
            setCanInstall(false);
            setStandalone(true);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.addEventListener('appinstalled', handleAppInstalled);
        }

        return () => {
            clearTimeout(timer);
            if (typeof window !== 'undefined') {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                window.removeEventListener('appinstalled', handleAppInstalled);
            }
        };
    }, [deferredPrompt]);

    const promptInstall = async () => {
        if (!deferredPrompt) {
            console.log('No install prompt available');
            return false;
        }
        try {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setCanInstall(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Install prompt failed:', error);
            return false;
        }
    };

    return {
        // State
        mounted,
        ios,
        standalone,
        canInstall,

        // Computed
        shouldShow: mounted && !standalone && canInstall,

        // Actions
        promptInstall,
    };
}
