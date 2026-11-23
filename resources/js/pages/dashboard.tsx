import { Head, Link, usePage } from '@inertiajs/react';
import type { ComponentType } from 'react';
import {
    ArrowRight,
    FileText,
    LayoutGrid,
    Users,
    UserCheck,
    UserX,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { formatLetterNumber } from '@/lib/format';

type RecentUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
};

type RecentDispensation = {
    id: number;
    letter_number: string | null;
    applicant_name: string | null;
    partner_name: string | null;
    marriage_date: string | null;
    village: string | null;
    created_at: string;
};

type DashboardProps = {
    stats?: {
        totalUsers?: number;
        activeUsers?: number;
        inactiveUsers?: number;
        serviceUsers?: number;
        totalMarriageDispensations?: number;
    };
    recentUsers?: RecentUser[];
    recentMarriageDispensations?: RecentDispensation[];
};

function formatDate(value: string | null) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
}: {
    title: string;
    value: string | number;
    description?: string;
    icon: ComponentType<{ className?: string }>;
}) {
    return (
        <Card className="overflow-hidden p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3.5 pb-1 sm:p-6 sm:pb-2">
                <CardTitle className="truncate text-xs font-medium sm:text-sm">
                    {title}
                </CardTitle>
                <Icon className="size-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3.5 pt-0 sm:p-6 sm:pt-0">
                <div className="text-xl font-bold sm:text-2xl">{value}</div>
                {description && (
                    <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({
    stats = {},
    recentUsers = [],
    recentMarriageDispensations = [],
}: DashboardProps) {
    const { auth } = usePage().props;
    const isAdmin = auth.user.role === 'administrator';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                {isAdmin ? (
                    <>
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                            <StatCard
                                title="Total Pegawai"
                                value={stats.totalUsers ?? 0}
                                description="Seluruh akun terdaftar"
                                icon={Users}
                            />
                            <StatCard
                                title="Pegawai Aktif"
                                value={stats.activeUsers ?? 0}
                                description="Dapat mengakses sistem"
                                icon={UserCheck}
                            />
                            <StatCard
                                title="Pegawai Nonaktif"
                                value={stats.inactiveUsers ?? 0}
                                description="Akses dinonaktifkan"
                                icon={UserX}
                            />
                            <StatCard
                                title="Pegawai Layanan"
                                value={stats.serviceUsers ?? 0}
                                description="Role service"
                                icon={LayoutGrid}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle>Pegawai Terbaru</CardTitle>
                                    <CardDescription>
                                        5 akun terakhir yang ditambahkan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                    {recentUsers.length > 0 ? (
                                        <div className="divide-y">
                                            {recentUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium sm:text-base">
                                                            {user.name}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 self-start sm:self-auto">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {user.role}
                                                        </Badge>
                                                        <Badge
                                                            variant={
                                                                user.status ===
                                                                'active'
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                            className="text-xs"
                                                        >
                                                            {user.status ===
                                                            'active'
                                                                ? 'Aktif'
                                                                : 'Nonaktif'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Belum ada data pegawai.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle>Aksi Cepat</CardTitle>
                                    <CardDescription>
                                        Kelola akun pegawai.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 p-4 pt-0 sm:p-6 sm:pt-0">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={userManager()}>
                                            User Manager
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                            <StatCard
                                title="Total Surat Dispensasi"
                                value={stats.totalMarriageDispensations ?? 0}
                                description="Surat yang tersimpan"
                                icon={FileText}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle>
                                        Surat Dispensasi Terbaru
                                    </CardTitle>
                                    <CardDescription>
                                        5 surat terakhir yang disimpan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                    {recentMarriageDispensations.length > 0 ? (
                                        <div className="divide-y">
                                            {recentMarriageDispensations.map(
                                                (record) => (
                                                    <div
                                                        key={record.id}
                                                        className="flex flex-col justify-between gap-1.5 py-3 sm:flex-row sm:items-center sm:gap-4"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium sm:text-base">
                                                                {formatLetterNumber(
                                                                    record.letter_number,
                                                                    record.marriage_date ||
                                                                        record.created_at,
                                                                )}
                                                            </p>
                                                            <p className="truncate text-xs text-muted-foreground sm:text-sm">
                                                                {record.applicant_name ||
                                                                    '-'}{' '}
                                                                &amp;{' '}
                                                                {record.partner_name ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                        <div className="flex shrink-0 items-center justify-between gap-1 text-xs text-muted-foreground sm:flex-col sm:items-end sm:justify-start">
                                                            <p>
                                                                {formatDate(
                                                                    record.marriage_date,
                                                                )}
                                                            </p>
                                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs">
                                                                {record.village ||
                                                                    '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Belum ada surat dispensasi yang
                                            tersimpan.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle>Aksi Cepat</CardTitle>
                                    <CardDescription>
                                        Akses fitur layanan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 gap-2 p-4 pt-0 sm:grid-cols-2 sm:p-6 sm:pt-0 lg:grid-cols-1">
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={editor()}>
                                            Editor Surat
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={history()}>
                                            Riwayat Surat
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={villageData()}>
                                            Data Desa dan Dukuh
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={templateSettings()}>
                                            Pengaturan Template
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={patenEditor()}>
                                            Editor PATEN
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="w-full justify-between"
                                    >
                                        <Link href={patenTemplate()}>
                                            Template PATEN
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
