import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props;

    return <h1 className="text-lg font-medium tracking-tight">{name}</h1>;
}
