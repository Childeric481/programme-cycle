// Parcours complet (E.9, G) : accueil, détail, séance guidée de bout en bout,
// pause, fermeture pendant un repos puis réouverture, fin de séance.
// Captures à 390 × 844 dans captures/parcours/.
// Usage : node scripts/parcours.mjs [adresse] [clair|sombre]

import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ADRESSE = process.argv[2] ?? 'http://localhost:5190/programme-cycle/';
const SCHEMA = process.argv[3] === 'sombre' ? 'dark' : 'light';
const SORTIE = new URL('../captures/parcours/', import.meta.url);
mkdirSync(SORTIE, { recursive: true });
const fichier = (n) => fileURLToPath(new URL(`${SCHEMA}-${n}.png`, SORTIE));
const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: SCHEMA });
const page = await ctx.newPage();
const erreurs = [];
page.on('pageerror', (e) => erreurs.push(String(e)));
page.on('console', (m) => m.type() === 'error' && erreurs.push(m.text()));
const verifs = [];
const verifier = (nom, ok, detail = '') => verifs.push(`${ok ? 'OK ' : 'ÉCHEC'} ${nom}${detail ? ` (${detail})` : ''}`);

await page.goto(ADRESSE);
await page.waitForSelector('.aujourdhui__date');
await page.evaluate(() => document.fonts.ready);
await attendre(1100);
await page.screenshot({ path: fichier('01-aujourdhui') });
await page.screenshot({ path: fichier('01-aujourdhui-page'), fullPage: true });
const titreJour = await page.locator('.jour__titre').textContent();
verifier('accueil : séance du jour', Boolean(titreJour), titreJour ?? '');

// Détail de la séance du jour, puis retour
await page.getByRole('link', { name: 'Voir le détail' }).click();
await page.waitForSelector('.detail__titre');
await attendre(500);
await page.screenshot({ path: fichier('02-detail') });
await page.screenshot({ path: fichier('02-detail-page'), fullPage: true });
await page.getByRole('button', { name: 'Retour' }).click();
await page.waitForSelector('.aujourdhui__date');
await attendre(300);

// Onglet Séances
await page.getByRole('link', { name: 'Séances' }).click();
await page.waitForSelector('.seances__ligne');
await attendre(300);
await page.screenshot({ path: fichier('03-seances') });

// Séance 1 depuis la liste (pour avoir des saisies en kg)
await page.locator('.seances__ligne').first().click();
await page.waitForSelector('.detail__titre');
await page.getByRole('button', { name: 'Commencer la séance' }).click();
await page.waitForSelector('.etape__titre');
await attendre(300);
await page.screenshot({ path: fichier('04-echauffement') });
for (const ligne of await page.locator('.cocher').all()) await ligne.click();
await page.screenshot({ path: fichier('05-echauffement-coche') });
await page.getByRole('button', { name: 'Commencer les exercices' }).click();
await page.waitForSelector('.exercice__nom');
await attendre(400);
await page.screenshot({ path: fichier('06-exercice') });

// Saisie au clavier puis première série
const champ = page.locator('.saisie__entree').first();
await champ.click();
await champ.fill('62,5');
await page.getByRole('button', { name: 'Valider la série 1' }).click();
await attendre(1100);
await page.screenshot({ path: fichier('07-repos') });
const ensuite = await page.locator('.repos__ensuite').textContent();
verifier('repos : ligne « Ensuite »', ensuite === 'Ensuite, série 2 sur 4.', ensuite ?? '');

// Fermeture de l'application pendant le repos, réouverture : le repos reprend au bon temps.
const resteAvant = await page.locator('.cadran__temps').textContent();
await attendre(3000);
await page.reload();
await page.waitForSelector('.cadran__temps');
await attendre(400);
const resteApres = await page.locator('.cadran__temps').textContent();
const sec = (t) => {
  const [m, s] = (t ?? '0:00').split(':').map(Number);
  return m * 60 + s;
};
const ecart = sec(resteAvant) - sec(resteApres);
verifier('réouverture pendant un repos', ecart >= 3 && ecart <= 5, `${resteAvant} puis ${resteApres}`);
await page.screenshot({ path: fichier('08-repos-apres-reouverture') });
await page.getByRole('button', { name: 'Reprendre' }).click();
await attendre(400);

// Pause depuis la croix, retour à l'accueil, reprise
await page.getByRole('button', { name: 'Fermer la séance' }).click();
await attendre(400);
await page.screenshot({ path: fichier('09-feuille-pause') });
await page.getByRole('button', { name: 'Mettre en pause' }).click();
await page.waitForSelector('.aujourdhui__date');
await attendre(1100);
await page.screenshot({ path: fichier('10-accueil-seance-en-cours') });
await page.getByRole('button', { name: 'Reprendre la séance' }).click();
await page.waitForSelector('.exercice__nom');
await attendre(300);
await page.screenshot({ path: fichier('11-reprise') });

// Le reste de la séance : chaque série validée, chaque repos écourté.
for (let garde = 0; garde < 80; garde++) {
  const valider = page.getByRole('button', { name: /^Valider la série \d+$/ });
  if (await valider.count()) {
    await valider.click();
    await attendre(120);
    const reprendre = page.locator('.montee:not(.montee--cachee)').getByRole('button', { name: 'Reprendre' });
    try {
      await reprendre.waitFor({ timeout: 1500 });
      await reprendre.click();
    } catch {
      /* dernière série : pas de repos */
    }
    await attendre(250);
    continue;
  }
  const suivant = page.getByRole('button', { name: /^(Exercice suivant|Passer au circuit abdos)$/ });
  if (await suivant.count()) {
    await suivant.click();
    await attendre(350);
    continue;
  }
  break;
}
await page.screenshot({ path: fichier('12-dernier-exercice') });
await page.getByRole('button', { name: 'Terminer la séance' }).first().click();
await page.waitForSelector('.fin__titre');
await attendre(700);
await page.screenshot({ path: fichier('13-fin-chargement') });
await attendre(1800);
await page.screenshot({ path: fichier('14-fin') });
const resume = await page.locator('.fin__resume').textContent();
verifier('fin : résumé', /minutes?, \d+ séries? validées?\./.test(resume ?? ''), resume ?? '');
const premiereValeur = await page.locator('.fin__valeur').first().textContent();
verifier('fin : valeur notée', (premiereValeur ?? '').includes('62,5'), premiereValeur ?? '');

await page.getByRole('button', { name: /^Retour à l.accueil$/ }).click();
await page.waitForSelector('.aujourdhui__date');
await attendre(1100);
await page.screenshot({ path: fichier('15-accueil-apres') });
await page.screenshot({ path: fichier('15-accueil-apres-page'), fullPage: true });

// Mode avion : rechargement sans réseau (service worker en production seulement).
if (!ADRESSE.includes('5190')) {
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForSelector('.aujourdhui__date', { timeout: 15000 });
  verifier('hors ligne', true);
  await ctx.setOffline(false);
}

console.log(verifs.join('\n'));
if (erreurs.length) console.log('Erreurs :', erreurs);
await nav.close();
