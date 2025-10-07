'use client';

import { useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '@/lib/env';
import { getToken } from '@/lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Modal from '@/components/Modal';

export default function SpaceshipStatus({ open, spaceshipId, model, onClose }) {
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [details, setDetails] = useState(null);
    const [detailsError, setDetailsError] = useState('');

    const [validating, setValidating] = useState(false);
    const [isValidModel, setIsValidModel] = useState(null); // true | false | null

    const visible = Boolean(open && spaceshipId);

    useEffect(() => {
        if (!visible) return;
        // Load details
        const ctrl = new AbortController();
        (async () => {
            setLoadingDetails(true);
            setDetailsError('');
            try {
                const url = getApiUrl(`/spaceships/${encodeURIComponent(spaceshipId)}`);
                const token = getToken();
                const res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    signal: ctrl.signal,
                });
                if (!res.ok) {
                    let message = res.statusText || `Request failed (${res.status})`;
                    try {
                        const data = await res.clone().json();
                        message = data?.error || data?.message || message;
                    } catch {}
                    throw new Error(message);
                }
                const data = await res.json();
                setDetails(data);
            } catch (err) {
                setDetailsError(err?.message || 'Failed to load details');
            } finally {
                setLoadingDetails(false);
            }
        })();
        return () => setTimeout(() => ctrl.abort(), 5000);
    }, [visible, spaceshipId]);

    // Start validator immediately if model is provided
    const effectiveModel = useMemo(() => {
        return model || (details && details.model) || '';
    }, [model, details]);

    useEffect(() => {
        if (!visible) return;
        if (!effectiveModel) {
            setIsValidModel(null);
            return;
        }
        const ctrl = new AbortController();
        (async () => {
            setValidating(true);
            setIsValidModel(null);
            try {
                const url = `https://api.algundominio.link/spaceships/models/validator?model=${encodeURIComponent(
                    effectiveModel
                )}`;
                const res = await fetch(url, { method: 'GET', signal: ctrl.signal });
                setIsValidModel(res.ok);
                if (!res.ok) {
                    setIsValidModel(false);
                }
            } catch (err) {
                setIsValidModel(false);
            } finally {
                setValidating(false);
            }
        })();
        return () => setTimeout(() => ctrl.abort(), 5000);
    }, [visible, effectiveModel]);

    if (!visible) return null;

    return (
        <Modal open={visible} title="Spaceship Status" onClose={onClose} maxWidth="lg">
            <div className="space-y-3 text-xs text-zinc-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <div className="text-[10px] text-zinc-500">Spaceship ID</div>
                        <div className="text-black text-xs">{String(spaceshipId)}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500">Model</div>
                        <div className="flex items-center gap-2">
                            <span className="text-black text-xs break-all">{effectiveModel || 'Unknown'}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500">Pilot on registry</div>
                        {loadingDetails ? (
                            <div className="flex items-center gap-2">
                                <span className="loading loading-spinner loading-xs" /> Loading details…
                            </div>
                        ) : detailsError ? (
                            <div className="text-black">Error loading details</div>
                        ) : details ? (
                            <div className="text-black text-xs break-all">{details.pilot || 'Unknown'}</div>
                        ) : (
                            <div className="text-zinc-500">No details available.</div>
                        )}
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500">Model validation</div>
                        <div className="flex items-center gap-2">
                            {validating ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : isValidModel == null ? null : isValidModel ? (
                                <span className="badge badge-success badge-xs pl-0">
                                    <FontAwesomeIcon icon={faCircleCheck} /> Valid
                                </span>
                            ) : (
                                <span className="badge badge-error badge-xs pl-0">
                                    <FontAwesomeIcon icon={faCircleXmark} /> Invalid
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
