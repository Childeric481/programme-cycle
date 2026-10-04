import { describe, expect, it } from 'vitest';
import { VACANCES_PAR_DEFAUT } from '../src/data/program';
import { enVacances, libelleSemaine, rythmeDu, seanceDuCalendrier, typeSemaine } from '../src/logic/calendrier';
import { ajouterJours, dateLongue, jourSemaine } from '../src/logic/dates';

describe('dates', () => {
  it('format long, 1er compris', () => {
    expect(dateLongue('2026-10-04')).toBe('Dimanche 4 octobre');
    expect(dateLongue('2026-10-01')).toBe('Jeudi 1er octobre');
    expect(dateLongue('2026-10-16', false)).toBe('vendredi 16 octobre');
  });

  it('jours de la semaine et passage à l\'heure d\'hiver', () => {
    expect(jourSemaine('2026-09-07')).toBe(0);
    expect(jourSemaine('2026-10-04')).toBe(6);
    expect(ajouterJours('2026-10-24', 2)).toBe('2026-10-26');
    expect(ajouterJours('2026-12-31', 1)).toBe('2027-01-01');
  });
});

describe('calendrier (A et C.1)', () => {
  it('la semaine du 7 septembre 2026 est chargée, puis alternance stricte', () => {
    expect(typeSemaine('2026-09-07')).toBe('chargee');
    expect(typeSemaine('2026-09-13')).toBe('chargee');
    expect(typeSemaine('2026-09-14')).toBe('tranquille');
    expect(typeSemaine('2026-09-28')).toBe('tranquille');
    expect(typeSemaine('2026-10-05')).toBe('chargee');
    expect(typeSemaine('2026-08-31')).toBe('tranquille');
  });

  it('séances du tableau de référence', () => {
    expect(seanceDuCalendrier('2026-10-04')).toBe(5);
    expect(seanceDuCalendrier('2026-10-07')).toBe(1);
    expect(seanceDuCalendrier('2026-10-08')).toBe(2);
    expect(seanceDuCalendrier('2026-10-13')).toBe(3);
    expect(seanceDuCalendrier('2026-10-16')).toBe(4);
    expect(seanceDuCalendrier('2026-10-12')).toBeNull();
  });

  it('vacances du jeudi 8 au jeudi 15 octobre 2026 inclus', () => {
    expect(enVacances('2026-10-07', VACANCES_PAR_DEFAUT)).toBe(false);
    expect(enVacances('2026-10-08', VACANCES_PAR_DEFAUT)).toBe(true);
    expect(enVacances('2026-10-15', VACANCES_PAR_DEFAUT)).toBe(true);
    expect(enVacances('2026-10-16', VACANCES_PAR_DEFAUT)).toBe(false);
    expect(libelleSemaine('2026-10-10', VACANCES_PAR_DEFAUT)).toBe('Vacances');
    expect(libelleSemaine('2026-10-04', VACANCES_PAR_DEFAUT)).toBe('Semaine tranquille');
  });

  it('rythme de travail', () => {
    expect(rythmeDu('2026-10-05')).toBe('Travail');
    expect(rythmeDu('2026-10-07')).toBe('Libre');
    expect(rythmeDu('2026-09-30')).toBe('Travail');
    expect(rythmeDu('2026-10-02')).toBe('Libre');
  });
});
