import { describe, expect, it } from 'vitest';
import {
  ajuster,
  demarrerRepos,
  dureeEnClair,
  formatDuree,
  fractionRestante,
  mettreEnPause,
  relancer,
  resteDe,
  secondesAffichees,
} from '../src/logic/repos';

const T0 = 1_800_000_000_000;

describe('minuteur de repos', () => {
  it('se calcule sur l\'horloge, sans dérive', () => {
    const e = demarrerRepos(90_000, T0);
    expect(resteDe(e, T0 + 30_000)).toBe(60_000);
    // Application en arrière-plan pendant 5 minutes : le repos est terminé.
    expect(resteDe(e, T0 + 300_000)).toBe(0);
  });

  it('pause : le temps restant est figé, puis repart', () => {
    let e = demarrerRepos(90_000, T0);
    e = mettreEnPause(e, T0 + 10_000);
    expect(resteDe(e, T0 + 500_000)).toBe(80_000);
    e = relancer(e, T0 + 500_000);
    expect(resteDe(e, T0 + 520_000)).toBe(60_000);
  });

  it('+30 s et −15 s', () => {
    let e = demarrerRepos(60_000, T0);
    e = ajuster(e, 30_000, T0 + 20_000);
    expect(resteDe(e, T0 + 20_000)).toBe(70_000);
    expect(e.duree).toBe(90_000);
    e = ajuster(e, -15_000, T0 + 20_000);
    expect(resteDe(e, T0 + 20_000)).toBe(55_000);
    e = ajuster(e, -15_000, T0 + 70_000);
    expect(resteDe(e, T0 + 70_000)).toBe(0);
  });

  it('ajustement pendant la pause', () => {
    let e = mettreEnPause(demarrerRepos(60_000, T0), T0 + 30_000);
    e = ajuster(e, 30_000, T0 + 99_000);
    expect(resteDe(e, T0 + 200_000)).toBe(60_000);
    expect(fractionRestante(e, T0)).toBeCloseTo(60 / 90);
  });

  it('affichage', () => {
    expect(secondesAffichees(89_001)).toBe(90);
    expect(secondesAffichees(1)).toBe(1);
    expect(secondesAffichees(0)).toBe(0);
    expect(formatDuree(90)).toBe('1:30');
    expect(formatDuree(5)).toBe('0:05');
    expect(dureeEnClair(150)).toBe('2 min 30');
    expect(dureeEnClair(90)).toBe('1 min 30');
    expect(dureeEnClair(60)).toBe('1 min');
    expect(dureeEnClair(45)).toBe('45 s');
  });
});
