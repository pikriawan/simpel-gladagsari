import { usePage } from '@inertiajs/react';
import { SlidersHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    const roleLabel =
        auth.user.role === 'service'
            ? 'Pelayanan'
            : auth.user.role === 'administrator'
              ? 'Administrator'
              : auth.user.role;

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="group h-auto w-full px-2 py-2 transition-colors hover:bg-neutral-100 data-[state=open]:bg-neutral-100"
                            data-test="sidebar-menu-button"
                        >
                            <div className="flex flex-1 flex-col text-left group-data-[collapsible=icon]:hidden">
                                <span className="text-base leading-tight font-semibold text-neutral-900">
                                    {auth.user.name}
                                </span>
                                <span className="mt-1 text-sm font-normal text-neutral-400">
                                    {roleLabel}
                                </span>
                            </div>
                            <SlidersHorizontal className="ml-auto size-5 shrink-0 text-neutral-800 group-data-[collapsible=icon]:mx-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="end"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
