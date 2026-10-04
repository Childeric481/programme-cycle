import { useEffect, useState } from 'preact/hooks';

const REQUETE = '(prefers-reduced-motion: reduce)';

export function mouvementReduit(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(REQUETE).matches;
}

/** prefers-reduced-motion : glissements et rebonds remplacés par des fondus de 120 ms. */
export function useMouvementReduit(): boolean {
  const [reduit, setReduit] = useState(mouvementReduit);
  useEffect(() => {
    const mq = window.matchMedia(REQUETE);
    const suivre = (): void => setReduit(mq.matches);
    mq.addEventListener('change', suivre);
    return () => mq.removeEventListener('change', suivre);
  }, []);
  return reduit;
}
