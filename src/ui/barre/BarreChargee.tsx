import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { SeanceId } from '../../data/program';
import './barre-chargee.css';

// Fin de séance, le seul moment de célébration : un disque par exercice fait
// vient se charger sur la barre, en cascade rapide, de chaque côté ; puis la
// barre se soulève et se repose (600 ms, puis 600 ms). Pas de confettis.

const EPAISSEUR = 11;
const ECART = 2;
const DEMI_ARBRE = 52;
const COLLIER = 12;

export function BarreChargee({
  seance,
  disques,
  reduit,
  onFini,
}: {
  seance: SeanceId;
  disques: number;
  reduit: boolean;
  onFini: () => void;
}) {
  const racine = useRef<HTMLDivElement>(null);
  const barre = useRef<HTMLDivElement>(null);
  const [largeur, setLargeur] = useState(358);
  const n = Math.max(1, Math.min(disques, 9));

  useLayoutEffect(() => {
    const el = racine.current;
    const b = barre.current;
    if (!el || !b) return undefined;
    const l = el.clientWidth;
    setLargeur(l);
    const plaques = Array.from(el.querySelectorAll<HTMLElement>('.barre-chargee__disque'));
    if (reduit) {
      for (const p of plaques) p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, fill: 'backwards' });
      const id = window.setTimeout(onFini, 160);
      return () => window.clearTimeout(id);
    }
    // Chargement en cascade : 600 ms pour toute la barre.
    const duree = 280;
    const pasCascade = n > 1 ? (600 - duree) / (n - 1) : 0;
    for (const p of plaques) {
      const i = Number(p.dataset['rang']);
      const cote = p.dataset['cote'] === 'g' ? -1 : 1;
      const d = cote * Math.max(30, l / 2 - DEMI_ARBRE - COLLIER - i * (EPAISSEUR + ECART));
      p.animate(
        [
          { transform: `translateX(${d}px)`, opacity: 0, offset: 0 },
          { transform: `translateX(${d * 0.85}px)`, opacity: 1, offset: 0.1, easing: 'cubic-bezier(.45,0,.9,.55)' },
          { transform: 'translateX(0)', offset: 0.7, easing: 'cubic-bezier(.2,.9,.3,1.35)' },
          { transform: `translateX(${cote * 2}px)`, offset: 0.85 },
          { transform: 'translateX(0)', offset: 1 },
        ],
        { duration: duree, delay: i * pasCascade, fill: 'backwards' },
      );
    }
    // Puis la barre se soulève et se repose.
    const levee = b.animate(
      [
        { transform: 'translateY(0)', offset: 0, easing: 'cubic-bezier(.2,.8,.2,1)' },
        { transform: 'translateY(-26px)', offset: 0.5, easing: 'cubic-bezier(.5,0,.75,0)' },
        { transform: 'translateY(2px)', offset: 0.92 },
        { transform: 'translateY(0)', offset: 1 },
      ],
      { duration: 1200, delay: 620 },
    );
    levee.onfinish = onFini;
    return () => levee.cancel();
  }, [n, reduit]);

  const xCollierG = largeur / 2 - DEMI_ARBRE - COLLIER;
  const xCollierD = largeur / 2 + DEMI_ARBRE;
  const rangs = Array.from({ length: n }, (_, i) => i);

  return (
    <div class="barre-chargee" ref={racine} role="img" aria-label={`${n} disque${n > 1 ? 's' : ''} chargé${n > 1 ? 's' : ''} de chaque côté`} style={`--face: var(--s${seance})`}>
      <div class="barre-chargee__barre" ref={barre}>
        <div class="barre-chargee__manchon barre-chargee__manchon--g" style={`width: ${xCollierG}px`} />
        <div class="barre-chargee__manchon barre-chargee__manchon--d" style={`left: ${xCollierD + COLLIER}px`} />
        <div class="barre-chargee__arbre" style={`left: ${largeur / 2 - DEMI_ARBRE}px; width: ${DEMI_ARBRE * 2}px`} />
        <div class="barre-chargee__collier" style={`left: ${xCollierG}px`} />
        <div class="barre-chargee__collier" style={`left: ${xCollierD}px`} />
        {rangs.map((i) => (
          <div
            key={`g${i}`}
            class="barre-chargee__disque"
            data-rang={i}
            data-cote="g"
            style={`left: ${xCollierG - (i + 1) * (EPAISSEUR + ECART)}px`}
          />
        ))}
        {rangs.map((i) => (
          <div
            key={`d${i}`}
            class="barre-chargee__disque"
            data-rang={i}
            data-cote="d"
            style={`left: ${xCollierD + COLLIER + ECART + i * (EPAISSEUR + ECART)}px`}
          />
        ))}
      </div>
    </div>
  );
}
