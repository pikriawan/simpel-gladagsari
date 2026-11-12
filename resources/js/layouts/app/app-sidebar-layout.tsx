import { usePage } from '@inertiajs/react';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import UnifiedSidebar from '../../../../src/components/UnifiedSidebar.jsx';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    actions,
}: AppLayoutProps & { actions?: React.ReactNode }) {
    const page = usePage();

    return (
        <div className="app">
            <UnifiedSidebar currentPath={page.url} />
            <main className="main">
                {!page.component.startsWith('root/') && (
                    <AppSidebarHeader breadcrumbs={breadcrumbs} actions={actions} />
                )}
                {children}
            </main>
        </div>
    );
}
