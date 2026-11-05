import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function HeaderActions({ children }: { children: React.ReactNode }) {
    const [target, setTarget] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setTarget(document.getElementById('header-actions'));
    }, []);

    if (!target) return null;
    return createPortal(children, target);
}

