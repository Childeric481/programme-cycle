// Cas particuliers : circuit abdos (séance 4) et retour après la fin d'un repos.
// Usage : node scripts/parcours-cas.mjs [adresse]

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ADRESSE = process.argv[2] ?? 'http://localhost:5190/programme-cycle/';
const SORTIE = new URL('../captures/parcours/', import.meta.url);
mkdirSync(SORTIE, { recursive: true });
const fichier = (n) => fileURLToPath(new URL(`cas-${n}.png`, SORTIE));
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const verifs = [];
const verifier = (nom, ok, detail = '') => verifs.push(`${ok ? 'OK ' : 'ÉCHEC'} ${nom}${detail ? ` (${detail})` : ''}`);

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(String(e)));

// --- Circuit abdos ---------------------------------------------------------
await page.goto(`${ADRESSE}#/seances/4`);
await page.waitForSelector('.detail__titre');
await page.getByRole('button', { name: 'Commencer la séance' }).click();
await page.waitForSelector('.etape__titre');
await page.getByRole('button', { name: 'Commencer les exercices' }).click();
for (let i = 0; i < 7; i++) {
  await page.waitForTimeout(350);
  const suivante = page.getByRole('button', { name: 'Étape suivante' });
  if (await suivante.isDisabled()) break;
  await suivante.click();
}
await page.waitForSelector('.etape__tour');
await attendre(400);
await page.screenshot({ path: fichier('circuit') });
const tour = await page.locator('.etape__tour').textContent();
verifier('circuit : tour 1 sur 3', tour === 'Tour 1 sur 3', tour ?? '');
for (const ligne of await page.locator('.cocher').all()) await ligne.click();
await page.getByRole('button', { name: 'Valider le tour 1' }).click();
await page.locator('.montee:not(.montee--cachee)').getByRole('button', { name: 'Reprendre' }).waitFor({ timeout: 2000 });
const ensuite = await page.locator('.repos__ensuite').textContent();
verifier('circuit : repos entre les tours', ensuite === 'Ensuite, tour 2 sur 3.', ensuite ?? '');
await page.locator('.montee:not(.montee--cachee)').getByRole('button', { name: 'Reprendre' }).click();
await attendre(300);
const cochees = await page.locator('.cocher--cochee').count();
verifier('circuit : cases décochées au nouveau tour', cochees === 0, `${cochees} cochée(s)`);
for (const n of [2, 3]) {
  await page.getByRole('button', { name: `Valider le tour ${n}` }).click();
  if (n < 3) {
    const r = page.locator('.montee:not(.montee--cachee)').getByRole('button', { name: 'Reprendre' });
    await r.waitFor({ timeout: 2000 });
    await r.click();
    await attendre(300);
  }
}
await attendre(400);
await page.screenshot({ path: fichier('circuit-termine') });
verifier('circuit : « Circuit terminé »', (await page.locator('.etape__tour').textContent()) === 'Circuit terminé');
await page.getByRole('button', { name: 'Terminer la séance' }).click();
await page.waitForSelector('.fin__titre');
verifier('circuit : fin de séance', true);

// --- Retour après la fin d'un repos -----------------------------------------
await page.goto(`${ADRESSE}#/seances/1`);
await page.waitForSelector('.detail__titre');
await page.getByRole('button', { name: 'Commencer la séance' }).click();
await page.waitForSelector('.etape__titre');
await page.getByRole('button', { name: 'Commencer les exercices' }).click();
await page.waitForSelector('.exercice__nom');
await page.getByRole('button', { name: 'Valider la série 1' }).click();
await attendre(800);
// Le repos s'est terminé il y a 40 s pendant que l'application était fermée.
await page.evaluate(
  () =>
    new Promise((ok, ko) => {
      const r = indexedDB.open('programme');
      r.onsuccess = () => {
        const tx = r.result.transaction('seance', 'readwrite');
        const store = tx.objectStore('seance');
        const g = store.get('en-cours');
        g.onsuccess = () => {
          const s = g.result;
          s.repos = { ...s.repos, fin: Date.now() - 40_000, resteEnPause: null };
          store.put(s, 'en-cours');
        };
        tx.oncomplete = () => ok(true);
        tx.onerror = () => ko(tx.error);
      };
    }),
);
await page.reload();
await page.waitForSelector('.repos__libelle');
await attendre(300);
const libelle = await page.locator('.repos__libelle').textContent();
verifier('retour après la fin du repos', /^Repos terminé il y a 0:4\d$/.test(libelle ?? ''), libelle ?? '');
await page.screenshot({ path: fichier('repos-termine-il-y-a') });
await attendre(3400);
const apres = await page.getByRole('button', { name: 'Valider la série 2' }).count();
verifier('puis la séance enchaîne', apres === 1);

console.log(verifs.join('\n'));
if (erreurs.length) console.log('Erreurs :', erreurs);
await nav.close();
