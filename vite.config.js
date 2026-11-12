import path from 'node:path';
import { fileURLToPath } from 'node:url';
import inertia from '@inertiajs/vite';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins } from 'vite-plus';

const root = path.dirname(fileURLToPath(import.meta.url));
const laravelTarget = 'http://127.0.0.1:8000';

export default defineConfig({
  plugins: lazyPlugins(() => [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      refresh: true,
      fonts: [
        bunny('Instrument Sans', { weights: [400, 500, 600] }),
        bunny('Inter', { weights: [400, 500, 600] }),
      ],
    }),
    inertia(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ]),
  resolve: {
    alias: { '@': path.resolve(root, 'resources/js') },
  },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': { target: laravelTarget },
      '/paten-registration': { target: laravelTarget },
      '/registrasi-paten': { target: laravelTarget },
    },
  },
});
