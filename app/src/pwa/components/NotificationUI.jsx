'use client';

import { useState } from 'react';
import { useNotificationManager } from '../hooks/useNotificationManager';

export function NotificationUI({
    className = '',
    showRemoteSection = true,
    defaultTitle = 'Local Test',
    defaultMessage = 'This is a local notification',
}) {
    const [notificationTitle, setNotificationTitle] = useState(defaultTitle);
    const [notificationMessage, setNotificationMessage] = useState(defaultMessage);
    const [loading, setLoading] = useState(false);

    const { mounted, supported, swReady, permission, showLocalNotification, isReady, canShowNotifications } =
        useNotificationManager();

    if (!mounted) return null;
    if (!supported) return <p>Notifications not supported.</p>;

    const handleShowNotification = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await showLocalNotification(notificationTitle, notificationMessage);
        } catch (error) {
            alert('Failed to show notification: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (loading) return 'Sending...';
        if (!swReady) return 'Loading Service Worker...';
        if (!canShowNotifications) return 'Grant Permission & Show';
        return 'Show Local Notification';
    };

    const getPermissionStatus = () => {
        switch (permission) {
            case 'granted':
                return {
                    text: 'Permission granted',
                    color: 'text-green-600',
                };
            case 'denied':
                return { text: 'Permission denied', color: 'text-red-600' };
            default:
                return {
                    text: 'Permission not requested',
                    color: 'text-yellow-600',
                };
        }
    };

    const permissionStatus = getPermissionStatus();

    return (
        <div className={className}>
            <h3>Notification Manager</h3>

            {/* Status Info */}
            <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                <div>Service Worker: {swReady ? 'Ready' : 'Loading'}</div>
                <div className={permissionStatus.color}>{permissionStatus.text}</div>
            </div>

            {/* Local Notifications Section */}
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="font-semibold text-green-800 mb-2">Local Notifications</h4>
                <p className="text-sm text-green-700 mb-3">Simulates push to Service Worker - same logic as remote!</p>

                <input
                    value={notificationTitle}
                    placeholder="Notification Title"
                    onChange={(e) => setNotificationTitle(e.target.value)}
                    className="input input-bordered w-full mb-2"
                />
                <input
                    value={notificationMessage}
                    placeholder="Notification Message"
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    className="input input-bordered w-full mb-2"
                />

                <button onClick={handleShowNotification} className="btn btn-primary w-full" disabled={!isReady || loading}>
                    {getButtonText()}
                </button>
            </div>

            {/* Remote Notifications Section - Optional */}
            {showRemoteSection && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-semibold text-blue-800 mb-2">Remote Notifications</h4>
                    <p className="text-sm text-blue-700 mb-2">Push notifications from server</p>
                    <p className="text-xs text-blue-600 italic">
                        Uses same centralized Service Worker logic as local notifications!
                    </p>
                </div>
            )}
        </div>
    );
}
