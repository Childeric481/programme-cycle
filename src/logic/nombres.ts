const decimales = (pas: number): number => (String(pas).split('.')[1] ?? '').length;

/** Arrondi au pas de saisie, sans résidu flottant. */
export function arrondirAuPas(v: number, pas: number): number {
  return Number(v.toFixed(decimales(pas)));
}

/** Nombre à la française : « 60 », « 62,5 ». Les zéros inutiles tombent. */
export function nombreFr(v: number, pas: number): string {
  return String(arrondirAuPas(v, pas)).replace('.', ',');
}
