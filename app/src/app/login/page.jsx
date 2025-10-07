/**
 * Login page
 * - Authenticates user and stores JWT in localStorage
 * - Accepts demo users (see README for details)
 * - Shows error and loading states
 */
'use client';

import { getAppDomain } from '@/lib/env';
import { loginRequest, setToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const router = useRouter();
    // Controlled form state
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    /**
     * Handles login form submit
     * - Calls loginRequest (POST /api/login or demo bypass)
     * - Stores token and redirects to home
     */
    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const ctrl = new AbortController();
        try {
            // loginRequest returns a JWT (see src/lib/auth.js)
            const token = await loginRequest({ username, password, signal: ctrl.signal });
            setToken(token); // Save to localStorage
            router.replace('/'); // Go to home
        } catch (err) {
            setError(err?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-red-900 relative isolate overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] p-4">
            {/* Background logo overlay */}
            <div className="absolute inset-x-0 top-21 bottom-21 bg-[url('/logo.png')] bg-no-repeat bg-center bg-cover opacity-[0.42] z-0 pointer-events-none" />
            <div className="w-full max-w-sm mx-4 sm:mx-0 my-3 sm:my-4 relative z-10">
                <div className="card bg-base-100 shadow-lg border border-red-700/30 overflow-hidden rounded-xl">
                    <div className="bg-black text-red-500 px-3 py-3 flex items-center justify-center">
                        <h1 className="text-base sm:text-lg font-normal tracking-widest text-center">IMPERIAL WATCH APP</h1>
                    </div>
                    <form className="card-body space-y-2" onSubmit={onSubmit}>
                        {/* Username input */}
                        <label className="form-control w-full">
                            <div className="label py-0">
                                <span className="label-text text-xs">Username</span>
                            </div>
                            <input
                                type="text"
                                className="input input-bordered input-md w-full"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </label>
                        {/* Password input */}
                        <label className="form-control w-full">
                            <div className="label py-0">
                                <span className="label-text text-xs">Password</span>
                            </div>
                            <input
                                type="password"
                                className="input input-bordered input-md w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </label>
                        {/* Error message */}
                        {error && (
                            <div className="alert alert-error text-xs">
                                <span>{error}</span>
                            </div>
                        )}
                        {/* Submit button */}
                        <div className="card-actions mt-1">
                            <button type="submit" disabled={loading} className="btn btn-error btn-md w-full">
                                {loading ? 'Authorizing…' : 'Login'}
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 text-center mt-1">
                            Our Glorious Emperor acknowledges your unwavering loyalty
                        </p>
                    </form>
                </div>
                {/* Shows the current app domain for debugging */}
                <div className="text-white text-[8px] w-full text-center">{getAppDomain()}</div>
            </div>
        </div>
    );
}
