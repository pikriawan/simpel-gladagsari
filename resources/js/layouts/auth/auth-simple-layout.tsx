import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh w-full bg-white">
            {/* Panel Kiri – Form (50% pada desktop) */}
            <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 lg:w-1/2 lg:flex-none">
                {/* Logo Simpel pojok kiri atas */}
                <div className="absolute top-8 left-8 lg:top-[50px] lg:left-[50px]">
                    <Link
                        href={home()}
                        className="text-2xl font-bold tracking-tight text-black"
                        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                        Simpel
                    </Link>
                </div>

                {/* Konten Form (Lebar pas 400px seperti di SVG) */}
                <div className="w-full max-w-[400px]">
                    <div className="mb-9 space-y-3 text-center">
                        <h1 className="text-xl font-bold tracking-tight text-black lg:text-[22px]">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-sm leading-relaxed text-black">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>

            {/* Panel Kanan – Foto Kantor Kecamatan Gladagsari (50% dengan padding 24px dan rounded 12px sesuai SVG) */}
            <div className="relative hidden p-6 lg:block lg:w-1/2">
                <div className="relative h-full w-full overflow-hidden rounded-[12px]">
                    <img
                        src="/assets/kantor-kecamatan.jpg"
                        alt="Kantor Kecamatan Gladagsari"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                </div>
            </div>
        </div>
    );
}
