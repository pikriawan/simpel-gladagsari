import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
    actions,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} actions={actions}>
            {children}
        </AppLayoutTemplate>
    );
}
