'use client';

import { useState } from 'react';
import { getApiUrl } from '@/lib/env';
import { getToken } from '@/lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEraser } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';

export default function SpaceshipsAdd({ onCreated }) {
    const [spaceshipId, setSpaceshipId] = useState('');
    const [model, setModel] = useState('');
    const [pilot, setPilot] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const reset = () => {
        setSpaceshipId('');
        setModel('');
        setPilot('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!spaceshipId.trim() || !model.trim() || !pilot.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        const ctrl = new AbortController();
        try {
            const url = getApiUrl('/spaceships');
            const token = getToken();
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    spaceship_id: spaceshipId.trim(),
                    model: model.trim(),
                    pilot: pilot.trim(),
                }),
                signal: ctrl.signal,
            });

            if (!res.ok) {
                // Try to read structured error, fallback to status text
                let message = res.statusText || `Request failed (${res.status})`;
                try {
                    const data = await res.clone().json();
                    message = data?.error || data?.message || message;
                } catch {
                    try {
                        const text = await res.clone().text();
                        message = text || message;
                    } catch {
                        // ignore
                    }
                }
                throw new Error(message);
            }

            let created = null;
            try {
                created = await res.clone().json();
            } catch {
                // allow empty body
                created = {
                    spaceship_id: spaceshipId.trim(),
                    model: model.trim(),
                    pilot: pilot.trim(),
                };
            }

            setSuccess('Spaceship reported successfully');
            if (typeof onCreated === 'function') onCreated(created);
            reset();
        } catch (err) {
            setError(err?.message || 'Failed to report spaceship');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    return (
        <form className="space-y-2" onSubmit={onSubmit} noValidate>
            <label className="form-control w-full">
                <div className="label py-0">
                    <span className="label-text text-[10px] sm:text-xs">Spaceship ID</span>
                </div>
                <input
                    type="text"
                    inputMode="text"
                    className="input input-bordered input-sm sm:input-md w-full"
                    placeholder="TIE-00123"
                    value={spaceshipId}
                    onChange={(e) => setSpaceshipId(e.target.value)}
                    required
                />
            </label>

            <label className="form-control w-full">
                <div className="label py-0">
                    <span className="label-text text-[10px] sm:text-xs">Model</span>
                </div>
                <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md w-full"
                    placeholder="TIE/LN"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                />
            </label>

            <label className="form-control w-full">
                <div className="label py-0">
                    <span className="label-text text-[10px] sm:text-xs">Pilot</span>
                </div>
                <input
                    type="text"
                    className="input input-bordered input-sm sm:input-md w-full"
                    placeholder="FN-2187"
                    value={pilot}
                    onChange={(e) => setPilot(e.target.value)}
                    required
                />
            </label>

            <div className="grid grid-cols-4 gap-2 pt-2">
                <button type="submit" className="btn btn-error btn-sm sm:btn-md flex-1 col-span-3" disabled={loading}>
                    {loading ? 'Reporting…' : 'Report'}
                </button>
                <button
                    type="button"
                    className="btn btn-error btn-sm sm:btn-md col-span-1"
                    onClick={reset}
                    disabled={loading}
                >
                    <FontAwesomeIcon
                        icon={loading ? faArrowsRotate : faEraser}
                        spin={loading}
                        key={loading ? 'rotate' : 'erase'}
                    />
                </button>
            </div>

            {error && (
                <div className="alert alert-error text-[10px] sm:text-xs pt-1">
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="alert alert-success text-[10px] sm:text-xs pt-1">
                    <span>{success}</span>
                </div>
            )}
        </form>
    );
}
