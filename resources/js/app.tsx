import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';
import '../../src/styles.css';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { AuthProvider } from '../../src/context/AuthContext.jsx';
import { DataProvider } from '../../src/context/DataContext.jsx';

const appName = import.meta.env.VITE_APP_NAME || 'Simpel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case [
                'root/login',
                'root/authentication',
                'root/forgot-password',
                'root/reset-password',
            ].includes(name):
                return null;
            case name.startsWith('root/'):
                return AppLayout;
            case name === 'welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                <DataProvider>
                    <AuthProvider>
                        {app}
                        <Toaster />
                    </AuthProvider>
                </DataProvider>
            </TooltipProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
