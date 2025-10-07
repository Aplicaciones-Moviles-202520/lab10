export function getAppVersion() {
    const v = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
    return String(v);
}
