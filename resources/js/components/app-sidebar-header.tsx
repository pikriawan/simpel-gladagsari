import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
    actions,
}: {
    breadcrumbs?: BreadcrumbItemType[];
    actions?: React.ReactNode;
}) {
    return (
        <header className="no-print print:hidden flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-3 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:h-16 sm:px-4 md:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 size-8 shrink-0" />
                <Separator
                    orientation="vertical"
                    className="mr-1 hidden h-4 sm:block"
                />
                <div className="min-w-0 truncate">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>
            <div
                id="header-actions"
                className="scrollbar-none flex max-w-[55vw] shrink-0 items-center gap-1.5 overflow-x-auto sm:max-w-none"
            >
                {actions}
            </div>
        </header>
    );
}
