// Textes composés de l'interface : tutoiement, phrases courtes, éléments
// séparés par des virgules, pluriels gérés.

import type { Seance } from '../data/program';
import { compteurDe, exercicesDe, type Version } from '../data/derive';
import { NOMS_JOURS } from './dates';

export const minusculeInitiale = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);
export const majusculeInitiale = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

/** En français, 0 et 1 sont au singulier. */
export function accorder(n: number, singulier: string, pluriel: string): string {
  return `${n} ${n >= 2 ? pluriel : singulier}`;
}

/** « 25 séries validées », « 1 série validée ». */
export function seriesValidees(n: number): string {
  return accorder(n, 'série validée', 'séries validées');
}

export function nombreExercices(s: Seance, v: Version): number {
  return exercicesDe(s).filter((e) => compteurDe(e, v) !== null).length;
}

/** « Salle, 65 min, 7 exercices » */
export function lieuDureeExercices(s: Seance, v: Version = 'complete'): string {
  const duree = v === 'complete' ? s.duree : s.dureeCourte;
  return `${s.lieu}, ${duree} min, ${accorder(nombreExercices(s, v), 'exercice', 'exercices')}`;
}

/** « Mercredi en semaine chargée, 65 min » */
export function quandSeance(s: Seance): string {
  const semaine = s.semaine === 'chargee' ? 'chargée' : 'tranquille';
  return `${majusculeInitiale(NOMS_JOURS[s.jour])} en semaine ${semaine}, ${s.duree} min`;
}
