import { Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    FileText,
    LayoutGrid,
    Users,
} from 'lucide-react';
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

    const isAdmin = auth.user.role === 'administrator';
    const isService = auth.user.role === 'service';

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-white">
            <SidebarHeader className="px-5 pt-6 pb-2 group-data-[collapsible=icon]:px-2">
                <Link
                    href={dashboard()}
                    prefetch
                    className="font-bold text-2xl tracking-tight text-neutral-900 block group-data-[collapsible=icon]:hidden"
                >
                    Simpel
                </Link>
                <Link
                    href={dashboard()}
                    prefetch
                    className="font-bold text-xl tracking-tight text-neutral-900 hidden group-data-[collapsible=icon]:block text-center"
                >
                    S
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2">
                <SidebarGroup className="p-0">
                    <SidebarMenu className="gap-2">
                        {/* Dashboard */}
                        <SidebarMenuItem>
                            <Link
                                href={dashboard()}
                                prefetch
                                className={`flex items-center gap-3 w-full h-11 px-3.5 rounded-lg text-sm font-medium transition-colors ${
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
                                    className={`flex items-center gap-3 w-full h-11 px-3.5 rounded-lg text-sm font-medium transition-colors ${
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
                                            className="flex items-start justify-between w-full px-3.5 py-2.5 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors group cursor-pointer text-left"
                                        >
                                            <div className="flex items-start gap-3">
                                                <FileText className="size-5 text-neutral-800 shrink-0 mt-0.5" />
                                                <span className="text-sm font-medium text-neutral-900 leading-snug group-data-[collapsible=icon]:hidden">
                                                    Surat Dispensasi
                                                    <br />
                                                    Nikah
                                                </span>
                                            </div>
                                            <ChevronDown className="size-4 text-neutral-700 shrink-0 mt-1 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[collapsible=icon]:hidden" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                        <div className="ml-6 pl-3 py-1 flex flex-col gap-1 border-l border-neutral-300">
                                            {suratDispensasiSubItems.map(
                                                (item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        prefetch
                                                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            isCurrentUrl(item.href)
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
                                            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-lg text-neutral-800 hover:bg-neutral-100 transition-colors group cursor-pointer text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="size-5 text-neutral-800 shrink-0" />
                                                <span className="text-sm font-medium text-neutral-900 group-data-[collapsible=icon]:hidden">
                                                    Registrasi PATEN
                                                </span>
                                            </div>
                                            <ChevronDown className="size-4 text-neutral-700 shrink-0 transition-transform duration-200 group-data-[state=closed]/collapsible:-rotate-90 group-data-[collapsible=icon]:hidden" />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                        <div className="ml-6 pl-3 py-1 flex flex-col gap-1 border-l border-neutral-300">
                                            {patenRegistrationSubItems.map(
                                                (item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        prefetch
                                                        className={`flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                            isCurrentUrl(item.href)
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
