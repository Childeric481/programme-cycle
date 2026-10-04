// Mesure de fluidité (E.5, E.9) : processeur ralenti ×4, intervalles entre images
// pendant le repos (jauge, lettrage qui tourne) et pendant le chargement de la barre.
// Usage : node scripts/mesure-fluidite.mjs [adresse]
import { chromium } from '@playwright/test';

const ADRESSE = process.argv[2] ?? 'http://localhost:4190/programme-cycle/#/planche';
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(ADRESSE);
await page.waitForSelector('.planche__telephone');
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

async function mesurer(duree) {
  return page.evaluate(
    (d) =>
      new Promise((ok) => {
        const t = [];
        const pas = (x) => {
          t.push(x);
          if (x - t[0] < d) requestAnimationFrame(pas);
          else {
            const ecarts = t.slice(1).map((v, i) => v - t[i]);
            ecarts.sort((a, b) => a - b);
            const p = (q) => ecarts[Math.floor(q * (ecarts.length - 1))];
            ok({ images: ecarts.length, median: p(0.5).toFixed(1), p95: p(0.95).toFixed(1), max: ecarts.at(-1).toFixed(1), au_dela_25ms: ecarts.filter((e) => e > 25).length });
          }
        };
        requestAnimationFrame(pas);
      }),
    duree,
  );
}

const repos = page.locator('.planche__telephone').nth(1);
await repos.scrollIntoViewIfNeeded();
await repos.locator('xpath=..').getByRole('button', { name: '90 s', exact: true }).click();
console.log('repos, 3 s :', await mesurer(3000));

const exo = page.locator('.planche__telephone').first();
await exo.scrollIntoViewIfNeeded();
// Son déverrouillé au préalable, comme au bouton « Commencer la séance ».
await exo.dispatchEvent('pointerdown');
await page.waitForTimeout(600);
const mesure = mesurer(1200);
await exo.getByRole('button', { name: 'Valider la série 1' }).click();
console.log('série validée puis montée du repos, 1,2 s :', await mesure);
await nav.close();
