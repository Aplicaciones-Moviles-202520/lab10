import { useState, useEffect } from 'react';

export function useNotificationManager() {
    const [mounted, setMounted] = useState(false);
    const [supported, setSupported] = useState(false);
    const [swReady, setSwReady] = useState(false);
    const [permission, setPermission] = useState('default');

    useEffect(() => {
        const timer = setTimeout(() => {
            setMounted(true);
            const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
            setSupported(isSupported);
            if (isSupported) {
                setPermission(Notification.permission);
            }
            if (isSupported) {
                navigator.serviceWorker.ready
                    .then((registration) => {
                        console.log('Service Worker ready:', registration);
                        setSwReady(true);
                    })
                    .catch((error) => {
                        console.error('Service Worker not ready:', error);
                    });
            }
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const requestPermission = async () => {
        if (!supported) {
            throw new Error('Notifications not supported');
        }
        if (Notification.permission === 'default') {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result;
        }
        return Notification.permission;
    };

    const showLocalNotification = async (title, message, options = {}) => {
        console.log('Triggering local push event to Service Worker');
        const currentPermission = await requestPermission();
        if (currentPermission !== 'granted') {
            throw new Error('Notification permission denied');
        }
        if (!swReady) {
            throw new Error('Service Worker not ready yet');
        }
        try {
            const registration = await navigator.serviceWorker.ready;
            const notificationData = {
                title: title,
                body: message,
                icon: options.icon || '/icons/favicon.svg',
                badge: options.badge || '/icons/favicon.svg',
                url: options.url || '/',
                type: 'local',
                tag: options.tag || 'local-notification',
                ...options,
            };
            if (registration.active) {
                registration.active.postMessage({
                    type: 'SHOW_NOTIFICATION',
                    data: notificationData,
                });
                console.log('Local push message sent to Service Worker');
                return true;
            } else {
                throw new Error('Service Worker not active');
            }
        } catch (error) {
            console.error('Service Worker notification error:', error);
            throw error;
        }
    };

    const subscribeToRemoteNotifications = async () => {
        // This will be implemented when adding server push notifications
        throw new Error('Remote notifications not yet implemented');
    };

    return {
        // State
        mounted,
        supported,
        swReady,
        permission,

        // Actions
        showLocalNotification,
        requestPermission,
        subscribeToRemoteNotifications, // For future use

        // Computed values
        isReady: mounted && supported && swReady,
        canShowNotifications: permission === 'granted',
    };
}
