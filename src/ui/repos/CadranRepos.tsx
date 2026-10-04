import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';
import type { SeanceId } from '../../data/program';
import { R, R_JANTE, secteur } from '../plate/geometrie';

/** Bande de jauge : peinte au milieu de la jante, le caoutchouc reste visible de part et d'autre. */
const MARGE_JAUGE = 2.6;
const J_EXT = R - MARGE_JAUGE;
const J_INT = R_JANTE + MARGE_JAUGE;
import { CoucheLettrage, Plate } from '../plate/Plate';
import './cadran.css';

// Cadran de repos : le disque de la séance, dont la jante colorée est la jauge.
// Couches séparées pour n'animer que transform et opacity :
// - jauge : deux lames en demi-anneau qui tournent dans deux moitiés masquées,
//   la jante se vide dans le sens antihoraire ;
// - lettrage : trois couches (ombre, lumière, encre) qui tournent ensemble,
//   un tour par minute, la lumière reste fixe en haut à gauche ;
// - temps restant au centre, fixe.

export interface CadranReposProps {
  seance: SeanceId;
  taille: number;
  /** Durée de référence de la jauge, en ms. */
  duree: number;
  /** Temps restant au moment du rendu, en ms. */
  reste: number;
  enPause: boolean;
  temps: string;
  /** Incrémenté à chaque tic des trois dernières secondes. */
  pulsation: number;
  /** Incrémenté à zéro : le disque tombe. */
  chute: number;
  reduit: boolean;
}

const EPS = 1.2; // degrés : recouvrement des lames, évite le filet au raccord

export function CadranRepos({ seance: id, taille, duree, reste, enPause, temps, pulsation, chute, reduit }: CadranReposProps) {
  const objet = useRef<HTMLDivElement>(null);
  const jauge = useRef<HTMLDivElement>(null);
  const lameG = useRef<HTMLDivElement>(null);
  const lameD = useRef<HTMLDivElement>(null);
  const anims = useRef<Animation[]>([]);
  const animChute = useRef<Animation | null>(null);

  // Jauge : animations recréées quand la durée change, recalées sur l'horloge sinon.
  useLayoutEffect(() => {
    const g = lameG.current;
    const d = lameD.current;
    if (!g || !d) return undefined;
    const options: KeyframeAnimationOptions = { duration: duree, fill: 'both', easing: 'linear' };
    const a = g.animate(
      [
        { transform: 'rotate(180deg)', opacity: 1, offset: 0 },
        { transform: 'rotate(0deg)', opacity: 1, offset: 0.4999 },
        { transform: 'rotate(0deg)', opacity: 0, offset: 0.5 },
        { transform: 'rotate(0deg)', opacity: 0, offset: 1 },
      ],
      options,
    );
    const b = d.animate(
      [
        { transform: 'rotate(180deg)', opacity: 1, offset: 0 },
        { transform: 'rotate(180deg)', opacity: 1, offset: 0.5 },
        { transform: 'rotate(0deg)', opacity: 1, offset: 0.9999 },
        { transform: 'rotate(0deg)', opacity: 0, offset: 1 },
      ],
      options,
    );
    anims.current = [a, b];
    return () => {
      a.cancel();
      b.cancel();
    };
  }, [duree]);

  useLayoutEffect(() => {
    const cible = Math.max(0, Math.min(duree, duree - reste));
    for (const a of anims.current) {
      const actuel = typeof a.currentTime === 'number' ? a.currentTime : -1;
      if (Math.abs(actuel - cible) > 120) a.currentTime = cible;
      if (enPause || reste <= 0) a.pause();
      else if (a.playState !== 'running') a.play();
    }
  }, [duree, reste, enPause]);

  // Pulsation de la jante à chaque tic.
  useEffect(() => {
    if (pulsation === 0 || !jauge.current) return;
    jauge.current.animate(
      reduit
        ? [{ opacity: 1 }, { opacity: 0.55 }, { opacity: 1 }]
        : [{ transform: 'scale(1)' }, { transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
      { duration: reduit ? 120 : 200, easing: 'ease-out' },
    );
  }, [pulsation, reduit]);

  // À zéro, le disque tombe : il descend de quelques pixels en s'écrasant, puis reprend sa forme.
  useEffect(() => {
    if (chute === 0) {
      animChute.current?.cancel();
      animChute.current = null;
      return;
    }
    if (!objet.current || reduit) return;
    animChute.current = objet.current.animate(
      [
        { transform: 'translateY(0) scale(1, 1)', easing: 'cubic-bezier(.55,0,1,.45)' },
        { transform: 'translateY(9px) scale(1.025, 0.955)', offset: 0.32, easing: 'cubic-bezier(.3,1.4,.5,1)' },
        { transform: 'translateY(4px) scale(1, 1)' },
      ],
      { duration: 420, fill: 'forwards' },
    );
  }, [chute, reduit]);

  const anneauD = secteur(J_EXT, J_INT, 180 - EPS, 360 + EPS);
  const anneauG = secteur(J_EXT, J_INT, -EPS, 180 + EPS);

  return (
    <div
      class={`cadran${enPause ? ' cadran--pause' : ''}${reduit ? ' cadran--reduit' : ''}`}
      style={`--d: ${taille}px; --face: var(--s${id}); --face-texte: var(--s${id}-texte)`}
    >
      <div class="cadran__objet" ref={objet}>
        <Plate seance={id} taille={taille} sansLettrage sansNumero janteJauge moyeu="fantome" class="cadran__disque" />
        <div class="cadran__jauge" ref={jauge} aria-hidden="true">
          <div class="cadran__demi cadran__demi--droite">
            <div class="cadran__lame" ref={lameD}>
              <svg viewBox="-100 -100 200 200">
                <path d={anneauD} />
              </svg>
            </div>
          </div>
          <div class="cadran__demi cadran__demi--gauche">
            <div class="cadran__lame" ref={lameG}>
              <svg viewBox="-100 -100 200 200">
                <path d={anneauG} />
              </svg>
            </div>
          </div>
        </div>
        <div class="cadran__lettrage" aria-hidden="true">
          <div class="cadran__decalage cadran__decalage--sombre">
            <div class="cadran__tour">
              <CoucheLettrage id={id} classe="plate__relief-sombre" />
            </div>
          </div>
          <div class="cadran__decalage cadran__decalage--clair">
            <div class="cadran__tour">
              <CoucheLettrage id={id} classe="plate__relief-clair" />
            </div>
          </div>
          <div class="cadran__decalage">
            <div class="cadran__tour">
              <CoucheLettrage id={id} classe="plate__encre" />
            </div>
          </div>
        </div>
        <div class="cadran__temps num">{temps}</div>
      </div>
    </div>
  );
}
