/**
 * Home page (authenticated area)
 * - Only accessible if logged in (see <AuthGuard />)
 * - Shows welcome, spaceship list, and add form
 * - Demonstrates state, hooks, and component composition
 */
'use client';

import { useMounted } from '@/hooks/useMounted'; // SSR-safe mount detection
import { useState } from 'react';
import AppShell from '@/components/AppShell'; // Layout: header, footer, background
import AuthGuard from '@/components/AuthGuard'; // Protects route, redirects to /login if not logged in
import Card from '@/components/Card'; // UI card with optional collapse
import SpaceshipsAdd from '@/components/SpaceshipsAdd'; // Form to add a spaceship
import SpaceshipsListing from '@/components/SpaceshipsListing'; // Table of spaceships

export default function Home() {
    // Used to trigger reload of the spaceship list after adding a new one
    const [reloadKey, setReloadKey] = useState(0);
    // Only render UI after mount to avoid hydration mismatch
    const mounted = useMounted();
    if (!mounted) return null;
    return (
        // Only render children if user is authenticated
        <AuthGuard>
            {/* AppShell provides the main layout and safe-area paddings */}
            <AppShell>
                {/* Welcome card, always expanded */}
                <Card
                    title="Welcome"
                    subtitle="The empire thanks you for your services"
                    collapsible={true}
                    defaultCollapsed={false}
                >
                    <p>You are authenticated. Features will appear here based on your role.</p>
                </Card>
                <div className="h-4" />
                {/* Spaceships listing, collapsible by default */}
                <Card title="Spaceships" subtitle="Spaceships imperial registry" collapsible={true} defaultCollapsed={true}>
                    {/* Pass reloadKey so the list reloads after a new spaceship is added */}
                    <SpaceshipsListing reloadKey={reloadKey} />
                </Card>
                <div className="h-4" />
                {/* Spaceship add form, collapsible by default */}
                <Card title="Spaceship Report" subtitle="Add or edit a spaceship" collapsible={true} defaultCollapsed={true}>
                    {/* onCreated increments reloadKey to refresh the list */}
                    <SpaceshipsAdd onCreated={() => setReloadKey((v) => v + 1)} />
                </Card>
            </AppShell>
        </AuthGuard>
    );
}
