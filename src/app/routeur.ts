import { useEffect, useState } from 'preact/hooks';

// Routage par ancre (#/...) : fonctionne tel quel sur GitHub Pages et hors ligne.

export function routeActuelle(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

export function useRoute(): string {
  const [route, setRoute] = useState(routeActuelle);
  useEffect(() => {
    const suivre = (): void => setRoute(routeActuelle());
    window.addEventListener('hashchange', suivre);
    return () => window.removeEventListener('hashchange', suivre);
  }, []);
  return route;
}

export function aller(route: string): void {
  window.location.hash = route;
}
