import { useLayoutEffect, useRef } from 'preact/hooks';
import type { SeanceId } from '../../data/program';
import './manchon.css';

// Compteur de séries : un manchon de barre olympique, en acier, avec son collier.
// Chaque série validée fait glisser un disque vu de profil, qui vient se plaquer
// contre les précédents avec un léger rebond. Les séries restantes sont des
// emplacements en pointillé. Annuler fait ressortir le dernier disque.

export const DUREE_CHARGEMENT = 380;
/** Instant du contact, en fraction de la durée : le clic sonore s'y cale. */
export const CONTACT = 0.62;

const X0 = 50; // premier emplacement, contre le collier
const EPAISSEUR = 18;
const ECART = 2;

export interface ManchonProps {
  seance: SeanceId;
  total: number;
  faites: number;
  reduit: boolean;
  label: string;
}

export function Manchon({ seance, total, faites, reduit, label }: ManchonProps) {
  const racine = useRef<HTMLDivElement>(null);
  const disques = useRef<(HTMLDivElement | null)[]>([]);
  const precedent = useRef(faites);

  useLayoutEffect(() => {
    const avant = precedent.current;
    precedent.current = faites;
    const largeur = racine.current?.clientWidth ?? 320;
    const xBout = largeur - EPAISSEUR - 2;
    for (let i = avant; i < faites; i++) {
      const el = disques.current[i];
      if (!el) continue;
      const d = Math.max(40, xBout - (X0 + i * (EPAISSEUR + ECART)));
      el.animate(
        reduit
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { transform: `translateX(${d}px)`, opacity: 0, offset: 0, easing: 'linear' },
              { transform: `translateX(${d * 0.9}px)`, opacity: 1, offset: 0.08, easing: 'cubic-bezier(.45,0,.9,.55)' },
              { transform: 'translateX(0)', offset: CONTACT, easing: 'cubic-bezier(.2,.9,.3,1.35)' },
              { transform: 'translateX(3px)', offset: 0.8, easing: 'cubic-bezier(.4,0,.6,1)' },
              { transform: 'translateX(0)', offset: 1 },
            ],
        { duration: reduit ? 120 : DUREE_CHARGEMENT, fill: 'backwards' },
      );
    }
    for (let i = faites; i < avant; i++) {
      const el = disques.current[i];
      if (!el) continue;
      el.animate(
        reduit
          ? [{ opacity: 1 }, { opacity: 0 }]
          : [
              { transform: 'translateX(0)', opacity: 1 },
              { transform: 'translateX(46px)', opacity: 0 },
            ],
        { duration: reduit ? 120 : 220, easing: 'cubic-bezier(.4,0,1,1)' },
      );
    }
  }, [faites, reduit]);

  const emplacements = Array.from({ length: total }, (_, i) => i);

  return (
    <div
      class="manchon"
      ref={racine}
      role="img"
      aria-label={label}
      style={`--face: var(--s${seance})`}
    >
      <div class="manchon__arbre" />
      <div class="manchon__collier" />
      <div class="manchon__fourreau" />
      {emplacements.map((i) => (
        <div
          key={`e${i}`}
          class={`manchon__emplacement${i < faites ? ' manchon__emplacement--plein' : ''}`}
          style={`left: ${X0 + i * (EPAISSEUR + ECART)}px`}
        />
      ))}
      {emplacements.map((i) => (
        <div
          key={`d${i}`}
          ref={(el) => {
            disques.current[i] = el;
          }}
          class={`manchon__disque${i < faites ? ' manchon__disque--charge' : ''}`}
          style={`left: ${X0 + i * (EPAISSEUR + ECART)}px`}
        />
      ))}
    </div>
  );
}
