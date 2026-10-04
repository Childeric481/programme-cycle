// Planning : séance du jour, semaine, prochaine séance (D.2).
// Un jour de vacances n'a pas de séance. Sinon la séance du jour est celle du
// tableau de C.1, puis les décalages et les sauts enregistrés s'appliquent.

import type { JourIndex, PeriodeVacances, SeanceId } from '../data/program';
import { enVacances, seanceDuCalendrier } from './calendrier';
import { ajouterJours, jourSemaine, lundiDe, type Iso } from './dates';

export interface Ajustement {
  /** Jour où la séance était prévue. */
  readonly dateOrigine: Iso;
  readonly seance: SeanceId;
  readonly type: 'decalage' | 'saut';
  /** Jour d'arrivée d'une séance décalée. */
  readonly dateCible?: Iso;
  readonly creeLe: number;
}

export interface EntreeJournal {
  /** Heure de début (ms), unique. */
  readonly id: string;
  readonly date: Iso;
  readonly seance: SeanceId;
  readonly debut: number;
  readonly fin: number;
  /** Durée en minutes, pauses exclues. */
  readonly duree: number;
  readonly series: number;
  readonly version: 'complete' | 'courte';
  /** Exercices avec au moins une série validée (circuit compris) : un disque chacun en fin de séance. */
  readonly exercicesFaits?: number;
}

export interface SeanceDuJour {
  readonly id: SeanceId;
  readonly decalee: boolean;
  readonly origine: Iso;
}

export function seancesDuJour(
  iso: Iso,
  vacances: readonly PeriodeVacances[],
  ajustements: readonly Ajustement[],
): SeanceDuJour[] {
  if (enVacances(iso, vacances)) return [];
  const liste: SeanceDuJour[] = [];
  const base = seanceDuCalendrier(iso);
  if (base !== null && !ajustements.some((a) => a.dateOrigine === iso)) {
    liste.push({ id: base, decalee: false, origine: iso });
  }
  for (const a of ajustements) {
    if (a.type === 'decalage' && a.dateCible === iso) liste.push({ id: a.seance, decalee: true, origine: a.dateOrigine });
  }
  return liste;
}

/** Premier jour suivant, dans les 28 jours, qui porte une séance. */
export function prochaineSeance(
  iso: Iso,
  vacances: readonly PeriodeVacances[],
  ajustements: readonly Ajustement[],
): { date: Iso; id: SeanceId } | null {
  for (let i = 1; i <= 28; i++) {
    const jour = ajouterJours(iso, i);
    const s = seancesDuJour(jour, vacances, ajustements)[0];
    if (s) return { date: jour, id: s.id };
  }
  return null;
}

export type EtatMarqueur = 'fait' | 'prevu' | 'decale' | 'saute';

export interface JourSemaine {
  readonly date: Iso;
  readonly index: JourIndex;
  readonly aujourdhui: boolean;
  readonly vacances: boolean;
  readonly marqueurs: readonly { id: SeanceId; etat: EtatMarqueur }[];
}

/** La semaine du lundi au dimanche, avec un marqueur par séance. */
export function semaine(
  iso: Iso,
  vacances: readonly PeriodeVacances[],
  ajustements: readonly Ajustement[],
  journal: readonly EntreeJournal[],
): JourSemaine[] {
  const lundi = lundiDe(iso);
  return Array.from({ length: 7 }, (_, i) => {
    const date = ajouterJours(lundi, i);
    const faites = journal.filter((j) => j.date === date);
    const marqueurs: { id: SeanceId; etat: EtatMarqueur }[] = faites.map((j) => ({ id: j.seance, etat: 'fait' }));
    for (const s of seancesDuJour(date, vacances, ajustements)) {
      if (faites.some((j) => j.seance === s.id)) continue;
      marqueurs.push({ id: s.id, etat: s.decalee ? 'decale' : 'prevu' });
    }
    for (const a of ajustements) {
      if (a.type === 'saut' && a.dateOrigine === date) marqueurs.push({ id: a.seance, etat: 'saute' });
    }
    return { date, index: jourSemaine(date), aujourdhui: date === iso, vacances: enVacances(date, vacances), marqueurs };
  });
}

export function dernieresSeances(journal: readonly EntreeJournal[], n = 6): EntreeJournal[] {
  return [...journal].sort((a, b) => b.debut - a.debut).slice(0, n);
}
