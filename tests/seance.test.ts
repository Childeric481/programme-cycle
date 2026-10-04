import { describe, expect, it } from 'vitest';
import { VACANCES_PAR_DEFAUT } from '../src/data/program';
import {
  annulerSerie,
  annulerTour,
  cocher,
  demarrer,
  dureeMs,
  entreeJournal,
  etapeCourante,
  etapesDe,
  finirRepos,
  libelleSuivant,
  mettreEnPause,
  reperage,
  reprendre,
  saisir,
  segments,
  seriesValidees,
  totalSeries,
  validerSerie,
  validerTour,
  type EtatSeance,
} from '../src/logic/seance';
import { resteDe } from '../src/logic/repos';
import { dernieresSeances, prochaineSeance, seancesDuJour, semaine, type Ajustement, type EntreeJournal } from '../src/logic/planning';
import { derniereAvant, entreesExercice, fusionner, recapitulatif, type EntreeHistorique } from '../src/logic/historique';

const T0 = 1_791_000_000_000;
const MIN = 60_000;

/** Valide toutes les séries de l'étape courante en sautant les repos. */
function finirExercice(e: EtatSeance, t: number): EtatSeance {
  let s = e;
  const et = etapeCourante(s);
  if (et.type !== 'exercice') return s;
  const avant = s.etape;
  for (let i = 0; i < 12 && s.etape === avant; i++) {
    const n = s.series[et.exercice.id] ?? 0;
    s = validerSerie(s, t);
    if ((s.series[et.exercice.id] ?? 0) === n) break;
    if (s.repos) s = finirRepos(s);
  }
  return s;
}

describe('étapes', () => {
  it('séance 1 : échauffement puis 7 exercices', () => {
    const e = etapesDe(1, 'complete');
    expect(e.map((x) => x.type)).toEqual(['echauffement', ...Array(7).fill('exercice')]);
    const ex3 = e[3];
    expect(ex3 && reperage(ex3, 'Échauffement')).toBe('Exercice 3 sur 7');
  });

  it('séance 4 : deux blocs et le circuit', () => {
    const e = etapesDe(4, 'complete');
    expect(e.at(-1)?.type).toBe('circuit');
    const ex7 = e[7];
    expect(ex7 && reperage(ex7, 'Échauffement')).toBe('Épaules, exercice 7 sur 7');
    const ex1 = e[1];
    expect(ex1 && reperage(ex1, 'Échauffement')).toBe('Fessier et jambes, exercice 1 sur 7');
  });

  it('version courte : exercices supprimés absents', () => {
    expect(etapesDe(1, 'courte').filter((x) => x.type === 'exercice').length).toBe(6);
    expect(etapesDe(3, 'courte').filter((x) => x.type === 'exercice').length).toBe(2);
  });
});

describe('séance guidée', () => {
  it('validation : compteur, repos, « Ensuite »', () => {
    let e = demarrer(1, 'complete', T0, '2026-10-07');
    e = { ...e, etape: 1 };
    e = validerSerie(e, T0 + MIN);
    expect(e.series['s1-squat']).toBe(1);
    expect(e.repos && resteDe(e.repos, T0 + MIN)).toBe(150_000);
    expect(e.ensuite).toBe('Ensuite, série 2 sur 4.');
    e = finirRepos(e);
    expect(e.etape).toBe(1);
    for (let i = 0; i < 2; i++) e = finirRepos(validerSerie(e, T0));
    e = annulerSerie(e);
    expect(e.series['s1-squat']).toBe(2);
    e = finirRepos(validerSerie(e, T0));
    // Après la dernière série, la ligne annonce l'exercice suivant et l'étape avance à la fin du repos.
    e = validerSerie(e, T0);
    expect(e.ensuite).toBe('Ensuite, hip thrust barre.');
    e = finirRepos(e);
    expect(e.etape).toBe(2);
  });

  it('aucun repos après la dernière série du dernier exercice', () => {
    let e = { ...demarrer(1, 'complete', T0, '2026-10-07'), etape: 7 };
    e = finirExercice(e, T0);
    expect(e.series['s1-tirage']).toBe(4);
    expect(e.repos).toBeNull();
    expect(libelleSuivant(e)).toBe('Terminer la séance');
  });

  it('séance 4 : dernier exercice puis circuit, trois tours, repos entre les tours', () => {
    let e = { ...demarrer(4, 'complete', T0, '2026-10-16'), etape: 7 };
    e = finirExercice(e, T0);
    expect(e.repos).toBeNull();
    expect(libelleSuivant(e)).toBe('Passer au circuit abdos');
    e = { ...e, etape: 8 };
    e = validerTour(e, T0);
    expect(e.tours).toBe(1);
    expect(e.ensuite).toBe('Ensuite, tour 2 sur 3.');
    expect(e.repos && resteDe(e.repos, T0)).toBe(60_000);
    e = finirRepos(validerTour(finirRepos(e), T0));
    e = validerTour(e, T0);
    expect(e.tours).toBe(3);
    expect(e.repos).toBeNull();
    expect(annulerTour(e).tours).toBe(2);
  });

  it('pause : la durée et le repos s\'arrêtent, puis reprennent', () => {
    let e = { ...demarrer(1, 'complete', T0, '2026-10-07'), etape: 1 };
    e = validerSerie(e, T0 + 10 * MIN);
    e = mettreEnPause(e, T0 + 10 * MIN + 30_000);
    expect(e.repos && resteDe(e.repos, T0 + 99 * MIN)).toBe(120_000);
    e = reprendre(e, T0 + 70 * MIN);
    expect(dureeMs(e, T0 + 70 * MIN)).toBe(10 * MIN + 30_000);
    expect(e.repos && resteDe(e.repos, T0 + 70 * MIN + 20_000)).toBe(100_000);
  });

  it('segments, séries, journal', () => {
    let e = demarrer(1, 'complete', T0, '2026-10-07');
    e = cocher(e, 's1-e1');
    expect(segments(e)[0]?.rempli).toBeCloseTo(1 / 5);
    e = { ...e, etape: 1 };
    e = validerSerie(e, T0);
    expect(seriesValidees(e)).toBe(1);
    expect(totalSeries(e)).toBe(4 + 4 + 3 + 3 + 3 + 3 + 4);
    const j = entreeJournal(e, T0 + 52 * MIN);
    expect(j).toMatchObject({ date: '2026-10-07', seance: 1, duree: 52, series: 1, version: 'complete' });
  });
});

describe('historique', () => {
  const hist: EntreeHistorique[] = [
    { seance: 1, mouvement: 'Squat arrière', date: '2026-09-23', valeurs: { charge: 55 } },
    { seance: 1, mouvement: 'Squat arrière', date: '2026-09-09', valeurs: { charge: 50 } },
  ];

  it('préremplissage avec la dernière valeur, saisie du jour prioritaire', () => {
    expect(derniereAvant(hist, 1, 'Squat arrière', '2026-10-07')?.valeurs['charge']).toBe(55);
    let e = { ...demarrer(1, 'complete', T0, '2026-10-07'), etape: 1 };
    expect(entreesExercice(e, hist)[0]?.valeurs).toEqual({ charge: 55 });
    e = saisir(e, 's1-squat|0', 'charge', 57.5);
    const entrees = entreesExercice(e, hist);
    expect(entrees[0]?.valeurs).toEqual({ charge: 57.5 });
    const fusion = fusionner(hist, entrees);
    expect(fusion.length).toBe(3);
    expect(fusionner(fusion, [{ ...entrees[0]!, valeurs: { charge: 60 } }]).length).toBe(3);
    const recap = recapitulatif(fusion, 1, '2026-10-07');
    expect(recap[0]?.valeurs[0]).toEqual({ label: 'Charge', texte: '57,5 kg', ecart: '+2,5 kg' });
  });

  it('superset : une entrée par mouvement', () => {
    let e = { ...demarrer(2, 'complete', T0, '2026-10-08'), etape: 5 };
    e = saisir(e, 's2-epaules|0', 'charge', 6);
    e = saisir(e, 's2-epaules|1', 'charge', 5);
    expect(entreesExercice(e, []).map((h) => [h.mouvement, h.valeurs['charge']])).toEqual([
      ['Élévations latérales', 6],
      ['Oiseau', 5],
    ]);
  });
});

describe('planning', () => {
  const sans: Ajustement[] = [];

  it('séance du jour, prochaine séance, vacances', () => {
    expect(seancesDuJour('2026-10-04', VACANCES_PAR_DEFAUT, sans).map((s) => s.id)).toEqual([5]);
    expect(prochaineSeance('2026-10-04', VACANCES_PAR_DEFAUT, sans)).toEqual({ date: '2026-10-07', id: 1 });
    expect(seancesDuJour('2026-10-08', VACANCES_PAR_DEFAUT, sans)).toEqual([]);
    expect(prochaineSeance('2026-10-10', VACANCES_PAR_DEFAUT, sans)).toEqual({ date: '2026-10-16', id: 4 });
  });

  it('décalage et saut', () => {
    const aj: Ajustement[] = [
      { dateOrigine: '2026-10-07', seance: 1, type: 'decalage', dateCible: '2026-10-06', creeLe: T0 },
      { dateOrigine: '2026-10-25', seance: 5, type: 'saut', creeLe: T0 },
    ];
    expect(seancesDuJour('2026-10-07', VACANCES_PAR_DEFAUT, aj)).toEqual([]);
    expect(seancesDuJour('2026-10-06', VACANCES_PAR_DEFAUT, aj)).toEqual([{ id: 1, decalee: true, origine: '2026-10-07' }]);
    const sem = semaine('2026-10-20', VACANCES_PAR_DEFAUT, aj, []);
    expect(sem[6]?.marqueurs).toEqual([{ id: 5, etat: 'saute' }]);
  });

  it('semaine : faite, prévue, vacances, aujourd\'hui', () => {
    const journal: EntreeJournal[] = [
      { id: '1', date: '2026-09-29', seance: 3, debut: T0, fin: T0 + 70 * MIN, duree: 70, series: 17, version: 'complete' },
    ];
    const sem = semaine('2026-10-04', VACANCES_PAR_DEFAUT, sans, journal);
    expect(sem.map((j) => j.marqueurs.map((m) => `${m.id}${m.etat}`).join())).toEqual([
      '', '3fait', '', '', '4prevu', '', '5prevu',
    ]);
    expect(sem[6]?.aujourdhui).toBe(true);
    expect(semaine('2026-10-12', VACANCES_PAR_DEFAUT, sans, [])[2]?.vacances).toBe(true);
    expect(dernieresSeances(journal).length).toBe(1);
  });
});
