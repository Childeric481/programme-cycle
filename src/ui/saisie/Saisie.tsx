import { useEffect, useRef, useState } from 'preact/hooks';
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

/** « 62,5 » ou « 62.5 » : nombre positif, ou null. */
function lire(texte: string): number | null {
  const t = texte.trim().replace(',', '.');
  if (t === '' || !/^\d*\.?\d*$/.test(t)) return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

/** Champ de saisie : la valeur se tape au clavier, les boutons − et + ajoutent un pas. Cibles de 56 px. */
export function Saisie({ label, valeur, unite, pas, min = 0, onChange }: SaisieProps) {
  const enCours = useRef(false);
  const afficher = (v: number | null): string => (v === null ? '' : nombreFr(v, pas));
  const [texte, setTexte] = useState(() => afficher(valeur));

  useEffect(() => {
    if (!enCours.current) setTexte(afficher(valeur));
  }, [valeur, pas]);

  const v = valeur ?? 0;
  const appliquer = (n: number): void => {
    const r = arrondirAuPas(Math.max(min, n), pas);
    setTexte(afficher(r));
    onChange(r);
  };

  return (
    <div class="saisie" role="group" aria-label={label}>
      <span class="saisie__label">{label}</span>
      <div class="saisie__champ">
        <button
          type="button"
          class="saisie__bouton"
          aria-label={`Moins ${nombreFr(pas, pas)} ${unite}`}
          disabled={valeur === null || v - pas < min}
          onClick={() => appliquer(v - pas)}
        >
          <IconeMoins />
        </button>
        <label class="saisie__valeur">
          <input
            class="saisie__entree num"
            type="text"
            inputMode="decimal"
            enterKeyHint="done"
            autoComplete="off"
            placeholder="—"
            aria-label={`${label}, en ${unite}`}
            value={texte}
            onFocus={(e) => {
              enCours.current = true;
              e.currentTarget.select();
            }}
            onInput={(e) => {
              const t = e.currentTarget.value;
              setTexte(t);
              const n = lire(t);
              if (n !== null) onChange(arrondirAuPas(n, pas));
            }}
            onBlur={() => {
              enCours.current = false;
              const n = lire(texte);
              if (n === null) setTexte(afficher(valeur));
              else appliquer(n);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
          <span class="saisie__unite">{unite}</span>
        </label>
        <button
          type="button"
          class="saisie__bouton"
          aria-label={`Plus ${nombreFr(pas, pas)} ${unite}`}
          onClick={() => appliquer(valeur === null ? pas : v + pas)}
        >
          <IconePlus />
        </button>
      </div>
    </div>
  );
}
