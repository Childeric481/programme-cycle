import type { Exercice, Seance } from './program';

export type Version = 'complete' | 'courte';

/** Tous les exercices d'une séance, dans l'ordre, tous blocs confondus. */
export function exercicesDe(s: Seance): readonly Exercice[] {
  return s.blocs.flatMap((b) => b.exercices);
}

/** Nombre de séries à valider. null : exercice absent de cette version. */
export function compteurDe(ex: Exercice, version: Version): number | null {
  return version === 'complete' ? ex.compteur : ex.compteurCourt;
}

/**
 * Format affiché. En version courte, le nombre de séries est recalculé
 * (« 3 × 6 » au lieu de « 4 × 6 »), sauf format court explicite.
 */
export function formatDe(ex: Exercice, version: Version): string | null {
  if (version === 'complete') return ex.format;
  if (ex.compteurCourt === null) return null;
  if (ex.formatCourt !== undefined) return ex.formatCourt;
  if (ex.compteurCourt === ex.compteur) return ex.format;
  return ex.format.replace(/^\d+ × /, `${ex.compteurCourt} × `);
}

export function toursDe(s: Seance, version: Version): number | null {
  if (!s.circuit) return null;
  return version === 'complete' ? s.circuit.tours : s.circuit.toursCourt;
}

/** Sous-titre du circuit, avec le nombre de tours de la version. */
export function sousTitreCircuit(s: Seance, version: Version): string | null {
  if (!s.circuit) return null;
  const tours = toursDe(s, version);
  return s.circuit.sousTitre.replace(/^\d+ tours/, `${tours} tours`);
}
