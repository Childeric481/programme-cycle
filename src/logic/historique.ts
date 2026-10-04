// Historique par mouvement (D.10). Clé : numéro de séance et nom du mouvement.
// Une entrée par mouvement et par date, la dernière saisie l'emporte, avec la
// réponse de réserve quand elle existe.

import { seance as seanceDe, type Saisie, type SeanceId } from '../data/program';
import type { Iso } from './dates';
import { nombreFr } from './nombres';
import { cleSaisie, etapesSeance, type EtatSeance, type Valeur, type Valeurs } from './seance';

export interface EntreeHistorique {
  readonly seance: SeanceId;
  readonly mouvement: string;
  readonly date: Iso;
  readonly valeurs: Valeurs;
  readonly reserve?: 0 | 1 | 2 | 3;
}

/** Dernière entrée strictement avant la date donnée. */
export function derniereAvant(
  historique: readonly EntreeHistorique[],
  seance: SeanceId,
  mouvement: string,
  date: Iso,
): EntreeHistorique | null {
  let meilleure: EntreeHistorique | null = null;
  for (const h of historique) {
    if (h.seance !== seance || h.mouvement !== mouvement || h.date >= date) continue;
    if (!meilleure || h.date > meilleure.date) meilleure = h;
  }
  return meilleure;
}

export function uniteDe(s: Saisie): string {
  if (s.kind === 'charge') return 'kg';
  if (s.kind === 'reps') return 'rép.';
  if (s.kind === 'mesure') return s.unite;
  return '';
}

export function pasDe(s: Saisie): number {
  return s.kind === 'etape' ? 1 : s.pas;
}

/** « 60 kg », « 7 rép. », « Négatives ». */
export function valeurEnClair(s: Saisie, v: Valeur): string {
  if (typeof v === 'string') return v;
  return `${nombreFr(v, pasDe(s))} ${uniteDe(s)}`;
}

/** Valeur affichée dans un champ : la saisie du jour, sinon la dernière valeur. */
export function valeurChamp(
  e: EtatSeance,
  historique: readonly EntreeHistorique[],
  cle: string,
  mouvement: string,
  champ: string,
): Valeur | null {
  const du = e.saisies[cle]?.[champ];
  if (du !== undefined) return du;
  return derniereAvant(historique, e.seance, mouvement, e.date)?.valeurs[champ] ?? null;
}

/**
 * Valeurs à enregistrer pour l'exercice courant, une entrée par mouvement qui a
 * une saisie : la saisie du jour, ou la valeur préremplie laissée telle quelle.
 */
export function entreesExercice(e: EtatSeance, historique: readonly EntreeHistorique[]): EntreeHistorique[] {
  const et = etapesSeance(e)[e.etape];
  if (!et || et.type !== 'exercice') return [];
  const out: EntreeHistorique[] = [];
  et.exercice.mouvements.forEach((m, i) => {
    if (m.saisies.length === 0) return;
    const cle = cleSaisie(et.exercice.id, i);
    const valeurs: Record<string, Valeur> = {};
    for (const s of m.saisies) {
      const v = valeurChamp(e, historique, cle, m.nom, s.id);
      if (v !== null) valeurs[s.id] = v;
    }
    if (Object.keys(valeurs).length === 0) return;
    const existante = historique.find((h) => h.seance === e.seance && h.mouvement === m.nom && h.date === e.date);
    out.push({ seance: e.seance, mouvement: m.nom, date: e.date, valeurs, ...(existante?.reserve !== undefined ? { reserve: existante.reserve } : {}) });
  });
  return out;
}

/** Remplace ou ajoute des entrées (même séance, même mouvement, même date : la dernière l'emporte). */
export function fusionner(historique: readonly EntreeHistorique[], entrees: readonly EntreeHistorique[]): EntreeHistorique[] {
  const cle = (h: EntreeHistorique): string => `${h.seance}|${h.mouvement}|${h.date}`;
  const nouvelles = new Map(entrees.map((h) => [cle(h), h]));
  return [...historique.filter((h) => !nouvelles.has(cle(h))), ...nouvelles.values()];
}

export interface LigneRecap {
  readonly mouvement: string;
  readonly valeurs: readonly { label: string; texte: string; ecart: string | null }[];
}

/** Valeurs notées pendant la séance, avec l'écart par rapport à la fois précédente. */
export function recapitulatif(
  historique: readonly EntreeHistorique[],
  seance: SeanceId,
  date: Iso,
): LigneRecap[] {
  const s = seanceDe(seance);
  const lignes: LigneRecap[] = [];
  for (const b of s.blocs) {
    for (const ex of b.exercices) {
      for (const m of ex.mouvements) {
        const h = historique.find((x) => x.seance === seance && x.mouvement === m.nom && x.date === date);
        if (!h) continue;
        const avant = derniereAvant(historique, seance, m.nom, date);
        const valeurs = m.saisies.flatMap((sa) => {
          const v = h.valeurs[sa.id];
          if (v === undefined) return [];
          const p = avant?.valeurs[sa.id];
          let ecart: string | null = null;
          if (typeof v === 'number' && typeof p === 'number' && v !== p) {
            const d = v - p;
            ecart = `${d > 0 ? '+' : '−'}${nombreFr(Math.abs(d), pasDe(sa))} ${uniteDe(sa)}`;
          }
          return [{ label: sa.label, texte: valeurEnClair(sa, v), ecart }];
        });
        if (valeurs.length) lignes.push({ mouvement: m.nom, valeurs });
      }
    }
  }
  return lignes;
}
