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

export function IconeChevron(p: IconeProps) {
  return (
    <Svg {...p}>
      <path d="M7 10l5 5 5-5" />
    </Svg>
  );
}
