// Plugin de construction : manifest, balises d'installation et service worker
// avec la liste complète des fichiers à mettre en cache.

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { transformWithOxc, type Plugin, type ResolvedConfig } from 'vite';

export interface OptionsPwa {
  nom: string;
  couleurFond: string;
  description: string;
}

function fichiers(dossier: string): string[] {
  let out: string[] = [];
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) out = out.concat(fichiers(chemin));
    else out.push(chemin);
  }
  return out;
}

export function pwa(options: OptionsPwa): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'programme-pwa',
    apply: 'build',
    enforce: 'post',

    configResolved(c) {
      config = c;
    },

    transformIndexHtml() {
      const base = config.base;
      return [
        { tag: 'link', attrs: { rel: 'manifest', href: `${base}manifest.webmanifest` }, injectTo: 'head' },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${base}icons/apple-touch-icon.png` }, injectTo: 'head' },
      ];
    },

    async generateBundle(_, bundle) {
      const base = config.base;
      const manifest = {
        id: base,
        name: options.nom,
        short_name: options.nom,
        description: options.description,
        lang: 'fr',
        dir: 'ltr',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: options.couleurFond,
        theme_color: options.couleurFond,
        prefer_related_applications: false,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      };
      const manifestTexte = JSON.stringify(manifest, null, 2);
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifestTexte });

      if (!bundle['index.html']) throw new Error('index.html absent du bundle : ordre des plugins à revoir.');

      const publics = fichiers(config.publicDir).map((f) => relative(config.publicDir, f).split('\\').join('/'));
      const liste = [...new Set([...Object.keys(bundle), ...publics, 'manifest.webmanifest'])]
        .filter((f) => !f.endsWith('.map') && f !== 'sw.js')
        .sort();

      // Version du cache : empreinte du contenu de tous les fichiers.
      const empreinte = createHash('sha256');
      for (const f of liste) {
        const item = bundle[f];
        empreinte.update(f);
        if (item) empreinte.update(item.type === 'chunk' ? item.code : item.source);
        else if (f === 'manifest.webmanifest') empreinte.update(manifestTexte);
        else empreinte.update(readFileSync(join(config.publicDir, f)));
      }
      const version = empreinte.digest('hex').slice(0, 12);

      const source = readFileSync(join(config.root, 'src/sw/sw.ts'), 'utf8');
      const { code } = await transformWithOxc(source, 'sw.ts');
      const entete = `const PRECACHE = ${JSON.stringify(liste)};\nconst CACHE_VERSION = ${JSON.stringify(version)};\n`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: entete + code });
    },
  };
}
