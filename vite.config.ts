import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import { pwa } from './build/pwa.ts';

const paquet = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// GitHub Pages sert l'application sous /<nom-du-dépôt>/. Le manifest aligne
// start_url et scope sur cette base.
const BASE = process.env['BASE_PATH'] ?? '/programme-cycle/';

export default defineConfig({
  base: BASE,
  define: {
    __VERSION__: JSON.stringify(paquet.version),
  },
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    sourcemap: false,
  },
  server: {
    port: 5190,
    strictPort: true,
  },
  preview: {
    port: 4190,
    strictPort: true,
  },
  plugins: [
    pwa({
      nom: 'Programme',
      description: 'Séances, repos et progrès.',
      couleurFond: '#f3f5f6',
    }),
  ],
});
