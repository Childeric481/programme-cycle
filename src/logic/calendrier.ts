import {
  CALENDRIER,
  LUNDI_SEMAINE_CHARGEE,
  RYTHME,
  type CaseRythme,
  type PeriodeVacances,
  type SeanceId,
  type TypeSemaine,
} from '../data/program';
import { ecartJours, jourSemaine, lundiDe, type Iso } from './dates';

/** Les semaines alternent strictement à partir du lundi 7 septembre 2026, semaine chargée. */
export function typeSemaine(iso: Iso): TypeSemaine {
  const semaines = Math.floor(ecartJours(LUNDI_SEMAINE_CHARGEE, lundiDe(iso)) / 7);
  return ((semaines % 2) + 2) % 2 === 0 ? 'chargee' : 'tranquille';
}

export function enVacances(iso: Iso, periodes: readonly PeriodeVacances[]): boolean {
  return periodes.some((p) => p.debut <= iso && iso <= p.fin);
}

/** Séance du tableau de C.1 pour ce jour, sans décalage ni vacances. */
export function seanceDuCalendrier(iso: Iso): SeanceId | null {
  const c = CALENDRIER[typeSemaine(iso)][jourSemaine(iso)];
  return typeof c === 'number' ? c : null;
}

/** Travail ou libre, d'après le rythme de la section A. */
export function rythmeDu(iso: Iso): CaseRythme {
  return RYTHME[typeSemaine(iso)][jourSemaine(iso)] ?? 'Libre';
}

export function libelleSemaine(iso: Iso, periodes: readonly PeriodeVacances[]): string {
  if (enVacances(iso, periodes)) return 'Vacances';
  return typeSemaine(iso) === 'chargee' ? 'Semaine chargée' : 'Semaine tranquille';
}
