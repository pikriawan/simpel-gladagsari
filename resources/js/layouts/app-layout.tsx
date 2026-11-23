import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { useActiveUserWatcher } from '@/hooks/use-active-user-watcher';

export default function AppLayout({
    breadcrumbs = [],
    children,
    actions,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    useActiveUserWatcher();

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} actions={actions}>
            {children}
        </AppLayoutTemplate>
    );
}
