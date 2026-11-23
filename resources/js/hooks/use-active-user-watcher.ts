import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

export function useActiveUserWatcher(): void {
    const { auth } = usePage<{ auth?: Auth }>().props;

    useEffect(() => {
        if (!auth?.user) {
            return;
        }

        let isChecking = false;

        const checkStatus = async () => {
            if (isChecking) return;
            isChecking = true;

            try {
                const response = await fetch('/auth/status', {
                    headers: {
                        Accept: 'application/json',
                    },
                });

                if (response.status === 401) {
                    window.location.href = '/login';
                    return;
                }

                if (response.ok) {
                    const data = (await response.json()) as { active?: boolean };
                    if (data.active === false) {
                        window.location.href = '/login';
                        return;
                    }
                }
            } catch {
                // Jangan melempar error saat jaringan sesaat offline
            } finally {
                isChecking = false;
            }
        };

        // Periksa setiap 3 detik secara berkala
        const intervalId = window.setInterval(checkStatus, 3000);

        // Periksa juga begitu tab kembali aktif / dibuka
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                void checkStatus();
            }
        };

        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [auth?.user?.id]);
}

