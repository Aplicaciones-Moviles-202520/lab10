"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiUrl } from "@/lib/env";
import { getToken } from "@/lib/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import SpaceshipStatus from "./SpaceshipStatus";

export default function SpaceshipsListing({ reloadKey }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(null); // { id, model }

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		const ctrl = new AbortController();
		try {
			const url = getApiUrl("/spaceships");
			const token = getToken();
			const res = await fetch(url, {
				method: "GET",
				headers: {
					"Accept": "application/json",
					...(token ? { Authorization: `Bearer ${token}` } : {}),
				},
				signal: ctrl.signal,
			});
			if (!res.ok) {
				let message = res.statusText || `Request failed (${res.status})`;
				try {
					const data = await res.clone().json();
					message = data?.error || data?.message || message;
				} catch {
					try {
						const text = await res.clone().text();
						message = text || message;
					} catch {}
				}
				throw new Error(message);
			}
			const data = await res.json();
			const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
			setItems(list);
		} catch (err) {
			setError(err?.message || "Failed to load spaceships");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load, reloadKey]);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="text-[10px] text-zinc-500">
                    {loading ? "Loading…" : `${items.length} ship${items.length === 1 ? "" : "s"} reported`}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn btn-ghost btn-xs"
                        onClick={load}
                        disabled={loading}
                        title="Refresh"
                        aria-label="Refresh"
                    >
                        <FontAwesomeIcon icon={faArrowsRotate} spin={loading} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-error text-[10px]">
                    <span>{error}</span>
                    <button className="btn btn-xs ml-auto" onClick={load} disabled={loading}>
                        Retry
                    </button>
                </div>
            )}

            {!error && (
                <div className="overflow-x-auto">
                    <table className="table table-zebra table-xs table-fixed sm:table-sm">
                        <thead>
                            <tr>
                                <th className="text-[10px] sm:text-xs w-1/4">ID</th>
                                <th className="text-[10px] sm:text-xs w-1/4">Model</th>
                                <th className="text-[10px] sm:text-xs w-1/2">Pilot</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3}>
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-zinc-500">
                                        No spaceships reported yet
                                    </td>
                                </tr>
                            ) : (
                                items.map((s, idx) => (
                                    <tr
                                        key={s?.spaceship_id || idx}
                                        className="hover:bg-base-200 cursor-pointer"
                                        onClick={() => setSelected({ id: s?.spaceship_id, model: s?.model })}
                                    >
                                        <td className="font-mono text-[8px] sm:text-xs">{s?.spaceship_id ?? "–"}</td>
                                        <td className="font-mono text-[8px] sm:text-xs">{s?.model ?? "–"}</td>
                                        <td className="font-mono text-[8px] sm:text-xs">{s?.pilot ?? "–"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {selected && (
                <SpaceshipStatus
                    open={true}
                    spaceshipId={selected.id}
                    model={selected.model}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
}

