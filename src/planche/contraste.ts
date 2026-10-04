// Contraste WCAG et mélange oklab (pour les tons dérivés), pour la planche.

export type Rvb = [number, number, number];

export function depuisHex(hex: string): Rvb {
  const h = hex.trim().replace('#', '');
  const plein = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16)) as Rvb;
}

export function versHex([r, v, b]: Rvb): string {
  return `#${[r, v, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;
}

const lin = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const delin = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance([r, v, b]: Rvb): number {
  return 0.2126 * lin(r / 255) + 0.7152 * lin(v / 255) + 0.0722 * lin(b / 255);
}

export function contraste(a: Rvb, b: Rvb): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

function versOklab([r, v, b]: Rvb): Rvb {
  const [R, G, B] = [r, v, b].map((c) => lin(c / 255)) as Rvb;
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function depuisOklab([L, A, B]: Rvb): Rvb {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const R = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const G = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const Bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return [R, G, Bl].map((c) => Math.min(1, Math.max(0, delin(c))) * 255) as Rvb;
}

/** color-mix(in oklab, a p, b) */
export function melange(a: Rvb, p: number, b: Rvb): Rvb {
  const x = versOklab(a);
  const y = versOklab(b);
  return depuisOklab([0, 1, 2].map((i) => (x[i] ?? 0) * p + (y[i] ?? 0) * (1 - p)) as Rvb);
}

export function ratioFr(r: number): string {
  return `${r.toFixed(1).replace('.', ',')}:1`;
}
