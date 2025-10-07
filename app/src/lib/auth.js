'use client';

import { getApiUrl, getAppDomain } from '@/lib/env';

const TOKEN_KEY = 'auth.token';
const CLAIMS_KEY = 'auth.claims';

export function getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    try {
        const claims = decodeJwtClaims(token);
        localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
    } catch (_) {
        // ignore decode errors
    }
}

export function clearToken() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLAIMS_KEY);
}

export function getClaims() {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    const token = getToken();
    if (!token) return false;
    try {
        const { exp } = decodeJwtClaims(token);
        if (typeof exp === 'number') {
            const now = Math.floor(Date.now() / 1000);
            return exp > now;
        }
        return !!token;
    } catch {
        return !!token;
    }
}

export function decodeJwtClaims(token) {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('Invalid JWT');
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
        atob(payload)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(json);
}

export async function loginRequest({ username, password, signal }) {
    // Bypass for demo users
    if (isBypassUser(username) && password === username) {
        const token = createBypassToken(username);
        return token;
    }

    const url = getApiUrl('/login');
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        signal,
    });

    if (!res.ok) {
        const errText = JSON.parse(await safeReadText(res));
        throw new Error(errText?.error || `Login failed (${res.status})`);
    }

    let token = null;
    const authHeader = res.headers.get('Authorization') || res.headers.get('authorization');
    if (authHeader && /^Bearer\s+/i.test(authHeader)) {
        token = authHeader.replace(/^Bearer\s+/i, '');
    }

    if (!token) {
        const data = await safeReadJson(res);
        token = data?.token || data?.access_token || data?.jwt || (typeof data === 'string' ? data : null);
    }

    if (!token) {
        throw new Error('Login succeeded but token not found in response');
    }

    return token;
}

async function safeReadJson(res) {
    try {
        return await res.clone().json();
    } catch {
        return null;
    }
}

async function safeReadText(res) {
    try {
        return await res.clone().text();
    } catch {
        return '';
    }
}

function isBypassUser(username) {
    return username === 'example_trooper' || username === 'example_reporter';
}

function createBypassToken(username) {
    const role = username.endsWith('_reporter') ? 'reporter' : 'trooper';
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 24 * 60 * 60; // 24h
    let iss = 'unknown';
    try {
        iss = new URL(getAppDomain()).host;
    } catch {
        iss = (getAppDomain() || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'unknown';
    }

    const header = { alg: 'none', typ: 'JWT' };
    const payload = { sub: username, role, iat, exp, iss };

    const base64url = (obj) => {
        const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
        const b64 = btoa(json);
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    };

    const token = `${base64url(header)}.${base64url(payload)}.`; // no signature (alg: none)
    return token;
}
