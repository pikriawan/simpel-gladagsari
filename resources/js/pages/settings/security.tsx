import { Form, Head, usePage } from '@inertiajs/react';
import { Check, Circle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/security';
import type { Auth } from '@/types';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';

// oxfmt-ignore
type Props = {
    passwordRules: string;
} &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { auth } = usePage<{ auth: Auth }>().props;

    const [newPassword, setNewPassword] = useState('');
    const [confirmationPassword, setConfirmationPassword] = useState('');

    const passwordRulesList = [
        {
            id: 'min-length',
            label: 'Minimal 8 karakter',
            met: newPassword.length >= 8,
        },
        {
            id: 'uppercase',
            label: 'Mengandung huruf besar (A-Z)',
            met: /[A-Z]/.test(newPassword),
        },
        {
            id: 'lowercase',
            label: 'Mengandung huruf kecil (a-z)',
            met: /[a-z]/.test(newPassword),
        },
    ];

    const isAllRulesMet = passwordRulesList.every((r) => r.met);
    const isConfirmationMatching =
        newPassword.length > 0 &&
        confirmationPassword.length > 0 &&
        newPassword === confirmationPassword;

    return (
        <>
            <Head title="Pengaturan Keamanan" />

            <h1 className="sr-only">Pengaturan Keamanan</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Perbarui kata sandi"
                    description="Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman"
                />

                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onSuccess={() => {
                        setNewPassword('');
                        setConfirmationPassword('');
                    }}
                    onError={(errors) => {
                        if (errors.password) {
                            setNewPassword('');
                            setConfirmationPassword('');
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    Kata sandi saat ini
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder="Kata sandi saat ini"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    Kata sandi baru
                                </Label>

                                <PasswordInput
                                    id="password"
                                    ref={passwordInput}
                                    name="password"
                                    value={newPassword}
                                    onChange={(e) =>
                                        setNewPassword(e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Kata sandi baru"
                                    passwordrules={props.passwordRules}
                                />

                                {/* Indikator aturan kata sandi secara live */}
                                <div className="rounded-lg border bg-muted/40 p-3 text-xs">
                                    <p className="mb-2 font-medium text-foreground/80">
                                        Syarat kata sandi:
                                    </p>
                                    <ul className="space-y-1.5">
                                        {passwordRulesList.map((rule) => (
                                            <li
                                                key={rule.id}
                                                className={cn(
                                                    'flex items-center gap-2 transition-colors',
                                                    rule.met
                                                        ? 'font-medium text-emerald-600 dark:text-emerald-400'
                                                        : newPassword.length > 0
                                                          ? 'text-muted-foreground'
                                                          : 'text-muted-foreground/70',
                                                )}
                                            >
                                                {rule.met ? (
                                                    <Check className="size-3.5 stroke-[2.5]" />
                                                ) : (
                                                    <Circle className="size-2.5 fill-muted-foreground/20 text-muted-foreground/40" />
                                                )}
                                                <span>{rule.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Konfirmasi kata sandi
                                </Label>

                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={confirmationPassword}
                                    onChange={(e) =>
                                        setConfirmationPassword(e.target.value)
                                    }
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    placeholder="Konfirmasi kata sandi"
                                    passwordrules={props.passwordRules}
                                />

                                {confirmationPassword.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-xs">
                                        {isConfirmationMatching ? (
                                            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                                <Check className="size-3.5 stroke-[2.5]" />
                                                Konfirmasi kata sandi cocok
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 font-medium text-destructive">
                                                <X className="size-3.5 stroke-[2.5]" />
                                                Konfirmasi kata sandi belum cocok
                                            </span>
                                        )}
                                    </div>
                                )}

                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={
                                        processing ||
                                        !isAllRulesMet ||
                                        (confirmationPassword.length > 0 &&
                                            !isConfirmationMatching)
                                    }
                                    data-test="update-password-button"
                                >
                                    Simpan
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>

            {auth.user.role !== 'administrator' && (
                <ManageTwoFactor
                    canManageTwoFactor={props.canManageTwoFactor}
                    requiresConfirmation={props.requiresConfirmation}
                    twoFactorEnabled={props.twoFactorEnabled}
                />
            )}
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Pengaturan Keamanan',
            href: edit(),
        },
    ],
};
