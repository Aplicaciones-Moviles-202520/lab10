'use client';

import { useEffect } from 'react';

export default function Register() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered');
                    registration.addEventListener('updatefound', () => {
                        const installing = registration.installing;
                        if (!installing) return;
                        installing.addEventListener('statechange', () => {
                            if (installing.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    console.log('New content is available (SW updated).');
                                } else {
                                    console.log('Content cached for offline use.');
                                }
                            }
                        });
                    });
                    navigator.serviceWorker.addEventListener('controllerchange', () => {
                        console.log('Service Worker controller changed');
                    });
                })
                .catch((err) => console.error('Service Worker registration failed', err));
        }
    }, []);
    return null;
}
