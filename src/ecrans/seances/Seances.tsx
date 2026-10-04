import { DEMOS, SEANCES, seance as seanceDe, type Exercice, type SeanceId } from '../../data/program';
import { formatDe, sousTitreCircuit } from '../../data/derive';
import { deverrouillerAudio } from '../../audio/sons';
import { dureeEnClair } from '../../logic/repos';
import { reprendre } from '../../logic/seance';
import { minusculeInitiale, quandSeance } from '../../logic/textes';
import { commencerSeance, majSeance, useApp } from '../../store/app';
import { naviguer } from '../../app/routeur';
import { IconeRetour } from '../../ui/icones';
import { Plate } from '../../ui/plate/Plate';
import { typo } from '../../ui/typo';
import './seances.css';

export function ListeSeances() {
  return (
    <main class="seances avec-onglets">
      <h1 class="ecran__titre">Séances</h1>
      <ul class="seances__liste">
        {SEANCES.map((s) => (
          <li key={s.id}>
            <a
              class="seances__ligne"
              href={`#/seances/${s.id}`}
              onClick={(ev) => {
                ev.preventDefault();
                naviguer(`/seances/${s.id}`);
              }}
            >
              <Plate seance={s.id} taille={64} etat="fait" />
              <span class="seances__texte">
                <span class="seances__titre">{s.titre}</span>
                <span class="secondaire">{quandSeance(s)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}

function LigneExercice({ ex }: { ex: Exercice }) {
  const liens = ex.mouvements.flatMap((m) => (m.demo ? [{ nom: m.nom, url: DEMOS[m.demo] }] : []));
  return (
    <li class="detail__exercice">
      <span class="detail__numero num" aria-hidden="true">
        {ex.numero}
      </span>
      <div class="detail__exercice-corps">
        <h3 class="detail__exercice-nom">
          {ex.superset ? (
            <>
              {ex.mouvements[0]?.nom}
              <span class="detail__puis"> puis, sans pause </span>
              {ex.mouvements[1]?.nom}
            </>
          ) : (
            ex.nom
          )}
        </h3>
        <p class="detail__format num">{typo(formatDe(ex, 'complete') ?? ex.format)}</p>
        <p class="secondaire">Repos {typo(dureeEnClair(ex.repos))}</p>
        {ex.note && <p class="detail__note">{typo(ex.note)}</p>}
        {liens.length > 0 && (
          <p class="detail__liens">
            {liens.map((l) => (
              <a key={l.url} class="detail__lien" href={l.url} target="_blank" rel="noopener noreferrer">
                {ex.superset ? `Voir ${minusculeInitiale(l.nom)}` : 'Voir le mouvement'}
              </a>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

export function DetailSeance({ id }: { id: SeanceId }) {
  const s = seanceDe(id);
  const enCours = useApp((e) => e.seance);
  const autre = enCours !== null && enCours.seance !== id;

  const retour = (): void => {
    if (window.history.length > 1) window.history.back();
    else naviguer('/seances', { sens: 'retour', remplacer: true });
  };

  return (
    <main class="detail avec-onglets" data-seance={id}>
      <header class="detail__entete">
        <button type="button" class="detail__retour" aria-label="Retour" onClick={retour}>
          <IconeRetour />
        </button>
        <div class="detail__disque">
          <Plate seance={id} taille={196} etat="fait" label={`Séance ${id}, ${s.titre}`} />
        </div>
        <h1 class="detail__titre">{s.titre}</h1>
        <p class="detail__meta">
          {s.lieu}, {typo(`${s.duree} min`)}
        </p>
      </header>

      <section class="detail__section">
        <h2 class="detail__h2">Rôle de la séance</h2>
        <p class="detail__lecture">{typo(s.role)}</p>
      </section>

      <section class="detail__section">
        <h2 class="detail__h2">{s.echauffement.titre}</h2>
        <ul class="detail__elements">
          {s.echauffement.elements.map((e) => (
            <li key={e.id} class="detail__element">
              <span>{typo(e.element)}</span>
              <span class="detail__dose num">{typo(e.dose)}</span>
            </li>
          ))}
        </ul>
      </section>

      {s.blocs.map((b) => (
        <section key={b.titre} class="detail__section">
          <h2 class="detail__h2">{b.titre}</h2>
          {b.sousTitre && <p class="secondaire detail__sous-titre">{typo(b.sousTitre)}</p>}
          <ol class="detail__exercices">
            {b.exercices.map((ex) => (
              <LigneExercice key={ex.id} ex={ex} />
            ))}
          </ol>
        </section>
      ))}

      {s.circuit && (
        <section class="detail__section">
          <h2 class="detail__h2">{s.circuit.titre}</h2>
          <p class="secondaire detail__sous-titre">{typo(sousTitreCircuit(s, 'complete') ?? '')}</p>
          <ul class="detail__elements">
            {s.circuit.mouvements.map((m) => (
              <li key={m.mouvement} class="detail__element">
                <span>{typo(m.mouvement)}</span>
                <span class="detail__dose num">{typo(m.dose)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div class="detail__actions">
        {autre && <p class="secondaire detail__info">La séance {enCours.seance} est en cours.</p>}
        {enCours?.seance === id ? (
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
        ) : (
          <button
            type="button"
            class="bouton bouton--principal bouton--seance bouton--plein"
            disabled={autre}
            onClick={() => {
              deverrouillerAudio();
              commencerSeance(id, 'complete');
              naviguer('/seance');
            }}
          >
            Commencer la séance
          </button>
        )}
      </div>
    </main>
  );
}

export function EnAttente({ titre }: { titre: string }) {
  return (
    <main class="seances avec-onglets">
      <h1 class="ecran__titre">{titre}</h1>
      <p class="seances__attente">Cet écran arrive à une prochaine étape.</p>
    </main>
  );
}
