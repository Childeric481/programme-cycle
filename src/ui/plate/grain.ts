// Grain du caoutchouc et de la fonte : généré une seule fois, en petite texture
// répétée. Points clairs et sombres mêlés, l'opacité se règle à l'usage (4 à 6 %).

export const TUILE = 96;

let caoutchouc: string | null = null;
let fonte: string | null = null;

function generer(taillePoint: number, densite: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = TUILE;
  canvas.height = TUILE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const image = ctx.createImageData(TUILE, TUILE);
  // Générateur déterministe : la même texture à chaque lancement.
  let graine = 0x2f6b9d;
  const hasard = (): number => {
    graine ^= graine << 13;
    graine ^= graine >>> 17;
    graine ^= graine << 5;
    return ((graine >>> 0) % 10_000) / 10_000;
  };
  for (let y = 0; y < TUILE; y += taillePoint) {
    for (let x = 0; x < TUILE; x += taillePoint) {
      if (hasard() > densite) continue;
      const clair = hasard() > 0.5;
      const alpha = 90 + hasard() * 165;
      for (let dy = 0; dy < taillePoint; dy++) {
        for (let dx = 0; dx < taillePoint; dx++) {
          const i = ((y + dy) * TUILE + (x + dx)) * 4;
          const v = clair ? 255 : 0;
          image.data[i] = v;
          image.data[i + 1] = v;
          image.data[i + 2] = v;
          image.data[i + 3] = alpha;
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export function grainCaoutchouc(): string {
  caoutchouc ??= generer(1, 0.55);
  return caoutchouc;
}

/** Fonte grenaillée : grain plus gros et plus visible. */
export function grainFonte(): string {
  fonte ??= generer(2, 0.6);
  return fonte;
}
