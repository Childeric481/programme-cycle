import { IconeAujourdhui, IconeProgres, IconeRegles, IconeSeances } from '../ui/icones';
import { typo } from '../ui/typo';
import { naviguer } from './routeur';
import './onglets.css';

const ONGLETS = [
  { route: '/', nom: "Aujourd'hui", Icone: IconeAujourdhui },
  { route: '/seances', nom: 'Séances', Icone: IconeSeances },
  { route: '/progres', nom: 'Progrès', Icone: IconeProgres },
  { route: '/regles', nom: 'Règles', Icone: IconeRegles },
] as const;

function actif(route: string, onglet: string): boolean {
  return onglet === '/' ? route === '/' : route === onglet || route.startsWith(`${onglet}/`);
}

/** Barre d'onglets en bas, quatre entrées. Elle disparaît pendant une séance. */
export function Onglets({ route }: { route: string }) {
  return (
    <nav class="onglets" aria-label="Navigation">
      {ONGLETS.map(({ route: r, nom, Icone }) => {
        const courant = actif(route, r);
        return (
          <a
            key={r}
            href={`#${r}`}
            class={`onglets__lien${courant ? ' onglets__lien--actif' : ''}`}
            aria-current={courant ? 'page' : undefined}
            onClick={(ev) => {
              ev.preventDefault();
              if (route !== r) naviguer(r);
              else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Icone taille={24} />
            <span>{typo(nom)}</span>
          </a>
        );
      })}
    </nav>
  );
}
