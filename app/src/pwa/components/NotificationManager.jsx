'use client';

import { useNotificationManager } from '../hooks/useNotificationManager';

export function NotificationManager({ children }) {
    const notificationManager = useNotificationManager();
    return children(notificationManager);
}

export { useNotificationManager } from '../hooks/useNotificationManager';
