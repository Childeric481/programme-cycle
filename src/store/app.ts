// État de l'application, en mémoire et enregistré aussitôt dans IndexedDB.
// Chaque geste met à jour l'état en mémoire (l'écran suit sans attendre),
// puis l'écrit dans la base.

import { useEffect, useRef, useState } from 'preact/hooks';
import { VACANCES_PAR_DEFAUT, type PeriodeVacances, type SeanceId } from '../data/program';
import type { Version } from '../data/derive';
import { reglerSon as reglerSonAudio } from '../audio/sons';
import { isoLocal } from '../logic/dates';
import { fusionner, type EntreeHistorique } from '../logic/historique';
import type { Ajustement, EntreeJournal } from '../logic/planning';
import { demarrer, entreeJournal, type EtatSeance } from '../logic/seance';
import { db, demanderPersistance } from './db';

export interface Reglages {
  readonly son: boolean;
  readonly theme: 'auto' | 'clair' | 'sombre';
  readonly vacances: readonly PeriodeVacances[];
}

export const REGLAGES_DEFAUT: Reglages = { son: true, theme: 'auto', vacances: VACANCES_PAR_DEFAUT };

export interface EtatApp {
  readonly pret: boolean;
  readonly reglages: Reglages;
  readonly seance: EtatSeance | null;
  readonly journal: readonly EntreeJournal[];
  readonly historique: readonly EntreeHistorique[];
  readonly ajustements: readonly Ajustement[];
}

let etat: EtatApp = {
  pret: false,
  reglages: REGLAGES_DEFAUT,
  seance: null,
  journal: [],
  historique: [],
  ajustements: [],
};

const abonnes = new Set<() => void>();

export function lireEtat(): EtatApp {
  return etat;
}

function publier(partiel: Partial<EtatApp>): void {
  etat = { ...etat, ...partiel };
  for (const f of abonnes) f();
}

function enregistrer(promesse: Promise<unknown>): void {
  promesse.catch((e: unknown) => console.warn('Enregistrement impossible', e));
}

/** Abonnement d'un composant à une partie de l'état. */
export function useApp<T>(selecteur: (e: EtatApp) => T): T {
  const [, setTic] = useState(0);
  const sel = useRef(selecteur);
  sel.current = selecteur;
  const derniere = useRef<T>(selecteur(etat));
  useEffect(() => {
    const maj = (): void => {
      const v = sel.current(etat);
      if (!Object.is(v, derniere.current)) {
        derniere.current = v;
        setTic((t) => t + 1);
      }
    };
    abonnes.add(maj);
    maj();
    return () => {
      abonnes.delete(maj);
    };
  }, []);
  const v = selecteur(etat);
  derniere.current = v;
  return v;
}

export async function charger(): Promise<void> {
  try {
    const [reglages, seance, journal, historique, ajustements] = await Promise.all([
      db.lire<Partial<Reglages>>('reglages', 'reglages'),
      db.lire<EtatSeance>('seance', 'en-cours'),
      db.tout<EntreeJournal>('journal'),
      db.tout<EntreeHistorique>('historique'),
      db.tout<Ajustement>('ajustements'),
    ]);
    const r: Reglages = { ...REGLAGES_DEFAUT, ...(reglages ?? {}) };
    reglerSonAudio(r.son);
    publier({
      pret: true,
      reglages: r,
      seance: seance?.schema === 1 ? seance : null,
      journal,
      historique,
      ajustements,
    });
  } catch (e) {
    console.warn('Base locale indisponible, données gardées en mémoire', e);
    publier({ pret: true });
  }
  demanderPersistance();
}

// --- Séance ------------------------------------------------------------------

export function commencerSeance(id: SeanceId, format: Version): void {
  const s = demarrer(id, format, Date.now(), isoLocal());
  publier({ seance: s });
  enregistrer(db.ecrire('seance', s, 'en-cours'));
}

/** Applique un geste à la séance en cours et l'enregistre aussitôt. */
export function majSeance(geste: (s: EtatSeance) => EtatSeance): void {
  const s = etat.seance;
  if (!s) return;
  const n = geste(s);
  if (n === s) return;
  publier({ seance: n });
  enregistrer(db.ecrire('seance', n, 'en-cours'));
}

export function enregistrerHistorique(entrees: readonly EntreeHistorique[]): void {
  if (entrees.length === 0) return;
  publier({ historique: fusionner(etat.historique, entrees) });
  for (const h of entrees) enregistrer(db.ecrire('historique', h));
}

/** Fin de séance : le journal garde la date, la séance, la durée, les séries et la version. */
export function terminerSeance(): EntreeJournal | null {
  const s = etat.seance;
  if (!s) return null;
  const entree = entreeJournal(s, Date.now());
  publier({ seance: null, journal: [...etat.journal.filter((j) => j.id !== entree.id), entree] });
  enregistrer(db.ecrire('journal', entree));
  enregistrer(db.supprimer('seance', 'en-cours'));
  return entree;
}

// --- Réglages ----------------------------------------------------------------

export function reglerSon(son: boolean): void {
  const reglages = { ...etat.reglages, son };
  reglerSonAudio(son);
  publier({ reglages });
  enregistrer(db.ecrire('reglages', reglages, 'reglages'));
}
