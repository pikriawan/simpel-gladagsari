import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, FileText, LayoutGrid, Users } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard, userManager } from '@/routes';
import {
    editor as patenEditor,
    template as patenTemplate,
} from '@/routes/paten-registration';
import {
    editor,
    history,
    templateSettings,
    villageData,
} from '@/routes/marriage-dispensation';

const suratDispensasiSubItems = [
    {
        title: 'Editor',
        href: editor(),
    },
    {
        title: 'Riwayat',
        href: history(),
    },
    {
        title: 'Data Desa dan Dukuh',
        href: villageData(),
    },
    {
        title: 'Pengaturan Template',
        href: templateSettings(),
    },
];

const patenRegistrationSubItems = [
    {
        title: 'Editor',
        href: patenEditor(),
    },
    {
        title: 'Template',
        href: patenTemplate(),
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const { isMobile, setOpenMobile } = useSidebar();

    const isAdmin = auth.user.role === 'administrator';
    const isService = auth.user.role === 'service';

    const handleLinkClick = (e: React.MouseEvent<HTMLElement>) => {
        if ((e.target as HTMLElement).closest('a')) {
            if (isMobile) {
                setOpenMobile(false);
            }
        }
    };

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-white">
            <SidebarHeader className="px-5 pt-6 pb-2 group-data-[collapsible=icon]:px-2">
                <Link
                    href={dashboard()}
                    prefetch
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="block text-2xl font-bold tracking-tight text-neutral-900 group-data-[collapsible=icon]:hidden"
                >
                    Simpel
                </Link>
                <Link
                    href={dashboard()}
                    prefetch
                    onClick={() => isMobile && setOpenMobile(false)}
                    className="hidden text-center text-xl font-bold tracking-tight text-neutral-900 group-data-[collapsible=icon]:block"
                >
                    S
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2" onClick={handleLinkClick}>
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-2">
                        {/* Dashboard */}
                        <SidebarMenuItem>
                            <Link
                                href={dashboard()}
                                prefetch
                                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                                    isCurrentUrl(dashboard())
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'
                                }`}
                            >
                                <LayoutGrid className="size-5 shrink-0" />
                                <span className="group-data-[collapsible=icon]:hidden">
                                    Dashboard
                                </span>
                            </Link>
                        </SidebarMenuItem>

                        {/* User Manager for Admin */}
                        {isAdmin && (
                            <SidebarMenuItem>
                                <Link
                                    href={userManager()}
                                    prefetch
                                    className={`flex h-11 w-full items-center gap-3 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                                        isCurrentUrl(userManager())
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'
                                    }`}
                                >
                                    <Users className="size-5 shrink-0" />
                                    <span className="group-data-[collapsible=icon]:hidden">
                                        User Manager
                                    </span>
                                </Link>
                            </SidebarMenuItem>
                        )}

                        {/* Surat Dispensasi Nikah */}
                        {!isAdmin && (
                            <Collapsible
                                defaultOpen={true}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <button
                                            type="button"
                                            className="group flex w-full cursor-pointer items-start justify-between rounded-lg px-3.5 py-2.5 text-left text-neutral-800 transition-colors hover:bg-neutral-100"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className="mt-0.5 size-5 shrink-0 text-neutral-800" />
                                                <span className="text-sm leading-snug font-medium text-neutral-900 group-data-[collapsible=icon]:hidden">
                                                    Surat Dispensasi
                                                    <br />
                                                    Nikah
                                                </span>
                                            </div>
                                            <ChevronDown className="mt-1 size-4 shrink-0 text-neutral-700 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=closed]/collapsible:-rotate-90" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                        <div className="ml-6 flex flex-col gap-1 border-l border-neutral-300 py-1 pl-3">
                                            {suratDispensasiSubItems.map(
                                                (item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        prefetch
                                                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isCurrentUrl(
                                                                item.href,
                                                            )
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'
                                                        }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )}

                        {/* Registrasi PATEN */}
                        {isService && (
                            <Collapsible
                                defaultOpen={true}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <button
                                            type="button"
                                            className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-neutral-800 transition-colors hover:bg-neutral-100"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="size-5 shrink-0 text-neutral-800" />
                                                <span className="text-sm font-medium text-neutral-900 group-data-[collapsible=icon]:hidden">
                                                    Registrasi PATEN
                                                </span>
                                            </div>
                                            <ChevronDown className="size-4 shrink-0 text-neutral-700 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=closed]/collapsible:-rotate-90" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                        <div className="ml-6 flex flex-col gap-1 border-l border-neutral-300 py-1 pl-3">
                                            {patenRegistrationSubItems.map(
                                                (item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        prefetch
                                                        className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                                            isCurrentUrl(
                                                                item.href,
                                                            )
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900'
                                                        }`}
                                                    >
                                                        {item.title}
                                                    </Link>
                                                ),
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-neutral-200 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
