// Géométrie du disque, rayon 100. Proportions d'un vrai disque de compétition :
// jante d'environ 11 % du rayon, anneau de lettrage vers 72 %, alésage de
// 50 mm pour 450 mm de diamètre.

export const R = 100;
export const R_JANTE = 89;
export const R_BANDE_EXT = 81;
export const R_BANDE_INT = 63;
export const R_LETTRAGE = 72;
export const R_MOYEU = 22;
export const R_LEVRE = 17;
export const R_ALESAGE = (R * 50) / 450;

/** Cercle complet en chemin, pour composer des anneaux en evenodd. */
export function cercle(r: number): string {
  return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
}

export function anneau(rExt: number, rInt: number): string {
  return `${cercle(rExt)} ${cercle(rInt)}`;
}

/** Point à l'angle a (degrés, 0 = midi, sens horaire). */
export function point(r: number, a: number): [number, number] {
  const rad = (a * Math.PI) / 180;
  return [r * Math.sin(rad), -r * Math.cos(rad)];
}

/** Secteur d'anneau de a0 à a1 (degrés, sens horaire depuis midi). */
export function secteur(rExt: number, rInt: number, a0: number, a1: number): string {
  const grand = a1 - a0 > 180 ? 1 : 0;
  const [x1, y1] = point(rExt, a0);
  const [x2, y2] = point(rExt, a1);
  const [x3, y3] = point(rInt, a1);
  const [x4, y4] = point(rInt, a0);
  return `M ${x1} ${y1} A ${rExt} ${rExt} 0 ${grand} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInt} ${rInt} 0 ${grand} 0 ${x4} ${y4} Z`;
}
