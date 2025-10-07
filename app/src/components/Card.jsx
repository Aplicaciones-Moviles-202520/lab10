'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

export default function Card({ title, subtitle, children, collapsible = false, defaultCollapsed = false }) {
    const [collapsed, setCollapsed] = useState(Boolean(defaultCollapsed));

    const toggle = () => {
        if (!collapsible) return;
        setCollapsed((v) => !v);
    };

    return (
        <div className="bg-base-100 p-4 sm:p-6 rounded-lg shadow-2xl border border-red-700/40 w-full">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h1 className="text-lg font-extrabold uppercase text-red-600 truncate">{title}</h1>
                    {!collapsed && (
                        <h2 className="text-zinc-500 uppercase tracking-wider text-xs sm:text-base whitespace-normal break-words">
                            {subtitle}
                        </h2>
                    )}
                </div>
                {collapsible && (
                    <button
                        type="button"
                        className="btn btn-ghost btn-xs btn-square shrink-0"
                        onClick={toggle}
                        aria-label={collapsed ? 'Expand' : 'Collapse'}
                        aria-expanded={!collapsed}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        <FontAwesomeIcon icon={collapsed ? faChevronDown : faChevronUp} />
                    </button>
                )}
            </div>
            {!collapsed && (
                <>
                    <div className="divider m-0"></div>
                    <div className="text-xs text-zinc-500">{children}</div>
                </>
            )}
        </div>
    );
}
