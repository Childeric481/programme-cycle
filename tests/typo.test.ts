import { describe, expect, it } from 'vitest';
import { typo } from '../src/ui/typo';
import { nombreFr } from '../src/logic/nombres';

describe('typographie à l\'affichage', () => {
  it('apostrophe, deux-points, unités', () => {
    expect(typo("Garde 2 répétitions en réserve, jamais l'échec.")).toBe('Garde 2 répétitions en réserve, jamais l’échec.');
    expect(typo('Élévations : charge légère')).toBe('Élévations : charge légère');
    expect(typo('3 s à la descente.')).toBe('3 s à la descente.');
    expect(typo('4 × 6')).toBe('4 × 6');
    expect(typo('3 × (15 + 15)')).toBe('3 × (15 + 15)');
    expect(typo('Moins de 10 cm entre')).toBe('Moins de 10 cm entre');
  });

  it('nombres à la française', () => {
    expect(nombreFr(60, 2.5)).toBe('60');
    expect(nombreFr(62.5, 2.5)).toBe('62,5');
    expect(nombreFr(4.8, 0.01)).toBe('4,8');
    expect(nombreFr(9.5, 0.5)).toBe('9,5');
  });
});
