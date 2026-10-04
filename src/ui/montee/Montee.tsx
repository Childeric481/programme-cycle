import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import './montee.css';

// Panneau qui monte du bas (repos : 380 ms, cubic-bezier(.2,.8,.2,1)).
// Le contenu reste monté quand le panneau est caché : l'ouverture n'est plus
// qu'une transformation, sans construction de l'écran au mauvais moment.
// « retard » laisse finir une animation en cours (le disque qui se plaque sur
// la barre) avant que le panneau ne la recouvre.

export function Montee({
  visible,
  reduit,
  retard = 0,
  children,
}: {
  visible: boolean;
  reduit: boolean;
  retard?: number;
  children: ComponentChildren;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const avant = useRef(visible);
  const [affiche, setAffiche] = useState(visible);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || avant.current === visible) return undefined;
    avant.current = visible;
    if (!visible) {
      setAffiche(false);
      el.animate([{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }], {
        duration: reduit ? 120 : 180,
        easing: 'ease',
      });
      return undefined;
    }
    const monter = (): void => {
      setAffiche(true);
      el.animate(
        reduit ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: reduit ? 120 : 380, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    };
    if (retard > 0 && !reduit) {
      const id = window.setTimeout(monter, retard);
      return () => window.clearTimeout(id);
    }
    monter();
    return undefined;
  }, [visible, reduit, retard]);

  return (
    <div class={`montee${affiche ? '' : ' montee--cachee'}`} ref={ref} aria-hidden={!affiche}>
      {children}
    </div>
  );
}
