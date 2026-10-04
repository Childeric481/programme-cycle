import { IconeFermer, IconeSon, IconeSonCoupe } from '../../ui/icones';
import './barre-seance.css';

export interface Segment {
  /** 0 à 1 : part des séries faites de l'étape. */
  rempli: number;
  courant: boolean;
}

export interface BarreSeanceProps {
  segments: readonly Segment[];
  ecoule: string;
  son: boolean;
  versionCourte: boolean;
  onFermer: () => void;
  onSon: () => void;
}

/** Barre du haut de la séance : fermeture, progression segmentée, temps écoulé, son. */
export function BarreSeance({ segments, ecoule, son, versionCourte, onFermer, onSon }: BarreSeanceProps) {
  return (
    <header class="barre-seance">
      <button type="button" class="barre-seance__bouton" aria-label="Fermer la séance" onClick={onFermer}>
        <IconeFermer />
      </button>
      <div class="barre-seance__centre">
        <div class="barre-seance__segments" aria-hidden="true">
          {segments.map((s, i) => (
            <span key={i} class={`barre-seance__segment${s.courant ? ' barre-seance__segment--courant' : ''}`}>
              <span class="barre-seance__rempli" style={`transform: scaleX(${s.rempli})`} />
            </span>
          ))}
        </div>
        <p class="barre-seance__infos num">
          <span>{ecoule}</span>
          {versionCourte && <span class="barre-seance__courte">Version courte</span>}
        </p>
      </div>
      <button
        type="button"
        class="barre-seance__bouton"
        aria-label={son ? 'Couper le son' : 'Rétablir le son'}
        aria-pressed={!son}
        onClick={onSon}
      >
        {son ? <IconeSon /> : <IconeSonCoupe />}
      </button>
    </header>
  );
}
