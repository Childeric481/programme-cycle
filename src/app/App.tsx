import type { ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { seance, VACANCES_PAR_DEFAUT } from '../data/program';
import { enVacances, libelleSemaine, seanceDuCalendrier } from '../logic/calendrier';
import { dateLongue, isoLocal } from '../logic/dates';
import { installerNouvelleVersion, surNouvelleVersion } from './pwa';
import { useRoute } from './routeur';
import './app.css';

function Paresseux({ charger }: { charger: () => Promise<ComponentType> }) {
  const [Composant, setComposant] = useState<ComponentType | null>(null);
  useEffect(() => {
    let actif = true;
    void charger().then((c) => {
      if (actif) setComposant(() => c);
    });
    return () => {
      actif = false;
    };
  }, [charger]);
  return Composant ? <Composant /> : null;
}

const chargerPlanche = (): Promise<ComponentType> => import('../planche/Planche').then((m) => m.Planche);

function BandeauMiseAJour() {
  const [disponible, setDisponible] = useState(false);
  useEffect(() => surNouvelleVersion(setDisponible), []);
  if (!disponible) return null;
  return (
    <div class="bandeau-maj" role="status">
      <span>Nouvelle version disponible</span>
      <button class="bouton bouton--secondaire" type="button" onClick={installerNouvelleVersion}>
        Recharger
      </button>
    </div>
  );
}

function AccueilProvisoire() {
  const iso = isoLocal();
  const id = enVacances(iso, VACANCES_PAR_DEFAUT) ? null : seanceDuCalendrier(iso);
  const s = id ? seance(id) : null;
  return (
    <main class="squelette" data-seance={id ?? undefined}>
      <h1 class="squelette__date">{dateLongue(iso)}</h1>
      <p class="squelette__semaine">{libelleSemaine(iso, VACANCES_PAR_DEFAUT)}</p>
      <p class="squelette__jour">
        {s ? `Aujourd'hui, séance ${s.id}. ${s.titre}.` : 'Pas de séance aujourd\'hui.'}
      </p>
      <p class="secondaire squelette__version">Version {__VERSION__}</p>
    </main>
  );
}

export function App() {
  const route = useRoute();
  return (
    <>
      {route === '/planche' ? <Paresseux charger={chargerPlanche} /> : <AccueilProvisoire />}
      <BandeauMiseAJour />
    </>
  );
}
