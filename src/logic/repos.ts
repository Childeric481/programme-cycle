// Minuteur de repos. Le temps se calcule sur l'horloge système à partir d'une
// heure de fin enregistrée : écran éteint, arrière-plan ou appel, rien ne dérive.
// En pause, c'est le temps restant qui est enregistré.

export interface EtatRepos {
  /** Durée de référence de la jauge, en ms (durée initiale plus les ajustements). */
  readonly duree: number;
  /** Heure de fin (ms depuis l'époque) quand le repos tourne. */
  readonly fin: number | null;
  /** Temps restant (ms) quand le repos est en pause. */
  readonly resteEnPause: number | null;
}

export function demarrerRepos(dureeMs: number, maintenant: number): EtatRepos {
  return { duree: dureeMs, fin: maintenant + dureeMs, resteEnPause: null };
}

export function resteDe(e: EtatRepos, maintenant: number): number {
  if (e.fin !== null) return Math.max(0, e.fin - maintenant);
  return Math.max(0, e.resteEnPause ?? 0);
}

export function enPause(e: EtatRepos): boolean {
  return e.fin === null;
}

export function mettreEnPause(e: EtatRepos, maintenant: number): EtatRepos {
  if (e.fin === null) return e;
  return { ...e, fin: null, resteEnPause: resteDe(e, maintenant) };
}

export function relancer(e: EtatRepos, maintenant: number): EtatRepos {
  if (e.fin !== null) return e;
  return { ...e, fin: maintenant + (e.resteEnPause ?? 0), resteEnPause: null };
}

/** +30 s ou −15 s. La jauge garde une durée de référence au moins égale au temps restant. */
export function ajuster(e: EtatRepos, deltaMs: number, maintenant: number): EtatRepos {
  const reste = Math.max(0, resteDe(e, maintenant) + deltaMs);
  const duree = Math.max(reste, e.duree + deltaMs, 1);
  if (e.fin === null) return { duree, fin: null, resteEnPause: reste };
  return { duree, fin: maintenant + reste, resteEnPause: null };
}

/** Fraction de jauge restante, de 1 à 0. */
export function fractionRestante(e: EtatRepos, maintenant: number): number {
  return e.duree <= 0 ? 0 : Math.min(1, resteDe(e, maintenant) / e.duree);
}

/** Secondes affichées : arrondi supérieur, « 0:01 » jusqu'au dernier instant. */
export function secondesAffichees(resteMs: number): number {
  return Math.ceil(resteMs / 1000);
}

/** « 1:30 », « 0:05 ». */
export function formatDuree(secondes: number): string {
  const s = Math.max(0, Math.round(secondes));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** « 2 min 30 », « 1 min », « 45 s ». */
export function dureeEnClair(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  if (m === 0) return `${s} s`;
  if (s === 0) return `${m} min`;
  return `${m} min ${String(s).padStart(2, '0')}`;
}
