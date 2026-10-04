// Captures de la planche de direction (E.9), à 390 × 844 et 360 × 800.
// Usage : node scripts/captures-planche.mjs [adresse]
// Par défaut, le serveur de développement : http://localhost:5190/programme-cycle/#/planche

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ADRESSE = process.argv[2] ?? 'http://localhost:5190/programme-cycle/#/planche';
const SORTIE = new URL('../captures/planche/', import.meta.url);
mkdirSync(SORTIE, { recursive: true });

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function bouton(cadre, texte) {
  await cadre.locator('xpath=..').getByRole('button', { name: texte, exact: true }).first().click();
}

async function session(nav, largeur, hauteur, schema) {
  const contexte = await nav.newContext({ viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 2, colorScheme: schema });
  const page = await contexte.newPage();
  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
  await page.goto(ADRESSE);
  await page.waitForSelector('.planche__telephone');
  await page.evaluate(() => document.fonts.ready);
  const nom = (n) => fileURLToPath(new URL(`${largeur}-${schema}-${n}.png`, SORTIE));
  return { contexte, page, erreurs, nom };
}

const nav = await chromium.launch();

for (const [l, h] of [[390, 844], [360, 800]]) {
  for (const schema of ['light', 'dark']) {
    const { contexte, page, erreurs, nom } = await session(nav, l, h, schema);
    const [cadreExo, cadreRepos] = await page.locator('.planche__telephone').all();
    const themeCadres = schema === 'dark' ? 'Sombre' : 'Clair';

    // Écran d'exercice
    await bouton(cadreExo, themeCadres);
    await cadreExo.scrollIntoViewIfNeeded();
    await attendre(300);
    await cadreExo.screenshot({ path: nom('exercice-0') });
    await cadreExo.getByRole('button', { name: 'Valider la série 1' }).click();
    await attendre(450);
    await cadreExo.screenshot({ path: nom('exercice-1-chargement') });
    await attendre(1600);
    await cadreExo.screenshot({ path: nom('exercice-1-repos') });
    await cadreExo.getByRole('button', { name: 'Reprendre' }).click();
    await attendre(300);
    await cadreExo.getByRole('button', { name: 'Valider la série 2' }).click();
    await attendre(500);
    await cadreExo.getByRole('button', { name: 'Reprendre' }).click();
    await attendre(300);
    await cadreExo.getByRole('button', { name: 'Pourquoi' }).click();
    await attendre(400);
    await cadreExo.screenshot({ path: nom('exercice-2-pourquoi') });

    // Écran de repos, chaque séance au départ, puis à mi-course
    await bouton(cadreRepos, themeCadres);
    await cadreRepos.scrollIntoViewIfNeeded();
    for (const s of [1, 2, 3, 4, 5]) {
      await bouton(cadreRepos, `Séance ${s}`);
      await attendre(350);
      await cadreRepos.screenshot({ path: nom(`repos-s${s}-depart`) });
    }
    await bouton(cadreRepos, 'Séance 4');
    await attendre(6200);
    await cadreRepos.screenshot({ path: nom('repos-s4-milieu') });
    await cadreRepos.getByRole('button', { name: 'Pause' }).click();
    await attendre(300);
    await cadreRepos.screenshot({ path: nom('repos-s4-pause') });
    await cadreRepos.getByRole('button', { name: 'Relancer' }).click();
    await attendre(5600);
    await cadreRepos.screenshot({ path: nom('repos-s4-zero') });

    // Sections statiques (une seule largeur suffit)
    if (l === 390 && schema === 'light') {
      for (const [i, n] of [[2, 'disques'], [3, 'jetons'], [4, 'typo']]) {
        const section = page.locator('.planche__section').nth(i);
        await section.scrollIntoViewIfNeeded();
        await section.screenshot({ path: nom(n) });
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: nom('entete') });
    }

    if (erreurs.length) console.log(`${l} ${schema} erreurs :`, erreurs);
    await contexte.close();
    console.log(`${l} × ${h} ${schema} : fait`);
  }
}

await nav.close();
