'use client';

import { useInstall } from '../hooks/useInstall';

export function InstallExample() {
    const { shouldShow, ios, standalone, promptInstall } = useInstall();

    if (!shouldShow && !standalone) return null;

    return (
        <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded">
            <h4 className="font-semibold text-cyan-800 mb-2">Custom Install Example</h4>
            <p className="text-sm text-cyan-700 mb-2">Using PWA install hook directly</p>
            {standalone ? (
                <p className="text-sm text-green-600">Already installed as PWA!</p>
            ) : (
                <div>
                    <p className="text-xs text-cyan-600 mb-2">Platform: {ios ? 'iOS' : 'Desktop/Android'}</p>
                    <button onClick={promptInstall} className="btn btn-accent btn-sm">
                        {ios ? 'Show Install Instructions' : 'Install PWA'}
                    </button>
                </div>
            )}
        </div>
    );
}
