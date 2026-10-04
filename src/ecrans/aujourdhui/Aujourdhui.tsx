import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { seance as seanceDe, type SeanceId } from '../../data/program';
import { deverrouillerAudio } from '../../audio/sons';
import { enVacances, libelleSemaine } from '../../logic/calendrier';
import { dateLongue, isoLocal, jourEtMois, NOMS_JOURS, type Iso } from '../../logic/dates';
import { dernieresSeances, prochaineSeance, seancesDuJour, semaine, type EtatMarqueur, type JourSemaine } from '../../logic/planning';
import { etapeCourante, position, reprendre, seriesValidees as nbSeries, titreEchauffement, totalSeries } from '../../logic/seance';
import { lieuDureeExercices, minusculeInitiale, seriesValidees } from '../../logic/textes';
import { commencerSeance, majSeance, useApp } from '../../store/app';
import { naviguer } from '../../app/routeur';
import { Plate, type EtatDisque } from '../../ui/plate/Plate';
import { useMouvementReduit } from '../../ui/mouvement';
import { typo } from '../../ui/typo';
import './aujourdhui.css';

/** Date du jour, recalculée au retour au premier plan (minuit passé, téléphone en veille). */
function useAujourdhui(): Iso {
  const [iso, setIso] = useState(isoLocal);
  useEffect(() => {
    const maj = (): void => setIso(isoLocal());
    document.addEventListener('visibilitychange', maj);
    const id = window.setInterval(maj, 60_000);
    return () => {
      document.removeEventListener('visibilitychange', maj);
      window.clearInterval(id);
    };
  }, []);
  return iso;
}

function phraseProchaine(p: { date: Iso; id: SeanceId } | null): string | null {
  if (!p) return null;
  return `Prochaine séance le ${dateLongue(p.date, false)}, ${minusculeInitiale(seanceDe(p.id).titre)}.`;
}

const LIBELLE_ETAT: Record<EtatMarqueur, string> = {
  fait: 'faite',
  prevu: 'prévue',
  decale: 'décalée ici',
  saute: 'sautée',
};

function Semaine({ jours }: { jours: readonly JourSemaine[] }) {
  return (
    <section class="semaine" aria-labelledby="semaine-titre">
      <h2 id="semaine-titre" class="aujourdhui__section">
        Cette semaine
      </h2>
      <ol class="semaine__rack">
        {jours.map((j) => {
          const nom = NOMS_JOURS[j.index];
          const details = j.vacances
            ? 'vacances'
            : j.marqueurs.length
              ? j.marqueurs.map((m) => `séance ${m.id} ${LIBELLE_ETAT[m.etat]}`).join(', ')
              : 'rien';
          return (
            <li
              key={j.date}
              class={`semaine__jour${j.aujourdhui ? ' semaine__jour--aujourdhui' : ''}${j.vacances ? ' semaine__jour--vacances' : ''}`}
              aria-label={`${nom} ${jourEtMois(j.date)}, ${details}${j.aujourdhui ? ", aujourd'hui" : ''}`}
            >
              <span class="semaine__lettre" aria-hidden="true">
                {nom.charAt(0).toUpperCase()}
              </span>
              <span class="semaine__numero num" aria-hidden="true">
                {Number(j.date.slice(8))}
              </span>
              <span class="semaine__emplacement" aria-hidden="true">
                {j.vacances ? (
                  <span class="semaine__vacances" />
                ) : (
                  j.marqueurs.slice(0, 2).map((m) => <Plate key={`${m.id}${m.etat}`} seance={m.id} taille={30} etat={m.etat} />)
                )}
              </span>
            </li>
          );
        })}
      </ol>
      <div class="semaine__rail" aria-hidden="true" />
    </section>
  );
}

function Heros({ id, etat, progression, plein, reduit }: { id: SeanceId; etat: EtatDisque; progression: number; plein: boolean; reduit: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [taille, setTaille] = useState(() => Math.round(Math.min(window.innerWidth * 1.24, 520)));
  useEffect(() => {
    const maj = (): void => setTaille(Math.round(Math.min(window.innerWidth * 1.24, 520)));
    window.addEventListener('resize', maj);
    return () => window.removeEventListener('resize', maj);
  }, []);
  // À l'ouverture, un quart de tour, puis le disque se pose : le seul mouvement non déclenché par un geste.
  useLayoutEffect(() => {
    ref.current?.animate(
      reduit ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'rotate(-90deg)' }, { transform: 'rotate(0deg)' }],
      { duration: reduit ? 120 : 900, easing: 'cubic-bezier(.15,.85,.25,1)' },
    );
  }, [id, reduit]);
  return (
    <div class="aujourdhui__heros" ref={ref} aria-hidden="true">
      <Plate seance={id} taille={taille} etat={etat} progression={progression} class={plein ? 'aujourdhui__disque' : ''} />
    </div>
  );
}

export function Aujourdhui() {
  const reduit = useMouvementReduit();
  const iso = useAujourdhui();
  const reglages = useApp((e) => e.reglages);
  const enCours = useApp((e) => e.seance);
  const journal = useApp((e) => e.journal);
  const ajustements = useApp((e) => e.ajustements);
  const vacances = reglages.vacances;

  const duJour = seancesDuJour(iso, vacances, ajustements)[0] ?? null;
  const faite = [...journal].filter((j) => j.date === iso).sort((a, b) => b.debut - a.debut)[0] ?? null;
  const prochaine = prochaineSeance(iso, vacances, ajustements);
  const enVac = enVacances(iso, vacances);

  let heros: { id: SeanceId; etat: EtatDisque; progression: number } | null = null;
  if (enCours) heros = { id: enCours.seance, etat: 'encours', progression: nbSeries(enCours) / Math.max(1, totalSeries(enCours)) };
  else if (enVac) heros = null;
  else if (faite) heros = { id: faite.seance, etat: 'fait', progression: 1 };
  else if (duJour) heros = { id: duJour.id, etat: duJour.decalee ? 'decale' : 'prevu', progression: 0 };
  const plein = heros !== null && (heros.etat === 'fait' || heros.etat === 'encours');

  const titres = (
    <>
      {/* « Dimanche » puis « 4 octobre » : le jour et le mois restent ensemble. */}
      <h1 class="aujourdhui__date">{dateLongue(iso).replace(/ (\d+(?:er)?) /, ' $1\u00a0')}</h1>
      <p class="aujourdhui__semaine">{libelleSemaine(iso, vacances)}</p>
    </>
  );

  const commencer = (id: SeanceId): void => {
    deverrouillerAudio();
    commencerSeance(id, 'complete');
    naviguer('/seance');
  };

  let bloc;
  if (enCours) {
    const s = seanceDe(enCours.seance);
    bloc = (
      <>
        <p class="jour__surtitre">Séance en cours</p>
        <h2 class="jour__titre">{s.titre}</h2>
        <p class="jour__infos">{position(etapeCourante(enCours), titreEchauffement(enCours))}</p>
        <div class="jour__actions">
          <button
            type="button"
            class="bouton bouton--principal bouton--seance bouton--plein"
            onClick={() => {
              deverrouillerAudio();
              majSeance((x) => reprendre(x, Date.now()));
              naviguer('/seance');
            }}
          >
            Reprendre la séance
          </button>
        </div>
      </>
    );
  } else if (enVac) {
    const reprise = prochaine ? `Reprise le ${dateLongue(prochaine.date, false)} avec la séance ${prochaine.id}.` : null;
    bloc = (
      <>
        <h2 class="jour__titre">Profite des vacances.</h2>
        {reprise && <p class="jour__infos">{reprise}</p>}
      </>
    );
  } else if (faite) {
    const s = seanceDe(faite.seance);
    const suite = phraseProchaine(prochaine);
    bloc = (
      <>
        <p class="jour__surtitre">{typo("Séance faite aujourd'hui")}</p>
        <h2 class="jour__titre">{s.titre}</h2>
        <p class="jour__infos num">
          {faite.duree} min, {seriesValidees(faite.series)}.
        </p>
        {suite && <p class="jour__suite">{suite}</p>}
      </>
    );
  } else if (duJour) {
    const s = seanceDe(duJour.id);
    bloc = (
      <>
        <p class="jour__surtitre">{typo(`Aujourd'hui, séance ${s.id}`)}</p>
        <h2 class="jour__titre">{s.titre}</h2>
        <p class="jour__infos">{lieuDureeExercices(s)}</p>
        <div class="jour__actions">
          <button type="button" class="bouton bouton--principal bouton--seance bouton--plein" onClick={() => commencer(s.id)}>
            Commencer la séance
          </button>
          <div class="jour__liens">
            <a
              class="jour__lien"
              href={`#/seances/${s.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                naviguer(`/seances/${s.id}`);
              }}
            >
              Voir le détail
            </a>
          </div>
        </div>
      </>
    );
  } else {
    const suite = phraseProchaine(prochaine);
    bloc = (
      <>
        <h2 class="jour__titre">{typo("Pas de séance aujourd'hui.")}</h2>
        {suite && <p class="jour__infos">{suite}</p>}
        {prochaine && (
          <div class="jour__actions">
            <button
              type="button"
              class="bouton bouton--secondaire bouton--seance"
              onClick={() => naviguer(`/seances/${prochaine.id}`)}
            >
              Voir la séance {prochaine.id}
            </button>
          </div>
        )}
      </>
    );
  }

  const recentes = dernieresSeances(journal);

  return (
    <main class="aujourdhui avec-onglets" data-seance={heros?.id ?? duJour?.id ?? prochaine?.id ?? 1}>
      <header class={`aujourdhui__entete${heros ? ' aujourdhui__entete--disque' : ''}`}>
        {heros && <Heros {...heros} plein={plein} reduit={reduit} />}
        <div class="aujourdhui__titres">{titres}</div>
        {plein && (
          <div class="aujourdhui__titres aujourdhui__titres--sur-disque" aria-hidden="true">
            {titres}
          </div>
        )}
      </header>

      <section class="jour" aria-label={typo("Aujourd'hui")}>
        {bloc}
      </section>

      <Semaine jours={semaine(iso, vacances, ajustements, journal)} />

      {recentes.length > 0 && (
        <section class="recentes" aria-labelledby="recentes-titre">
          <h2 id="recentes-titre" class="aujourdhui__section">
            Dernières séances
          </h2>
          <ul class="recentes__liste">
            {recentes.map((j) => (
              <li key={j.id} class="recentes__ligne">
                <Plate seance={j.seance} taille={40} etat="fait" />
                <span class="recentes__texte">
                  <span class="recentes__date">{dateLongue(j.date)}</span>
                  <span class="secondaire num">
                    {typo(`${j.duree} min`)}
                    {j.version === 'courte' ? ', courte' : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
