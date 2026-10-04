// Génère les icônes PNG de l'application : un disque de la séance 1, vu de face,
// avec sa jante, l'anneau de lettrage en relief, le moyeu en acier et l'alésage.
// Rendu en Node pur (sur-échantillonnage 4 × 4), sans dépendance.
// Usage : node scripts/make-icons.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

// --- Couleurs (jetons clairs, E.7) -----------------------------------------
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const FOND = hex('#f3f5f6');
const FACE = hex('#c8202f');
const ACIER = hex('#c3cad0');
const ACIER_SOMBRE = hex('#858e97');

// color-mix(in oklab, couleur 80 %, noir), comme dans tokens.css.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const delin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function versOklab([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => lin(v / 255));
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}
function depuisOklab([L, A, Bb]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * Bb) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * Bb) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * Bb) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const B = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [R, G, B].map((v) => Math.round(Math.min(1, Math.max(0, delin(v))) * 255));
}
const JANTE = depuisOklab(versOklab(FACE).map((v) => v * 0.8));

// --- Géométrie (rayon 100) --------------------------------------------------
const R_JANTE = 89; // jante : 11 % du rayon
const R_BANDE_EXT = 81; // anneau de lettrage vers 72 %
const R_BANDE_INT = 63;
const R_MOYEU = 22;
const R_LEVRE = 17;
const R_ALESAGE = 100 * (50 / 450); // 50 mm pour 450 mm

const melange = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const BLANC = [255, 255, 255];
const NOIR = [0, 0, 0];

/** Éclairage d'une arête circulaire : > 0 côté lumière (haut gauche), < 0 côté ombre. */
const eclairage = (x, y, r) => (-x - y) / (Math.SQRT2 * r);

/** Couleur du disque au point (x, y), ou null hors du disque et dans l'alésage. */
function disque(x, y, epaisseurTrait) {
  const r = Math.hypot(x, y);
  if (r > 100 || r < R_ALESAGE) return null;
  const e = eclairage(x, y, r || 1);
  const pres = (r0) => Math.abs(r - r0) < epaisseurTrait / 2;
  let c;
  if (r > R_JANTE) {
    // Très léger ombrage radial sur la jante.
    c = melange(JANTE, NOIR, ((r - R_JANTE) / (100 - R_JANTE)) * 0.12);
    if (pres(100 - epaisseurTrait / 2)) c = melange(c, e > 0 ? BLANC : NOIR, Math.abs(e) * (e > 0 ? 0.35 : 0.3));
    if (pres(R_JANTE + epaisseurTrait / 2)) c = melange(c, e > 0 ? NOIR : BLANC, Math.abs(e) * 0.25);
    return c;
  }
  if (r > R_MOYEU) {
    c = FACE;
    if (pres(R_BANDE_EXT)) c = melange(c, e > 0 ? BLANC : NOIR, Math.abs(e) * 0.45);
    if (pres(R_BANDE_INT)) c = melange(c, e > 0 ? NOIR : BLANC, Math.abs(e) * 0.45);
    return c;
  }
  c = ACIER;
  if (r < R_LEVRE) c = melange(ACIER, ACIER_SOMBRE, 0.25);
  if (pres(R_MOYEU - epaisseurTrait / 2)) c = melange(c, e > 0 ? BLANC : NOIR, Math.abs(e) * 0.5);
  if (pres(R_LEVRE)) c = melange(c, e > 0 ? NOIR : BLANC, Math.abs(e) * 0.4);
  if (pres(R_ALESAGE + epaisseurTrait / 2)) c = melange(c, e > 0 ? NOIR : BLANC, Math.abs(e) * 0.5);
  return c;
}

function rendre(taille, rayonFraction, fond) {
  const px = new Uint8ClampedArray(taille * taille * 4);
  const rayon = taille * rayonFraction;
  const echelle = 100 / rayon; // unités disque par pixel
  const trait = Math.max(1.2, 1.4 * echelle);
  const N = 4;
  for (let j = 0; j < taille; j++) {
    for (let i = 0; i < taille; i++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sj = 0; sj < N; sj++) {
        for (let si = 0; si < N; si++) {
          const x = (i + (si + 0.5) / N - taille / 2) * echelle;
          const y = (j + (sj + 0.5) / N - taille / 2) * echelle;
          const c = disque(x, y, trait) ?? fond;
          if (c) {
            r += c[0]; g += c[1]; b += c[2]; a += 255;
          }
        }
      }
      const n = N * N;
      const o = (j * taille + i) * 4;
      if (a === 0) continue;
      px[o] = r / (a / 255);
      px[o + 1] = g / (a / 255);
      px[o + 2] = b / (a / 255);
      px[o + 3] = a / n;
    }
  }
  return px;
}

// --- PNG --------------------------------------------------------------------
const TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function bloc(type, data) {
  const longueur = Buffer.alloc(4);
  longueur.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([longueur, td, crc]);
}
function png(taille, px) {
  const ligne = taille * 4 + 1;
  const brut = Buffer.alloc(ligne * taille);
  for (let y = 0; y < taille; y++) {
    brut[y * ligne] = 0;
    Buffer.from(px.buffer, y * taille * 4, taille * 4).copy(brut, y * ligne + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(taille, 0);
  ihdr.writeUInt32BE(taille, 4);
  ihdr[8] = 8; // profondeur
  ihdr[9] = 6; // RVBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloc('IHDR', ihdr),
    bloc('IDAT', deflateSync(brut, { level: 9 })),
    bloc('IEND', Buffer.alloc(0)),
  ]);
}

// --- Sorties ----------------------------------------------------------------
const dossier = new URL('../public/icons/', import.meta.url);
mkdirSync(dossier, { recursive: true });
const sorties = [
  ['icon-192.png', 192, 0.47, null],
  ['icon-512.png', 512, 0.47, null],
  // Zone sûre des icônes maskable : cercle de rayon 40 % de la largeur.
  ['maskable-192.png', 192, 0.34, FOND],
  ['maskable-512.png', 512, 0.34, FOND],
  ['apple-touch-icon.png', 180, 0.4, FOND],
];
for (const [nom, taille, rayon, fond] of sorties) {
  const fichier = png(taille, rendre(taille, rayon, fond));
  writeFileSync(new URL(nom, dossier), fichier);
  console.log(`${nom} ${taille}×${taille} ${fichier.length} octets`);
}
console.log('jante', JANTE);
