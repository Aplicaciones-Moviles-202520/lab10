'use client';

import { useNotificationManager } from '../hooks/useNotificationManager';

export function NotificationExample() {
    const { showLocalNotification, isReady } = useNotificationManager();

    const sendWelcomeNotification = async () => {
        try {
            await showLocalNotification('Welcome!', 'Thanks for visiting our app!', { tag: 'welcome' });
        } catch (error) {
            console.error('Welcome notification failed:', error);
        }
    };

    return (
        <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">Custom Notification Example</h4>
            <p className="text-sm text-purple-700 mb-2">Using the hook directly for custom logic</p>
            <button onClick={sendWelcomeNotification} className="btn btn-secondary btn-sm" disabled={!isReady}>
                Send Welcome Notification
            </button>
        </div>
    );
}
