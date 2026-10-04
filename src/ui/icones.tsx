// Icônes dessinées à la main, trait de 2 px, grille de 24.

import type { ComponentChildren } from 'preact';

interface IconeProps {
  taille?: number;
  class?: string;
}

function Svg({ taille = 24, class: classe, children }: IconeProps & { children: ComponentChildren }) {
  return (
    <svg
      class={`icone ${classe ?? ''}`}
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconeFermer(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

export function IconeSon(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" />
    </Svg>
  );
}

export function IconeSonCoupe(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      <path d="M16 9.5l5 5M21 9.5l-5 5" />
    </Svg>
  );
}

export function IconeMoins(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M6 12h12" />
    </Svg>
  );
}

export function IconePlus(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M12 6v12M6 12h12" />
    </Svg>
  );
}

export function IconeRetour(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

export function IconeCoche(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** Aujourd'hui : un disque vu de face. */
export function IconeAujourdhui(p: IconeProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.5" />
    </Svg>
  );
}

/** Séances : des disques vus de profil, sur leur manchon. */
export function IconeSeances(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M2 12h3M19 12h3" />
      <rect x="6" y="4" width="3" height="16" rx="1" />
      <rect x="10.5" y="4" width="3" height="16" rx="1" />
      <rect x="15" y="6" width="3" height="12" rx="1" />
    </Svg>
  );
}

/** Progrès : une courbe sur son axe. */
export function IconeProgres(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M4 4v16h16" />
      <path d="M7.5 15l3.5-4 3 2.5 5-6.5" />
    </Svg>
  );
}

/** Règles : une page de lecture. */
export function IconeRegles(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M6 3.5h9l3 3v14H6z" />
      <path d="M9 10h6M9 13.5h6M9 17h4" />
    </Svg>
  );
}

export function IconeChevron(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M7 10l5 5 5-5" />
    </Svg>
  );
}
