import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Login" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="flex flex-col gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-sm font-medium text-black"
                                >
                                    NIP atau email
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Masukkan NIP atau email Anda"
                                    className="h-[42px] rounded-[4px] border-[#CCCCCC] placeholder:text-[#999999] focus-visible:border-[#3489D2] focus-visible:ring-[#3489D2]/20"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm font-medium text-black"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[#3489D2] hover:underline"
                                            tabIndex={5}
                                        >
                                            Lupa password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan password Anda"
                                    className="h-[42px] rounded-[4px] border-[#CCCCCC] placeholder:text-[#999999] focus-visible:border-[#3489D2] focus-visible:ring-[#3489D2]/20"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-1 h-[42px] w-full rounded-[4px] bg-[#3489D2] font-medium text-white shadow-none hover:bg-[#2c76b5]"
                                tabIndex={3}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Login
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Login ke akun Anda',
    description: 'Masukkan NIP atau email dan password Anda di bawah ini untuk login.',
};
