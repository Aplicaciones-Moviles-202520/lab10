export function getAppDomain() {
    const domain = process.env.NEXT_PUBLIC_APP_DOMAIN;
    if (!domain) {
        throw new Error('APP DOMAIN is not configured. Please set NEXT_PUBLIC_APP_DOMAIN in .env');
    }
    return domain.replace(/\/$/, '');
}

export function getApiUrl(path = '') {
    console.log('getApiUrl called with path:', path);
    const base = `${getAppDomain()}/api`;
    if (!path) return base;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    console.log('getApiUrl returning:', `${base}${normalized}`);
    return `${base}${normalized}`;
}
