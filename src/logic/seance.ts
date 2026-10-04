// Séance guidée (D.4) : étapes, séries, repos, circuit, pause, fin.
// Fonctions pures : chaque geste produit un nouvel état, enregistré aussitôt.

import { seance as seanceDe, type Bloc, type Circuit, type Exercice, type SeanceId } from '../data/program';
import { compteurDe, toursDe, type Version } from '../data/derive';
import type { Iso } from './dates';
import type { EntreeJournal } from './planning';
import {
  demarrerRepos,
  enPause as reposEnPause,
  mettreEnPause as pauseRepos,
  relancer as relancerRepos,
  type EtatRepos,
} from './repos';

export type Etape =
  | { readonly type: 'echauffement' }
  | {
      readonly type: 'exercice';
      readonly exercice: Exercice;
      readonly bloc: Bloc;
      readonly rang: number;
      readonly total: number;
      readonly plusieursBlocs: boolean;
    }
  | { readonly type: 'circuit'; readonly circuit: Circuit };

/** Une étape pour l'échauffement, une par exercice présent dans la version, une pour le circuit. */
export function etapesDe(id: SeanceId, version: Version): Etape[] {
  const s = seanceDe(id);
  const presents = s.blocs.flatMap((b) =>
    b.exercices.filter((e) => compteurDe(e, version) !== null).map((e) => ({ e, b })),
  );
  const plusieursBlocs = new Set(presents.map((p) => p.b.titre)).size > 1;
  const etapes: Etape[] = [{ type: 'echauffement' }];
  presents.forEach(({ e, b }, i) =>
    etapes.push({ type: 'exercice', exercice: e, bloc: b, rang: i + 1, total: presents.length, plusieursBlocs }),
  );
  if (s.circuit) etapes.push({ type: 'circuit', circuit: s.circuit });
  return etapes;
}

const minusculeInitiale = (t: string): string => t.charAt(0).toLowerCase() + t.slice(1);

/** « Exercice 3 sur 7 », ou « Épaules, exercice 7 sur 7 » quand la séance a plusieurs blocs. */
export function reperage(e: Etape, titreEchauffement: string): string {
  if (e.type === 'echauffement') return titreEchauffement;
  if (e.type === 'circuit') return e.circuit.titre;
  return e.plusieursBlocs ? `${e.bloc.titre}, exercice ${e.rang} sur ${e.total}` : `Exercice ${e.rang} sur ${e.total}`;
}

/** Position affichée sur l'accueil : « Échauffement », « Exercice 3 sur 7 », « Circuit abdos ». */
export function position(e: Etape, titreEchauffement: string): string {
  if (e.type === 'exercice') return `Exercice ${e.rang} sur ${e.total}`;
  return reperage(e, titreEchauffement);
}

function nomEtape(e: Etape, titreEchauffement: string): string {
  if (e.type === 'exercice') return minusculeInitiale(e.exercice.nom);
  if (e.type === 'circuit') return minusculeInitiale(e.circuit.titre);
  return minusculeInitiale(titreEchauffement);
}

export type Valeur = number | string;
export type Valeurs = Readonly<Record<string, Valeur>>;

export interface EtatSeance {
  readonly schema: 1;
  readonly seance: SeanceId;
  readonly format: Version;
  readonly date: Iso;
  readonly debut: number;
  readonly cumulPause: number;
  /** Séance mise en pause (feuille de fermeture) : heure de la pause. */
  readonly pauseDepuis: number | null;
  readonly etape: number;
  readonly coches: readonly string[];
  readonly series: Readonly<Record<string, number>>;
  readonly tours: number;
  readonly cochesCircuit: readonly number[];
  /** Saisies de la séance, par « idExercice|indexMouvement » ou « idÉlément ». */
  readonly saisies: Readonly<Record<string, Valeurs>>;
  readonly repos: EtatRepos | null;
  /** Repos suspendu par la mise en pause de la séance. */
  readonly reposSuspendu: boolean;
  readonly apresRepos: 'rester' | 'avancer';
  readonly ensuite: string;
  /** Incrémenté à chaque nouveau repos. */
  readonly reposCycle: number;
}

export function cleSaisie(exerciceId: string, indexMouvement: number): string {
  return `${exerciceId}|${indexMouvement}`;
}

export function demarrer(id: SeanceId, format: Version, maintenant: number, date: Iso): EtatSeance {
  return {
    schema: 1,
    seance: id,
    format,
    date,
    debut: maintenant,
    cumulPause: 0,
    pauseDepuis: null,
    etape: 0,
    coches: [],
    series: {},
    tours: 0,
    cochesCircuit: [],
    saisies: {},
    repos: null,
    reposSuspendu: false,
    apresRepos: 'rester',
    ensuite: '',
    reposCycle: 0,
  };
}

export function etapesSeance(e: EtatSeance): Etape[] {
  return etapesDe(e.seance, e.format);
}

export function etapeCourante(e: EtatSeance): Etape {
  const etapes = etapesSeance(e);
  return etapes[Math.min(e.etape, etapes.length - 1)] ?? { type: 'echauffement' };
}

export function titreEchauffement(e: EtatSeance): string {
  return seanceDe(e.seance).echauffement.titre;
}

export function cocher(e: EtatSeance, id: string): EtatSeance {
  const coches = e.coches.includes(id) ? e.coches.filter((c) => c !== id) : [...e.coches, id];
  return { ...e, coches };
}

export function saisir(e: EtatSeance, cle: string, champ: string, valeur: Valeur): EtatSeance {
  return { ...e, saisies: { ...e.saisies, [cle]: { ...(e.saisies[cle] ?? {}), [champ]: valeur } } };
}

export function allerA(e: EtatSeance, index: number): EtatSeance {
  const n = etapesSeance(e).length;
  return { ...e, etape: Math.max(0, Math.min(n - 1, index)), repos: null, reposSuspendu: false };
}

/** Série validée : le compteur avance, le repos de l'exercice se lance (sauf après le dernier exercice). */
export function validerSerie(e: EtatSeance, maintenant: number): EtatSeance {
  const etapes = etapesSeance(e);
  const et = etapes[e.etape];
  if (!et || et.type !== 'exercice') return e;
  const ex = et.exercice;
  const total = compteurDe(ex, e.format) ?? 0;
  const faites = e.series[ex.id] ?? 0;
  if (faites >= total) return e;
  const series = { ...e.series, [ex.id]: faites + 1 };
  const repos = demarrerRepos(ex.repos * 1000, maintenant);
  if (faites + 1 < total) {
    return {
      ...e,
      series,
      repos,
      reposSuspendu: false,
      apresRepos: 'rester',
      ensuite: `Ensuite, série ${faites + 2} sur ${total}.`,
      reposCycle: e.reposCycle + 1,
    };
  }
  const reste = etapes.slice(e.etape + 1);
  const suivante = reste[0];
  // Aucun repos après la dernière série du dernier exercice.
  if (!suivante || !reste.some((x) => x.type === 'exercice')) return { ...e, series };
  return {
    ...e,
    series,
    repos,
    reposSuspendu: false,
    apresRepos: 'avancer',
    ensuite: `Ensuite, ${nomEtape(suivante, titreEchauffement(e))}.`,
    reposCycle: e.reposCycle + 1,
  };
}

export function annulerSerie(e: EtatSeance): EtatSeance {
  const et = etapeCourante(e);
  if (et.type !== 'exercice') return e;
  const faites = e.series[et.exercice.id] ?? 0;
  if (faites === 0) return e;
  return { ...e, series: { ...e.series, [et.exercice.id]: faites - 1 } };
}

/** Fin du repos : l'écran se ferme ; après la dernière série, l'étape suivante s'affiche d'elle-même. */
export function finirRepos(e: EtatSeance): EtatSeance {
  if (!e.repos) return e;
  const etape = e.apresRepos === 'avancer' ? Math.min(e.etape + 1, etapesSeance(e).length - 1) : e.etape;
  return { ...e, repos: null, reposSuspendu: false, apresRepos: 'rester', etape };
}

export function majRepos(e: EtatSeance, repos: EtatRepos): EtatSeance {
  return { ...e, repos };
}

export function cocherCircuit(e: EtatSeance, index: number): EtatSeance {
  const cochesCircuit = e.cochesCircuit.includes(index)
    ? e.cochesCircuit.filter((c) => c !== index)
    : [...e.cochesCircuit, index];
  return { ...e, cochesCircuit };
}

/** Tour de circuit validé d'un geste : cases décochées, repos entre les tours. */
export function validerTour(e: EtatSeance, maintenant: number): EtatSeance {
  const s = seanceDe(e.seance);
  const total = toursDe(s, e.format);
  if (!s.circuit || total === null || e.tours >= total) return e;
  const tours = e.tours + 1;
  if (tours >= total) return { ...e, tours, cochesCircuit: [] };
  return {
    ...e,
    tours,
    cochesCircuit: [],
    repos: demarrerRepos(s.circuit.repos * 1000, maintenant),
    reposSuspendu: false,
    apresRepos: 'rester',
    ensuite: `Ensuite, tour ${tours + 1} sur ${total}.`,
    reposCycle: e.reposCycle + 1,
  };
}

export function annulerTour(e: EtatSeance): EtatSeance {
  if (e.tours === 0) return e;
  return { ...e, tours: e.tours - 1, cochesCircuit: [] };
}

/** Mise en pause depuis la feuille : la durée s'arrête, le repos aussi. */
export function mettreEnPause(e: EtatSeance, maintenant: number): EtatSeance {
  if (e.pauseDepuis !== null) return e;
  const enCours = e.repos !== null && !reposEnPause(e.repos);
  return {
    ...e,
    pauseDepuis: maintenant,
    repos: enCours && e.repos ? pauseRepos(e.repos, maintenant) : e.repos,
    reposSuspendu: enCours,
  };
}

export function reprendre(e: EtatSeance, maintenant: number): EtatSeance {
  if (e.pauseDepuis === null) return e;
  return {
    ...e,
    pauseDepuis: null,
    cumulPause: e.cumulPause + Math.max(0, maintenant - e.pauseDepuis),
    repos: e.reposSuspendu && e.repos ? relancerRepos(e.repos, maintenant) : e.repos,
    reposSuspendu: false,
  };
}

/** Temps écoulé, pauses exclues. */
export function dureeMs(e: EtatSeance, maintenant: number): number {
  return Math.max(0, (e.pauseDepuis ?? maintenant) - e.debut - e.cumulPause);
}

export function totalSeries(e: EtatSeance): number {
  const etapes = etapesSeance(e);
  let n = 0;
  for (const et of etapes) {
    if (et.type === 'exercice') n += compteurDe(et.exercice, e.format) ?? 0;
    if (et.type === 'circuit') n += toursDe(seanceDe(e.seance), e.format) ?? 0;
  }
  return n;
}

/** Séries validées, tours de circuit compris. */
export function seriesValidees(e: EtatSeance): number {
  return Object.values(e.series).reduce((a, b) => a + b, 0) + e.tours;
}

/** Remplissage de chaque segment de la barre du haut. */
export function segments(e: EtatSeance): { rempli: number; courant: boolean }[] {
  const s = seanceDe(e.seance);
  return etapesSeance(e).map((et, i) => {
    let rempli = 0;
    if (et.type === 'echauffement') {
      const n = s.echauffement.elements.length;
      rempli = i < e.etape ? 1 : n ? e.coches.length / n : 0;
    } else if (et.type === 'exercice') {
      rempli = (e.series[et.exercice.id] ?? 0) / (compteurDe(et.exercice, e.format) ?? 1);
    } else {
      rempli = e.tours / (toursDe(s, e.format) ?? 1);
    }
    return { rempli: Math.min(1, rempli), courant: i === e.etape };
  });
}

/** Entrée du journal : date, séance, durée, séries, version. */
export function entreeJournal(e: EtatSeance, maintenant: number): EntreeJournal {
  return {
    id: String(e.debut),
    date: e.date,
    seance: e.seance,
    debut: e.debut,
    fin: maintenant,
    duree: Math.max(1, Math.round(dureeMs(e, maintenant) / 60_000)),
    series: seriesValidees(e),
    version: e.format,
  };
}

/** Libellé du bouton principal une fois toutes les séries faites. */
export function libelleSuivant(e: EtatSeance): 'Exercice suivant' | 'Passer au circuit abdos' | 'Terminer la séance' {
  const suivante = etapesSeance(e)[e.etape + 1];
  if (!suivante) return 'Terminer la séance';
  if (suivante.type === 'circuit') return 'Passer au circuit abdos';
  return 'Exercice suivant';
}
