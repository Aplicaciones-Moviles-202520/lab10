'use client';

import { useInstall } from '../hooks/useInstall';

export function InstallPromptManager({ children }) {
    const install = useInstall();
    return children(install);
}

export { useInstall as useInstall } from '../hooks/useInstall';
