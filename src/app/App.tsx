import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { SeanceId } from '../data/program';
import { charger, lireEtat, useApp } from '../store/app';
import { Aujourdhui } from '../ecrans/aujourdhui/Aujourdhui';
import { DetailSeance, EnAttente, ListeSeances } from '../ecrans/seances/Seances';
import { EcranSeance } from '../ecrans/seance/EcranSeance';
import { FinSeance } from '../ecrans/fin/FinSeance';
import { Onglets } from './Onglets';
import { installerNouvelleVersion, surNouvelleVersion } from './pwa';
import { naviguer, routeActuelle, useRoute } from './routeur';
import './app.css';

function Paresseux({ charger: chargerComposant }: { charger: () => Promise<ComponentType> }) {
  const [Composant, setComposant] = useState<ComponentType | null>(null);
  useEffect(() => {
    let actif = true;
    void chargerComposant().then((c) => {
      if (actif) setComposant(() => c);
    });
    return () => {
      actif = false;
    };
  }, [chargerComposant]);
  return Composant ? <Composant /> : null;
}

const chargerPlanche = (): Promise<ComponentType> => import('../planche/Planche').then((m) => m.Planche);

/** Nouvelle version déployée : un bandeau propose de recharger, jamais pendant une séance. */
function BandeauMiseAJour({ avecOnglets }: { avecOnglets: boolean }) {
  const [disponible, setDisponible] = useState(false);
  useEffect(() => surNouvelleVersion(setDisponible), []);
  if (!disponible) return null;
  return (
    <div class={`bandeau-maj${avecOnglets ? ' bandeau-maj--onglets' : ''}`} role="status">
      <span>Nouvelle version disponible</span>
      <button class="bouton bouton--secondaire" type="button" onClick={installerNouvelleVersion}>
        Recharger
      </button>
    </div>
  );
}

/** Thème : automatique, clair ou sombre (réglages). */
function useTheme(): void {
  const theme = useApp((e) => e.reglages.theme);
  useEffect(() => {
    const racine = document.documentElement;
    if (theme === 'clair') racine.dataset['theme'] = 'light';
    else if (theme === 'sombre') racine.dataset['theme'] = 'dark';
    else delete racine.dataset['theme'];
    try {
      localStorage.setItem('programme.theme', theme);
    } catch {
      /* stockage indisponible */
    }
  }, [theme]);
}

export function App() {
  const pret = useApp((e) => e.pret);
  const route = useRoute();
  useTheme();

  useEffect(() => {
    void charger().then(() => {
      // Séance en cours, non mise en pause : reprise exactement là où elle s'est arrêtée.
      const s = lireEtat().seance;
      if (s && s.pauseDepuis === null && routeActuelle() !== '/seance' && routeActuelle() !== '/planche') {
        naviguer('/seance', { remplacer: true });
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  if (!pret) return null;

  let ecran;
  let onglets = true;
  const detail = /^\/seances\/([1-5])$/.exec(route);
  const fin = /^\/fin\/(.+)$/.exec(route);
  if (route === '/seances') ecran = <ListeSeances />;
  else if (detail) ecran = <DetailSeance key={detail[1]} id={Number(detail[1]) as SeanceId} />;
  else if (route === '/progres') ecran = <EnAttente titre="Progrès" />;
  else if (route === '/regles') ecran = <EnAttente titre="Règles" />;
  else if (route === '/seance') {
    ecran = <EcranSeance />;
    onglets = false;
  } else if (fin) {
    ecran = <FinSeance id={fin[1] ?? ''} />;
    onglets = false;
  } else if (route === '/planche') {
    ecran = <Paresseux charger={chargerPlanche} />;
    onglets = false;
  } else ecran = <Aujourdhui />;

  return (
    <>
      {ecran}
      {onglets && <Onglets route={route} />}
      {route !== '/seance' && <BandeauMiseAJour avecOnglets={onglets} />}
    </>
  );
}
