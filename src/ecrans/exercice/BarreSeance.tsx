import { useEffect, useState } from 'preact/hooks';
import { formatDuree } from '../../logic/repos';
import { IconeFermer, IconeSon, IconeSonCoupe } from '../../ui/icones';
import './barre-seance.css';

export interface Segment {
  /** 0 à 1 : part des séries faites de l'étape. */
  rempli: number;
  courant: boolean;
}

export interface Chrono {
  debut: number;
  cumulPause: number;
  pauseDepuis: number | null;
}

/** Temps écoulé, pauses exclues, mis à jour chaque seconde. */
function TempsEcoule({ debut, cumulPause, pauseDepuis }: Chrono) {
  const [maintenant, setMaintenant] = useState(Date.now());
  useEffect(() => {
    if (pauseDepuis !== null) return undefined;
    const id = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [pauseDepuis]);
  const ms = Math.max(0, (pauseDepuis ?? maintenant) - debut - cumulPause);
  return <span>{formatDuree(Math.floor(ms / 1000))}</span>;
}

export interface BarreSeanceProps {
  segments: readonly Segment[];
  ecoule?: string;
  chrono?: Chrono;
  son: boolean;
  versionCourte: boolean;
  onFermer: () => void;
  onSon: () => void;
}

/** Barre du haut de la séance : fermeture, progression segmentée, temps écoulé, son. */
export function BarreSeance({ segments, ecoule, chrono, son, versionCourte, onFermer, onSon }: BarreSeanceProps) {
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
          {chrono ? <TempsEcoule {...chrono} /> : <span>{ecoule}</span>}
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
