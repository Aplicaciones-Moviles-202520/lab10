'use client';

import { useInstall } from '../hooks/useInstall';

export function InstallPromptUI({
    className = '',
    title = 'Install App',
    buttonText = 'Install App',
    buttonClassName = 'btn btn-secondary w-full mb-2',
    showIOSInstructions = true,
    iosInstructionText = "To install this app on your iOS device, tap the share button ⎋ then 'Add to Home Screen' ➕.",
    showInstalledMessage = true,
    installedMessage = '✅ App already installed!',
    onInstallAttempt = null,
    onInstallSuccess = null,
}) {
    const { shouldShow, ios, standalone, mounted, promptInstall } = useInstall();

    if (!mounted) return null;

    if (!shouldShow) {
        if (standalone && showInstalledMessage) {
            return (
                <div className={className}>
                    <p className="text-sm text-green-600">{installedMessage}</p>
                </div>
            );
        }
        return null;
    }

    const handleInstallClick = async () => {
        if (onInstallAttempt) {
            onInstallAttempt();
        }
        if (ios) {
            return; // iOS doesn't support programmatic install, just show instructions
        }
        try {
            const success = await promptInstall();
            if (success && onInstallSuccess) {
                onInstallSuccess();
            }
        } catch (error) {
            console.error('Install failed:', error);
        }
    };

    return (
        <div className={className}>
            <h3>{title}</h3>
            <button className={buttonClassName} onClick={handleInstallClick}>
                {buttonText}
            </button>
            {ios && showIOSInstructions && <p className="text-sm text-gray-600">{iosInstructionText}</p>}
        </div>
    );
}

export function InstallPromptSimpleUI(props) {
    return <InstallPromptUI {...props} />;
}
