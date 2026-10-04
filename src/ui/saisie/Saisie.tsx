import { arrondirAuPas, nombreFr } from '../../logic/nombres';
import { IconeMoins, IconePlus } from '../icones';
import './saisie.css';

export interface SaisieProps {
  label: string;
  valeur: number | null;
  unite: string;
  pas: number;
  min?: number;
  onChange: (v: number) => void;
}

/** Champ de saisie avec boutons − et +, cibles de 56 px. */
export function Saisie({ label, valeur, unite, pas, min = 0, onChange }: SaisieProps) {
  const arrondir = (v: number): number => arrondirAuPas(v, pas);
  const v = valeur ?? 0;
  return (
    <div class="saisie" role="group" aria-label={label}>
      <span class="saisie__label">{label}</span>
      <div class="saisie__champ">
        <button
          type="button"
          class="saisie__bouton"
          aria-label={`Moins ${nombreFr(pas, pas)} ${unite}`}
          disabled={v - pas < min}
          onClick={() => onChange(arrondir(Math.max(min, v - pas)))}
        >
          <IconeMoins />
        </button>
        <output class="saisie__valeur num" aria-live="polite">
          {valeur === null ? '—' : nombreFr(valeur, pas)}
          <span class="saisie__unite">{unite}</span>
        </output>
        <button
          type="button"
          class="saisie__bouton"
          aria-label={`Plus ${nombreFr(pas, pas)} ${unite}`}
          onClick={() => onChange(arrondir(v + pas))}
        >
          <IconePlus />
        </button>
      </div>
    </div>
  );
}
