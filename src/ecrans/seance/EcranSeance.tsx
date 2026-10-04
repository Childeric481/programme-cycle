import { useEffect, useState } from 'preact/hooks';
import { seance as seanceDe } from '../../data/program';
import { sousTitreCircuit, toursDe } from '../../data/derive';
import { clic, deverrouillerAudio, vibrer } from '../../audio/sons';
import { derniereAvant, entreesExercice, pasDe, uniteDe, valeurChamp, valeurEnClair } from '../../logic/historique';
import type { EtatRepos } from '../../logic/repos';
import {
  allerA,
  annulerSerie,
  annulerTour,
  cleSaisie,
  cocher,
  cocherCircuit,
  etapesSeance,
  finirRepos,
  libelleSuivant,
  majRepos,
  mettreEnPause,
  reperage,
  saisir,
  segments,
  validerSerie,
  validerTour,
} from '../../logic/seance';
import { compteurDe } from '../../data/derive';
import { enregistrerHistorique, lireEtat, majSeance, reglerSon, terminerSeance, useApp } from '../../store/app';
import { naviguer, transition } from '../../app/routeur';
import { useEcranAllume } from '../../app/eveil';
import { BarreSeance } from '../exercice/BarreSeance';
import { EcranExercice, type ChampExercice } from '../exercice/EcranExercice';
import { EcranRepos } from '../repos/EcranRepos';
import { Feuille } from '../../ui/feuille/Feuille';
import { CONTACT, DUREE_CHARGEMENT } from '../../ui/manchon/Manchon';
import { Montee } from '../../ui/montee/Montee';
import { useMouvementReduit } from '../../ui/mouvement';
import { typo } from '../../ui/typo';
import { EtapeCircuit, EtapeEchauffement } from './Etapes';
import './ecran-seance.css';

const REPOS_DORMANT: EtatRepos = { duree: 150_000, fin: null, resteEnPause: 150_000 };

/** Un disque glisse et se plaque : vibration brève au toucher, clic sonore au contact. */
function retourCharge(): void {
  deverrouillerAudio();
  vibrer(15);
  clic((DUREE_CHARGEMENT * CONTACT) / 1000);
}

export function EcranSeance() {
  const s = useApp((e) => e.seance);
  const historique = useApp((e) => e.historique);
  const son = useApp((e) => e.reglages.son);
  const reduit = useMouvementReduit();
  const [feuille, setFeuille] = useState(false);
  useEcranAllume(s !== null && s.pauseDepuis === null);

  // Arrivée sur l'écran sans séance en cours (ancre ouverte à la main) : retour à l'accueil.
  // Seulement à l'ouverture : en fin de séance, c'est l'écran de fin qui prend la suite.
  useEffect(() => {
    if (!lireEtat().seance) naviguer('/', { remplacer: true, sens: 'retour' });
  }, []);

  if (!s) return null;

  const seance = seanceDe(s.seance);
  const etapes = etapesSeance(s);
  const index = Math.min(s.etape, etapes.length - 1);
  const et = etapes[index] ?? { type: 'echauffement' as const };
  const titreEch = seance.echauffement.titre;

  const changerEtape = (i: number): void => {
    if (i < 0 || i >= etapes.length || i === index) return;
    transition(i > index ? 'etape-avant' : 'etape-retour', () => majSeance((x) => allerA(x, i)));
  };

  const terminer = (): void => {
    const entree = terminerSeance();
    if (entree) naviguer(`/fin/${entree.id}`, { remplacer: true });
  };

  const barre = (
    <BarreSeance
      segments={segments(s)}
      chrono={{ debut: s.debut, cumulPause: s.cumulPause, pauseDepuis: s.pauseDepuis }}
      son={son}
      versionCourte={s.format === 'courte'}
      onFermer={() => setFeuille(true)}
      onSon={() => reglerSon(!son)}
    />
  );

  let contenu;
  if (et.type === 'echauffement') {
    contenu = (
      <EtapeEchauffement
        titre={titreEch}
        elements={seance.echauffement.elements}
        coches={s.coches}
        enTete={barre}
        onBascule={(id) => majSeance((x) => cocher(x, id))}
        onCommencer={() => changerEtape(index + 1)}
      />
    );
  } else if (et.type === 'exercice') {
    const ex = et.exercice;
    const total = compteurDe(ex, s.format) ?? 0;
    const faites = s.series[ex.id] ?? 0;
    const champs: ChampExercice[] = ex.mouvements.flatMap((m, i) =>
      m.saisies
        .filter((sa) => sa.kind !== 'etape')
        .map((sa) => {
          const cle = cleSaisie(ex.id, i);
          const v = valeurChamp(s, historique, cle, m.nom, sa.id);
          const avant = derniereAvant(historique, s.seance, m.nom, s.date)?.valeurs[sa.id];
          return {
            cle: `${cle}#${sa.id}`,
            label: sa.label,
            unite: uniteDe(sa),
            pas: pasDe(sa),
            valeur: typeof v === 'number' ? v : null,
            rappel: avant !== undefined ? `La dernière fois ${valeurEnClair(sa, avant)}` : 'Première fois, note ce que tu fais.',
          };
        }),
    );
    const dernier = index === etapes.length - 1;
    contenu = (
      <EcranExercice
        seance={s.seance}
        exercice={ex}
        version={s.format}
        reperage={reperage(et, titreEch)}
        faites={faites}
        total={total}
        champs={champs}
        libelleSuivant={libelleSuivant(s)}
        reduit={reduit}
        enTete={barre}
        transitions
        peutSuivante={!dernier}
        onValeur={(cleChamp, valeur) => {
          const [cle = '', champ = ''] = cleChamp.split('#');
          majSeance((x) => saisir(x, cle, champ, valeur));
          // Une correction après une série validée s'enregistre aussi.
          const apres = lireEtat();
          if (apres.seance && (apres.seance.series[ex.id] ?? 0) > 0) {
            enregistrerHistorique(entreesExercice(apres.seance, apres.historique));
          }
        }}
        onValider={() => {
          const avant = lireEtat();
          if (!avant.seance) return;
          enregistrerHistorique(entreesExercice(avant.seance, avant.historique));
          retourCharge();
          majSeance((x) => validerSerie(x, Date.now()));
        }}
        onAnnuler={() => majSeance(annulerSerie)}
        onPrecedent={() => changerEtape(index - 1)}
        onSuivant={() => (dernier ? terminer() : changerEtape(index + 1))}
        onEtapeSuivante={() => changerEtape(index + 1)}
      />
    );
  } else {
    const total = toursDe(seance, s.format) ?? 0;
    contenu = (
      <EtapeCircuit
        seance={s.seance}
        circuit={et.circuit}
        sousTitre={sousTitreCircuit(seance, s.format) ?? ''}
        tours={s.tours}
        total={total}
        coches={s.cochesCircuit}
        reduit={reduit}
        enTete={barre}
        onBascule={(i) => majSeance((x) => cocherCircuit(x, i))}
        onValider={() => {
          retourCharge();
          majSeance((x) => validerTour(x, Date.now()));
        }}
        onAnnuler={() => majSeance(annulerTour)}
        onPrecedent={() => changerEtape(index - 1)}
        onTerminer={terminer}
      />
    );
  }

  return (
    <div class="ecran-seance" data-seance={s.seance} onPointerDown={deverrouillerAudio}>
      {contenu}
      <Montee visible={s.repos !== null} reduit={reduit} retard={DUREE_CHARGEMENT + 80}>
        <EcranRepos
          seance={s.seance}
          etat={s.repos ?? REPOS_DORMANT}
          cycle={s.reposCycle}
          dormant={s.repos === null || s.pauseDepuis !== null}
          ensuite={s.ensuite}
          onEtat={(r) => majSeance((x) => majRepos(x, r))}
          onTermine={() => majSeance(finirRepos)}
        />
      </Montee>
      <Feuille ouverte={feuille} titre="Mettre la séance en pause ?" onFermer={() => setFeuille(false)} reduit={reduit}>
        <p class="feuille__texte">{typo("Tu reprendras là où tu t'es arrêtée.")}</p>
        <button
          type="button"
          class="bouton bouton--principal bouton--seance bouton--plein"
          onClick={() => {
            setFeuille(false);
            majSeance((x) => mettreEnPause(x, Date.now()));
            naviguer('/', { sens: 'retour' });
          }}
        >
          Mettre en pause
        </button>
        <button
          type="button"
          class="bouton bouton--secondaire bouton--seance bouton--plein"
          onClick={() => {
            setFeuille(false);
            terminer();
          }}
        >
          Terminer la séance maintenant
        </button>
        <button type="button" class="feuille__lien" onClick={() => setFeuille(false)}>
          Continuer la séance
        </button>
      </Feuille>
    </div>
  );
}
