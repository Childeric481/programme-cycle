import { useEffect, useState } from 'preact/hooks';
import { seance, type SeanceId } from '../data/program';
import { exercicesDe } from '../data/derive';
import { clic, deverrouillerAudio, reglerSon, sonActif, vibrer } from '../audio/sons';
import { demarrerRepos, formatDuree, type EtatRepos } from '../logic/repos';
import { BarreSeance } from '../ecrans/exercice/BarreSeance';
import { EcranExercice } from '../ecrans/exercice/EcranExercice';
import { EcranRepos } from '../ecrans/repos/EcranRepos';
import { CONTACT, DUREE_CHARGEMENT } from '../ui/manchon/Manchon';
import { nombreFr } from '../logic/nombres';
import { useMouvementReduit } from '../ui/mouvement';
import { Montee } from '../ui/montee/Montee';

const REPOS_DORMANT: EtatRepos = { duree: 150_000, fin: null, resteEnPause: 150_000 };

type Theme = 'light' | 'dark';

function ChoixTheme({ theme, onTheme }: { theme: Theme; onTheme: (t: Theme) => void }) {
  return (
    <div class="planche__choix" role="group" aria-label="Thème">
      {(['light', 'dark'] as const).map((t) => (
        <button key={t} type="button" class="planche__puce" aria-pressed={theme === t} onClick={() => onTheme(t)}>
          {t === 'light' ? 'Clair' : 'Sombre'}
        </button>
      ))}
    </div>
  );
}

export function DemoExercice() {
  const reduit = useMouvementReduit();
  const [theme, setTheme] = useState<Theme>('light');
  const [faites, setFaites] = useState(0);
  const [charge, setCharge] = useState(60);
  const [repos, setRepos] = useState<EtatRepos | null>(null);
  const [cycle, setCycle] = useState(0);
  const [court, setCourt] = useState(true);
  const [son, setSon] = useState(sonActif());
  const [debut] = useState(() => Date.now() - 12 * 60_000 - 34_000);
  const [maintenant, setMaintenant] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const s = seance(1);
  const exercices = exercicesDe(s);
  const ex = exercices[0];
  const suivant = exercices[1];
  if (!ex || !suivant) return null;
  const total = ex.compteur;

  const valider = (): void => {
    deverrouillerAudio();
    vibrer(15);
    clic((DUREE_CHARGEMENT * CONTACT) / 1000);
    const n = faites + 1;
    setFaites(n);
    window.setTimeout(() => {
      setRepos(demarrerRepos((court ? 10 : ex.repos) * 1000, Date.now()));
      setCycle((c) => c + 1);
    }, reduit ? 150 : 520);
  };

  const segments = [
    { rempli: 1, courant: false },
    { rempli: faites / total, courant: true },
    ...exercices.slice(1).map(() => ({ rempli: 0, courant: false })),
  ];

  return (
    <div class="planche__demo">
      <div class="planche__commandes">
        <ChoixTheme theme={theme} onTheme={setTheme} />
        <div class="planche__choix" role="group" aria-label="Durée du repos">
          <button type="button" class="planche__puce" aria-pressed={court} onClick={() => setCourt(true)}>
            Repos de 10 s
          </button>
          <button type="button" class="planche__puce" aria-pressed={!court} onClick={() => setCourt(false)}>
            Repos réel, 2 min 30
          </button>
        </div>
        <button
          type="button"
          class="planche__puce"
          onClick={() => {
            setFaites(0);
            setRepos(null);
          }}
        >
          Recommencer
        </button>
      </div>
      <div class="planche__telephone" data-theme={theme} onPointerDown={deverrouillerAudio}>
        <EcranExercice
          seance={1}
          exercice={ex}
          version="complete"
          reperage={`Exercice 1 sur ${exercices.length}`}
          faites={faites}
          total={total}
          champs={[
            {
              cle: 'charge',
              label: 'Charge',
              unite: 'kg',
              pas: 2.5,
              valeur: charge,
              rappel: `La dernière fois ${nombreFr(60, 2.5)} kg`,
            },
          ]}
          libelleSuivant="Exercice suivant"
          reduit={reduit}
          enTete={
            <BarreSeance
              segments={segments}
              ecoule={formatDuree(Math.round((maintenant - debut) / 1000))}
              son={son}
              versionCourte={false}
              onFermer={() => undefined}
              onSon={() => {
                reglerSon(!son);
                setSon(!son);
              }}
            />
          }
          onValeur={(_, v) => setCharge(v)}
          onValider={valider}
          onAnnuler={() => setFaites((f) => Math.max(0, f - 1))}
          onPrecedent={() => undefined}
          onSuivant={() => {
            setFaites(0);
            setRepos(null);
          }}
        />
        {(
          <Montee visible={repos !== null} reduit={reduit}>
            <EcranRepos
              seance={1}
              etat={repos ?? REPOS_DORMANT}
              cycle={cycle}
              dormant={repos === null}
              onEtat={setRepos}
              ensuite={faites >= total ? `Ensuite, ${suivant.nom.toLowerCase()}.` : `Ensuite, série ${faites + 1} sur ${total}.`}
              onTermine={() => setRepos(null)}
            />
          </Montee>
        )}
      </div>
    </div>
  );
}

const IDS: SeanceId[] = [1, 2, 3, 4, 5];

export function DemoRepos() {
  const [theme, setTheme] = useState<Theme>('light');
  const [id, setId] = useState<SeanceId>(2);
  const [duree, setDuree] = useState(12);
  const [repos, setRepos] = useState<EtatRepos>(() => demarrerRepos(12_000, Date.now()));
  const [cle, setCle] = useState(0);
  const [fini, setFini] = useState(false);

  const relancer = (d = duree, s = id): void => {
    setDuree(d);
    setId(s);
    setRepos(demarrerRepos(d * 1000, Date.now()));
    setCle((c) => c + 1);
    setFini(false);
  };

  return (
    <div class="planche__demo">
      <div class="planche__commandes">
        <ChoixTheme theme={theme} onTheme={setTheme} />
        <div class="planche__choix" role="group" aria-label="Séance">
          {IDS.map((s) => (
            <button key={s} type="button" class="planche__puce num" aria-pressed={id === s} onClick={() => relancer(duree, s)}>
              Séance {s}
            </button>
          ))}
        </div>
        <div class="planche__choix" role="group" aria-label="Durée">
          {[12, 90].map((d) => (
            <button key={d} type="button" class="planche__puce num" aria-pressed={duree === d} onClick={() => relancer(d)}>
              {d} s
            </button>
          ))}
        </div>
      </div>
      <div class="planche__telephone" data-theme={theme} onPointerDown={deverrouillerAudio}>
        {fini ? (
          <div class="planche__fini" data-seance={id}>
            <p>Repos terminé, la séance avance.</p>
            <button type="button" class="bouton bouton--principal bouton--seance" onClick={() => relancer()}>
              Relancer le repos
            </button>
          </div>
        ) : (
          <EcranRepos
            key={cle}
            seance={id}
            etat={repos}
            onEtat={setRepos}
            ensuite="Ensuite, série 3 sur 4."
            onTermine={() => setFini(true)}
          />
        )}
      </div>
    </div>
  );
}
