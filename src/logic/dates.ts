import type { JourIndex } from '../data/program';

/** Date locale au format AAAA-MM-JJ. Les jours se comparent comme des chaînes. */
export type Iso = string;

const JOUR_MS = 86_400_000;

const deux = (n: number): string => String(n).padStart(2, '0');

export function isoLocal(d: Date = new Date()): Iso {
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())}`;
}

function parties(iso: Iso): [number, number, number] {
  const [a, m, j] = iso.split('-').map(Number);
  if (a === undefined || m === undefined || j === undefined) throw new Error(`Date invalide : ${iso}`);
  return [a, m, j];
}

/** Numéro de jour absolu, insensible aux changements d'heure. */
export function numeroJour(iso: Iso): number {
  const [a, m, j] = parties(iso);
  return Math.round(Date.UTC(a, m - 1, j) / JOUR_MS);
}

export function depuisNumero(n: number): Iso {
  const d = new Date(n * JOUR_MS);
  return `${d.getUTCFullYear()}-${deux(d.getUTCMonth() + 1)}-${deux(d.getUTCDate())}`;
}

export function ajouterJours(iso: Iso, n: number): Iso {
  return depuisNumero(numeroJour(iso) + n);
}

/** Nombre de jours de a à b (positif si b est après a). */
export function ecartJours(a: Iso, b: Iso): number {
  return numeroJour(b) - numeroJour(a);
}

/** 0 = lundi, 6 = dimanche. */
export function jourSemaine(iso: Iso): JourIndex {
  const [a, m, j] = parties(iso);
  return ((new Date(Date.UTC(a, m - 1, j)).getUTCDay() + 6) % 7) as JourIndex;
}

export function lundiDe(iso: Iso): Iso {
  return ajouterJours(iso, -jourSemaine(iso));
}

export const NOMS_JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const;
export const NOMS_MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
] as const;

const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** « Dimanche 4 octobre », « Jeudi 1er octobre ». */
export function dateLongue(iso: Iso, debutDePhrase = true): string {
  const [, m, j] = parties(iso);
  const texte = `${NOMS_JOURS[jourSemaine(iso)]} ${j === 1 ? '1er' : j} ${NOMS_MOIS[m - 1]}`;
  return debutDePhrase ? majuscule(texte) : texte;
}

/** « 7 octobre », « 1er octobre ». */
export function jourEtMois(iso: Iso): string {
  const [, m, j] = parties(iso);
  return `${j === 1 ? '1er' : j} ${NOMS_MOIS[m - 1]}`;
}
