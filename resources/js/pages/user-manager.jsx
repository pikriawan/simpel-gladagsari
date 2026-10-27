import { Head, useHttp, useForm } from '@inertiajs/react';
import { ShieldCheck, SquarePen, Trash, UserPlus } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { userManager } from '@/routes';

const statuses = [
    { value: 'active', label: 'Aktif' },
    { value: 'inactive', label: 'Tidak aktif' },
];

export default function UserManager({ users }) {
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            name: '',
            nip: '',
            email: '',
            password: '',
            password_confirmation: '',
            status: 'active',
        });

    const { delete: destroy, processing: deleting } = useForm({});

    const [twoFactorUser, setTwoFactorUser] = useState(null);
    const [qrCodeSvg, setQrCodeSvg] = useState(null);
    const [manualSetupKey, setManualSetupKey] = useState(null);

    const twoFactorForm = useHttp({ code: '' });

    const { submit: enableTwoFactorRequest, processing: enablingTwoFactor } =
        useHttp();
    const { submit: disableTwoFactorRequest, processing: disablingTwoFactor } =
        useHttp();

    const openTwoFactorDialog = (user) => {
        setTwoFactorUser(user);
        setQrCodeSvg(null);
        setManualSetupKey(null);
        twoFactorForm.reset();
        twoFactorForm.clearErrors();
    };

    const closeTwoFactorDialog = () => {
        setTwoFactorUser(null);
        setQrCodeSvg(null);
        setManualSetupKey(null);
        twoFactorForm.reset();
        twoFactorForm.clearErrors();
    };

    const generateQrCode = async () => {
        if (!twoFactorUser) {
            return;
        }

        try {
            const response = await enableTwoFactorRequest(
                UserController.enableTwoFactor(twoFactorUser.id),
            );

            setQrCodeSvg(response.svg);
            setManualSetupKey(response.secretKey);
        } catch {
            // Keep the dialog usable even if QR generation fails.
        }
    };

    const confirmTwoFactor = async () => {
        if (!twoFactorUser) {
            return;
        }

        try {
            await twoFactorForm.submit(
                UserController.confirmTwoFactor(twoFactorUser.id),
            );

            setTwoFactorUser({
                ...twoFactorUser,
                two_factor_confirmed_at: new Date().toISOString(),
            });
            setQrCodeSvg(null);
            setManualSetupKey(null);
            twoFactorForm.reset();
            twoFactorForm.clearErrors();
        } catch {
            // Validation errors are exposed through twoFactorForm.errors.
        }
    };

    const disableTwoFactor = async () => {
        if (!twoFactorUser) {
            return;
        }

        try {
            await disableTwoFactorRequest(
                UserController.disableTwoFactor(twoFactorUser.id),
            );

            setTwoFactorUser({
                ...twoFactorUser,
                two_factor_confirmed_at: null,
                two_factor_secret: null,
            });
            setQrCodeSvg(null);
            setManualSetupKey(null);
        } catch {
            // Keep the dialog usable if disabling fails.
        }
    };

    const openCreateDialog = () => {
        setEditingUser(null);
        reset();
        clearErrors();
        setOpen(true);
    };

    const openEditDialog = (user) => {
        setEditingUser(user);
        clearErrors();
        setData({
            name: user.name ?? '',
            nip: user.nip ?? '',
            email: user.email,
            password: '',
            password_confirmation: '',
            status: user.status,
        });
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                setEditingUser(null);
                reset();
            },
        };

        if (editingUser) {
            put(UserController.update.url(editingUser.id), options);
        } else {
            post(UserController.store.url(), options);
        }
    };

    const handleOpenChange = (nextOpen) => {
        setOpen(nextOpen);

        if (!nextOpen) {
            setEditingUser(null);
            clearErrors();
        }
    };

    const confirmDelete = () => {
        if (!userToDelete) {
            return;
        }

        destroy(UserController.destroy.url(userToDelete.id), {
            preserveScroll: true,
            onSuccess: () => setUserToDelete(null),
        });
    };

    return (
        <>
            <Head title="Users" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex">
                    <Button onClick={openCreateDialog}>
                        <UserPlus />
                        Tambah pegawai baru
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pegawai</TableHead>
                            <TableHead>NIP</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.nip}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.status}</TableCell>
                                <TableCell className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() =>
                                            openTwoFactorDialog(user)
                                        }
                                    >
                                        <ShieldCheck />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => openEditDialog(user)}
                                    >
                                        <SquarePen />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        disabled={user.role === 'administrator'}
                                        onClick={() => setUserToDelete(user)}
                                    >
                                        <Trash stroke="#FF2400" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-lg">
                    <form onSubmit={submit} className="space-y-4">
                        <DialogHeader>
                            <DialogTitle>
                                {editingUser
                                    ? 'Ubah Pegawai'
                                    : 'Tambah Pegawai Baru'}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(event) =>
                                        setData('name', event.target.value)
                                    }
                                    placeholder="Nama"
                                    autoComplete="name"
                                    required
                                    aria-invalid={Boolean(errors.name)}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nip">NIP</Label>
                                <Input
                                    id="nip"
                                    name="nip"
                                    value={data.nip}
                                    onChange={(event) =>
                                        setData('nip', event.target.value)
                                    }
                                    placeholder="NIP"
                                    required
                                    aria-invalid={Boolean(errors.nip)}
                                />
                                <InputError message={errors.nip} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                placeholder="Email"
                                autoComplete="email"
                                required
                                aria-invalid={Boolean(errors.email)}
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) =>
                                    setData('status', value)
                                }
                                disabled={editingUser?.role === 'administrator'}
                            >
                                <SelectTrigger
                                    id="status"
                                    className="w-full"
                                    aria-invalid={Boolean(errors.status)}
                                >
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((status) => (
                                        <SelectItem
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {status.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {editingUser?.role === 'administrator' && (
                                <p className="text-sm text-muted-foreground">
                                    Status administrator tidak dapat diubah.
                                </p>
                            )}
                            <InputError message={errors.status} />
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {editingUser ? 'Password baru' : 'Password'}
                                </Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                    placeholder={
                                        editingUser
                                            ? 'Kosongkan jika tidak diubah'
                                            : 'Password'
                                    }
                                    autoComplete="new-password"
                                    required={!editingUser}
                                    aria-invalid={Boolean(errors.password)}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(event) =>
                                        setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Konfirmasi password"
                                    autoComplete="new-password"
                                    required={!editingUser}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {editingUser ? 'Perbarui' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(userToDelete)}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setUserToDelete(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Pegawai</DialogTitle>
                        <DialogDescription>
                            Yakin ingin menghapus {userToDelete?.name}? Tindakan
                            ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setUserToDelete(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleting}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={Boolean(twoFactorUser)}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        closeTwoFactorDialog();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verifikasi 2 Langkah</DialogTitle>
                        <DialogDescription>
                            {twoFactorUser?.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    twoFactorUser?.two_factor_confirmed_at
                                        ? 'default'
                                        : 'destructive'
                                }
                            >
                                {twoFactorUser?.two_factor_confirmed_at
                                    ? 'Verifikasi 2 Langkah aktif'
                                    : 'Verifikasi 2 Langkah tidak aktif'}
                            </Badge>
                        </div>

                        {!twoFactorUser?.two_factor_confirmed_at && (
                            <>
                                <Button
                                    type="button"
                                    onClick={generateQrCode}
                                    disabled={enablingTwoFactor}
                                >
                                    Generate QR Code
                                </Button>

                                {qrCodeSvg && (
                                    <div className='flex justify-center'>
                                        <div
                                            className="p-4 bg-white"
                                            dangerouslySetInnerHTML={{
                                                __html: qrCodeSvg,
                                            }}
                                        />
                                    </div>
                                )}

                                {manualSetupKey && (
                                    <p className="text-sm break-all text-muted-foreground">
                                        Kunci manual: {manualSetupKey}
                                    </p>
                                )}

                                {qrCodeSvg && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="two_factor_code">
                                            Kode OTP
                                        </Label>
                                        <Input
                                            id="two_factor_code"
                                            value={twoFactorForm.data.code}
                                            onChange={(event) =>
                                                twoFactorForm.setData(
                                                    'code',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Masukkan kode OTP"
                                            inputMode="numeric"
                                        />
                                        <InputError
                                            message={twoFactorForm.errors.code}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {twoFactorUser?.two_factor_confirmed_at && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={disableTwoFactor}
                                disabled={disablingTwoFactor}
                            >
                                Nonaktifkan 2FA
                            </Button>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={closeTwoFactorDialog}
                        >
                            Tutup
                        </Button>
                        {!twoFactorUser?.two_factor_confirmed_at && (
                            <Button
                                type="button"
                                onClick={confirmTwoFactor}
                                disabled={
                                    twoFactorForm.processing ||
                                    !twoFactorForm.data.code ||
                                    !qrCodeSvg
                                }
                            >
                                Lanjutkan
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

UserManager.layout = {
    breadcrumbs: [
        {
            title: 'User Manager',
            href: userManager(),
        },
    ],
};
