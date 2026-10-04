import { useEffect, useState } from 'preact/hooks';
import { mouvementReduit } from '../ui/mouvement';

// Routage par ancre (#/...) : fonctionne tel quel sur GitHub Pages et hors ligne.
// Les changements d'écran passent par la View Transitions API quand elle existe :
// avant, glissement vers la gauche ; retour, vers la droite (E.5).

export type TypeTransition = 'avant' | 'retour' | 'onglet' | 'etape-avant' | 'etape-retour' | 'fondu';

function lireAncre(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

let route = lireAncre();
const abonnes = new Set<(r: string) => void>();

function changer(r: string): void {
  route = r;
  for (const f of abonnes) f(r);
}

const RACINES = ['/', '/seances', '/progres', '/regles'];

function profondeur(r: string): number {
  if (RACINES.includes(r)) return 0;
  return r.split('/').filter(Boolean).length;
}

function sensEntre(de: string, vers: string): TypeTransition {
  if (RACINES.includes(de) && RACINES.includes(vers)) return 'onglet';
  return profondeur(vers) < profondeur(de) ? 'retour' : 'avant';
}

/** Applique une mise à jour d'affichage dans une transition de vue, si elle existe. */
export function transition(type: TypeTransition, maj: () => void): void {
  const doc = document as Document & {
    startViewTransition?: (rappel: () => Promise<void> | void) => { finished: Promise<void>; ready: Promise<void> };
  };
  if (!doc.startViewTransition || document.visibilityState !== 'visible') {
    maj();
    return;
  }
  // Mouvement réduit : fondus de 120 ms à la place des glissements.
  const effectif: TypeTransition = mouvementReduit() ? 'fondu' : type;
  const racine = document.documentElement;
  racine.dataset['transition'] = effectif;
  try {
    const vt = doc.startViewTransition(async () => {
      maj();
      // Preact rend dans une micro-tâche : une tâche plus tard, le nouvel écran est en place.
      await new Promise<void>((ok) => setTimeout(ok, 0));
    });
    // Une transition peut être interrompue par la suivante : ce n'est pas une erreur.
    vt.ready.catch(() => undefined);
    vt.finished
      .catch(() => undefined)
      .finally(() => {
        if (racine.dataset['transition'] === effectif) delete racine.dataset['transition'];
      });
  } catch {
    delete racine.dataset['transition'];
    maj();
  }
}

/** Navigation interne : met à jour l'ancre et l'écran ensemble. */
export function naviguer(vers: string, options: { remplacer?: boolean; sens?: TypeTransition } = {}): void {
  if (vers === route) return;
  const sens = options.sens ?? sensEntre(route, vers);
  transition(sens, () => {
    if (options.remplacer) history.replaceState(null, '', `#${vers}`);
    else history.pushState(null, '', `#${vers}`);
    changer(vers);
  });
}

if (typeof window !== 'undefined') {
  // Bouton retour du téléphone, ou ancre modifiée à la main.
  const suivre = (): void => {
    const vers = lireAncre();
    if (vers === route) return;
    transition(sensEntre(route, vers), () => changer(vers));
  };
  window.addEventListener('popstate', suivre);
  window.addEventListener('hashchange', suivre);
}

export function routeActuelle(): string {
  return route;
}

export function useRoute(): string {
  const [r, setR] = useState(route);
  useEffect(() => {
    abonnes.add(setR);
    setR(route);
    return () => {
      abonnes.delete(setR);
    };
  }, []);
  return r;
}
