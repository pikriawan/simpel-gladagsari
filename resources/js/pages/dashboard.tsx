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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
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
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {isAdmin ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                <CardHeader>
                                    <CardTitle>Pegawai Terbaru</CardTitle>
                                    <CardDescription>
                                        5 akun terakhir yang ditambahkan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentUsers.length > 0 ? (
                                        <div className="divide-y">
                                            {recentUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between gap-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {user.name}
                                                        </p>
                                                        <p className="truncate text-sm text-muted-foreground">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">
                                                            {user.role}
                                                        </Badge>
                                                        <Badge
                                                            variant={
                                                                user.status === 'active'
                                                                    ? 'default'
                                                                    : 'destructive'
                                                            }
                                                        >
                                                            {user.status === 'active'
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
                                <CardHeader>
                                    <CardTitle>Aksi Cepat</CardTitle>
                                    <CardDescription>
                                        Kelola akun pegawai.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button asChild className="w-full justify-between">
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
                        <div className="grid gap-4 sm:grid-cols-1">
                            <StatCard
                                title="Total Surat Dispensasi"
                                value={stats.totalMarriageDispensations ?? 0}
                                description="Surat yang tersimpan"
                                icon={FileText}
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Surat Dispensasi Terbaru</CardTitle>
                                    <CardDescription>
                                        5 surat terakhir yang disimpan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentMarriageDispensations.length > 0 ? (
                                        <div className="divide-y">
                                            {recentMarriageDispensations.map((record) => (
                                                <div
                                                    key={record.id}
                                                    className="flex items-center justify-between gap-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {record.letter_number || '-'}
                                                        </p>
                                                        <p className="truncate text-sm text-muted-foreground">
                                                            {record.applicant_name || '-'} &amp;{' '}
                                                            {record.partner_name || '-'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm text-muted-foreground">
                                                        <p>{formatDate(record.marriage_date)}</p>
                                                        <p className="text-xs">
                                                            {record.village || '-'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Belum ada surat dispensasi yang tersimpan.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Aksi Cepat</CardTitle>
                                    <CardDescription>
                                        Akses fitur layanan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2">
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={editor()}>
                                            Editor Surat
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={history()}>
                                            Riwayat Surat
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={villageData()}>
                                            Data Desa dan Dukuh
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={templateSettings()}>
                                            Pengaturan Template
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-between">
                                        <Link href={patenEditor()}>
                                            Editor PATEN
                                            <ArrowRight className="size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="w-full justify-between">
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