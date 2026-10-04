import type { ComponentChildren } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';
import './montee.css';

// Panneau qui monte du bas (repos : 380 ms, cubic-bezier(.2,.8,.2,1)).
// Le contenu reste monté quand le panneau est caché : l'ouverture n'est plus
// qu'une transformation, sans construction de l'écran au mauvais moment.

export function Montee({ visible, reduit, children }: { visible: boolean; reduit: boolean; children: ComponentChildren }) {
  const ref = useRef<HTMLDivElement>(null);
  const avant = useRef(visible);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || avant.current === visible) return;
    avant.current = visible;
    if (visible) {
      el.animate(
        reduit ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
        { duration: reduit ? 120 : 380, easing: 'cubic-bezier(.2,.8,.2,1)' },
      );
    } else {
      el.animate([{ opacity: 1, visibility: 'visible' }, { opacity: 0, visibility: 'visible' }], {
        duration: reduit ? 120 : 180,
        easing: 'ease',
      });
    }
  }, [visible, reduit]);
  return (
    <div class={`montee${visible ? '' : ' montee--cachee'}`} ref={ref} aria-hidden={!visible}>
      {children}
    </div>
  );
}
