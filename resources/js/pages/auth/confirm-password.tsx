import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Konfirmasi Password" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="text-sm font-medium text-black">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Masukkan password Anda"
                                autoComplete="current-password"
                                autoFocus
                                className="h-[42px] rounded-[4px] border-[#CCCCCC] placeholder:text-[#999999] focus-visible:border-[#3489D2] focus-visible:ring-[#3489D2]/20"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full h-[42px] rounded-[4px] bg-[#3489D2] hover:bg-[#2c76b5] text-white font-medium shadow-none"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                Konfirmasi Password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi Password',
    description:
        'Ini adalah area aman. Konfirmasi password Anda sebelum melanjutkan.',
};
