import type { ComponentChildren } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import './feuille.css';

// Feuille qui monte du bas, avec un voile (300 ms, cubic-bezier(.2,.8,.2,1)).

export function Feuille({
  ouverte,
  titre,
  onFermer,
  reduit,
  children,
}: {
  ouverte: boolean;
  titre: string;
  onFermer: () => void;
  reduit: boolean;
  children: ComponentChildren;
}) {
  const [montee, setMontee] = useState(ouverte);
  const voile = useRef<HTMLDivElement>(null);
  const panneau = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ouverte) setMontee(true);
  }, [ouverte]);

  useLayoutEffect(() => {
    const v = voile.current;
    const p = panneau.current;
    if (!montee || !v || !p) return;
    const options = { duration: reduit ? 120 : 300, easing: 'cubic-bezier(.2,.8,.2,1)' };
    if (ouverte) {
      v.animate([{ opacity: 0 }, { opacity: 1 }], options);
      p.animate(reduit ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], options);
      p.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
    } else {
      v.animate([{ opacity: 1 }, { opacity: 0 }], { ...options, fill: 'forwards' });
      const a = p.animate(
        reduit ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }],
        { ...options, duration: reduit ? 120 : 220, fill: 'forwards' },
      );
      a.onfinish = () => setMontee(false);
    }
  }, [ouverte, montee, reduit]);

  useEffect(() => {
    if (!ouverte) return undefined;
    const echap = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onFermer();
    };
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [ouverte, onFermer]);

  if (!montee) return null;
  return (
    <div class="feuille" role="dialog" aria-modal="true" aria-labelledby="feuille-titre">
      <div class="feuille__voile" ref={voile} onClick={onFermer} />
      <div class="feuille__panneau" ref={panneau}>
        <h2 id="feuille-titre" class="feuille__titre">
          {titre}
        </h2>
        {children}
      </div>
    </div>
  );
}
