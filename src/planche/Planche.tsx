import type { ComponentChildren, RefObject } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { SEANCES, seance, type SeanceId } from '../data/program';
import { IconeChevron, IconeFermer, IconeMoins, IconePlus, IconeSon, IconeSonCoupe } from '../ui/icones';
import { Plate, type EtatDisque } from '../ui/plate/Plate';
import { contraste, depuisHex, melange, ratioFr, versHex, type Rvb } from './contraste';
import { DemoExercice, DemoRepos } from './Demos';
import './planche.css';

type Theme = 'light' | 'dark';

const ETATS: { etat: EtatDisque; nom: string; progression?: number }[] = [
  { etat: 'prevu', nom: 'Prévu' },
  { etat: 'fait', nom: 'Fait' },
  { etat: 'encours', nom: 'En cours', progression: 0.4 },
  { etat: 'saute', nom: 'Sauté' },
  { etat: 'decale', nom: 'Décalé' },
];

const IDS: SeanceId[] = [1, 2, 3, 4, 5];

const BASE = ['--fond', '--surface', '--surface-2', '--encre', '--attenue', '--filet', '--focus'];
const NOMS_BASE: Record<string, string> = {
  '--fond': 'Fond',
  '--surface': 'Surface',
  '--surface-2': 'Surface 2',
  '--encre': 'Encre',
  '--attenue': 'Atténué',
  '--filet': 'Filet',
  '--focus': 'Focus',
};
const DERIVES = ['--acier-clair', '--acier', '--acier-sombre', '--s5-usine'];
const NOMS_DERIVES: Record<string, string> = {
  '--acier-clair': 'Acier clair',
  '--acier': 'Acier',
  '--acier-sombre': 'Acier sombre',
  '--s5-usine': 'Fonte usinée',
};

/** Lit les jetons réellement appliqués par la feuille de style dans ce thème. */
function useJetons(): [RefObject<HTMLDivElement>, (nom: string) => string] {
  const ref = useRef<HTMLDivElement>(null);
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  useLayoutEffect(() => {
    if (!ref.current) return;
    const cs = getComputedStyle(ref.current);
    const noms = [...BASE, ...DERIVES, '--assombri', ...IDS.flatMap((i) => [`--s${i}`, `--s${i}-texte`])];
    setValeurs(Object.fromEntries(noms.map((n) => [n, cs.getPropertyValue(n).trim()])));
  }, []);
  return [ref, (nom: string) => valeurs[nom] ?? ''];
}

function Verdict({ ratio, seuil }: { ratio: number; seuil: number }) {
  const ok = ratio >= seuil;
  return (
    <span class={`planche__verdict${ok ? '' : ' planche__verdict--ko'}`}>
      {ratioFr(ratio)} {ok ? (seuil === 3 ? 'AA, 3:1' : 'AA') : 'sous le seuil'}
    </span>
  );
}

function LigneContraste({ nom, texte, fond, seuil = 4.5 }: { nom: string; texte: Rvb; fond: Rvb; seuil?: number }) {
  return (
    <li class="planche__contraste">
      <span class="planche__echantillon" style={`color: ${versHex(texte)}; background: ${versHex(fond)}`}>
        Aa
      </span>
      <span class="planche__contraste-nom">{nom}</span>
      <Verdict ratio={contraste(texte, fond)} seuil={seuil} />
    </li>
  );
}

function Jetons() {
  const [ref, j] = useJetons();
  const pret = j('--fond') !== '';
  const hex = (n: string): Rvb => depuisHex(j(n) || '#000000');
  const assombri = parseFloat(j('--assombri') || '80') / 100;
  const jante = (i: SeanceId): Rvb => melange(hex(`--s${i}`), assombri, [0, 0, 0]);
  return (
    <div ref={ref}>
      <h3 class="planche__h3">Base</h3>
      <ul class="planche__nuancier">
        {BASE.map((n) => (
          <li key={n} class="planche__nuance">
            <span class="planche__pastille" style={`background: var(${n})`} />
            <span class="planche__nuance-nom">{NOMS_BASE[n]}</span>
            <span class="secondaire num">{j(n)}</span>
          </li>
        ))}
      </ul>
      <h3 class="planche__h3">Séances, texte et jante</h3>
      <ul class="planche__nuancier">
        {IDS.map((i) => (
          <li key={i} class="planche__nuance">
            <span class="planche__pastille planche__pastille--seance" style={`background: var(--s${i}); color: var(--s${i}-texte)`}>
              {i}
            </span>
            <span class="planche__nuance-nom">{seance(i).couleur}</span>
            <span class="secondaire num">{j(`--s${i}`)}</span>
            <span class="secondaire num">jante {pret ? versHex(jante(i)) : ''}</span>
          </li>
        ))}
      </ul>
      <h3 class="planche__h3">Dérivés</h3>
      <ul class="planche__nuancier">
        {DERIVES.map((n) => (
          <li key={n} class="planche__nuance">
            <span class="planche__pastille" style={`background: var(${n})`} />
            <span class="planche__nuance-nom">{NOMS_DERIVES[n]}</span>
            <span class="secondaire num">{j(n)}</span>
          </li>
        ))}
      </ul>
      {pret && (
        <>
          <h3 class="planche__h3">Contrastes vérifiés</h3>
          <ul class="planche__contrastes">
            <LigneContraste nom="Encre sur fond" texte={hex('--encre')} fond={hex('--fond')} />
            <LigneContraste nom="Encre sur surface 2" texte={hex('--encre')} fond={hex('--surface-2')} />
            <LigneContraste nom="Atténué sur fond" texte={hex('--attenue')} fond={hex('--fond')} />
            <LigneContraste nom="Atténué sur surface" texte={hex('--attenue')} fond={hex('--surface')} />
            <LigneContraste nom="Focus sur fond" texte={hex('--focus')} fond={hex('--fond')} seuil={3} />
            {IDS.map((i) => (
              <LigneContraste key={`t${i}`} nom={`Texte sur disque ${i}`} texte={hex(`--s${i}-texte`)} fond={hex(`--s${i}`)} />
            ))}
            {IDS.map((i) => (
              <LigneContraste
                key={`b${i}`}
                nom={`Bouton de repos, séance ${i}`}
                texte={hex(`--s${i}-texte`)}
                fond={melange(hex(`--s${i}-texte`), 0.12, hex(`--s${i}`))}
              />
            ))}
            {IDS.map((i) => (
              <LigneContraste
                key={`j${i}`}
                nom={`Jauge de repos sur jante ${i}`}
                texte={hex(`--s${i}-texte`)}
                fond={jante(i)}
                seuil={3}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Disques() {
  return (
    <div>
      <h3 class="planche__h3">Les cinq disques</h3>
      <div class="planche__rangee">
        {SEANCES.map((s) => (
          <Plate key={s.id} seance={s.id} taille={168} label={`Séance ${s.id}, ${s.titre}`} />
        ))}
      </div>

      <h3 class="planche__h3">Niveaux de détail</h3>
      <div class="planche__rangee planche__rangee--bas">
        {[24, 40, 64, 120, 200].map((t) => (
          <figure key={t} class="planche__fig">
            <Plate seance={1} taille={t} />
            <figcaption class="secondaire num">{t} px</figcaption>
          </figure>
        ))}
      </div>

      <h3 class="planche__h3">États</h3>
      <div class="planche__etats" role="table" aria-label="États des disques">
        <div role="row" class="planche__etats-ligne">
          <span role="columnheader" />
          {ETATS.map((e) => (
            <span key={e.etat} role="columnheader" class="secondaire">
              {e.nom}
            </span>
          ))}
        </div>
        {IDS.map((id) => (
          <div key={id} role="row" class="planche__etats-ligne">
            <span role="rowheader" class="secondaire num">
              {id}
            </span>
            {ETATS.map((e) => (
              <span key={e.etat} role="cell" class="planche__etat">
                <Plate seance={id} taille={56} etat={e.etat} progression={e.progression ?? 0} />
                <Plate seance={id} taille={24} etat={e.etat} progression={e.progression ?? 0} />
              </span>
            ))}
          </div>
        ))}
      </div>

      <h3 class="planche__h3">États, en grand</h3>
      <div class="planche__rangee planche__rangee--bas">
        {ETATS.map((e) => (
          <figure key={e.etat} class="planche__fig">
            <Plate seance={4} taille={132} etat={e.etat} progression={e.progression ?? 0} />
            <figcaption class="secondaire">{e.nom}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function Typographie() {
  return (
    <div class="planche__typo">
      <div class="planche__specimen">
        <span class="secondaire">Date d'accueil, Barlow Condensed 800, 64 px</span>
        <p class="planche__t-date">Dimanche 4 octobre</p>
      </div>
      <div class="planche__specimen planche__specimen--etroit">
        <span class="secondaire">Nom d'exercice, Barlow Condensed 700, 44 px, césure française</span>
        <p class="planche__t-nom" lang="fr">
          Soulevé de terre roumain
        </p>
      </div>
      <div class="planche__specimen">
        <span class="secondaire">Format, 72 px, puis 48 et 32 px pour les formats longs</span>
        <p class="planche__t-format num">4 × 6</p>
        <p class="planche__t-format planche__t-format--48 num">3 × (15 + 15)</p>
        <p class="planche__t-format planche__t-format--32 num">2 × 12 lourd + 2 × 15 léger</p>
      </div>
      <div class="planche__specimen">
        <span class="secondaire">Temps de repos, entre 64 et 104 px selon la largeur</span>
        <p class="planche__t-repos num">1:30</p>
      </div>
      <div class="planche__specimen planche__specimen--lecture">
        <span class="secondaire">Corps de texte, Barlow 17 px sur 1,45</span>
        <p>{seance(1).role}</p>
        <p class="secondaire">Mercredi en semaine chargée, 65 min</p>
      </div>
      <div class="planche__specimen">
        <span class="secondaire">Chiffres tabulaires</span>
        <p class="planche__t-chiffres num">
          60 kg <br />
          62,5 kg <br />
          111,5 kg
        </p>
      </div>
      <div class="planche__specimen" data-seance="1">
        <span class="secondaire">Boutons, rayon 14 px, 56 px en séance</span>
        <div class="planche__boutons">
          <button type="button" class="bouton bouton--principal bouton--seance">
            Commencer la séance
          </button>
          <button type="button" class="bouton bouton--secondaire bouton--seance">
            Version courte, 50 min
          </button>
        </div>
      </div>
      <div class="planche__specimen">
        <span class="secondaire">Icônes dessinées à la main</span>
        <div class="planche__icones">
          <IconeFermer />
          <IconeSon />
          <IconeSonCoupe />
          <IconeMoins />
          <IconePlus />
          <IconeChevron />
        </div>
      </div>
    </div>
  );
}

function DeuxThemes({ children }: { children: () => ComponentChildren }) {
  return (
    <div class="planche__themes">
      {(['light', 'dark'] as Theme[]).map((t) => (
        <div key={t} class="planche__theme" data-theme={t}>
          <p class="planche__theme-nom">{t === 'light' ? 'Clair, craie' : 'Sombre, ardoise'}</p>
          {children()}
        </div>
      ))}
    </div>
  );
}

export function Planche() {
  return (
    <main class="planche">
      <header class="planche__entete">
        <img class="planche__icone" src={`${import.meta.env.BASE_URL}icons/icon-192.png`} width="72" height="72" alt="" />
        <div>
          <h1 class="planche__titre">Planche de direction</h1>
          <p class="secondaire">Programme, version {__VERSION__}</p>
        </div>
      </header>
      <div class="planche__intro">
        <p>
          Cette page montre la direction graphique avant la construction des écrans. Les deux écrans du bas sont
          réels et interactifs : valide une série, laisse filer un repos jusqu'à zéro, avec le son.
        </p>
        <h2 class="planche__h3">Points à valider</h2>
        <ol class="planche__points">
          <li>
            Au repos, le moyeu en acier s'efface derrière le temps restant. Seul son relief reste. Les chiffres se lisent à
            bout de bras.
          </li>
          <li>
            Au repos, la part de jante qui reste est tracée dans la couleur du texte de la séance, sur le caoutchouc nu. Elle se
            vide dans le sens inverse des aiguilles d'une montre, et l'anneau de lettrage tourne d'un tour par minute.
          </li>
          <li>
            Dans les trois dernières secondes, la jante pulse à chaque tic. À zéro, le disque tombe. Cette chute remplace
            la pulsation du cadran de la version de référence.
          </li>
          <li>
            Sur la barre, le disque glisse, se plaque contre le précédent, rebondit de 3 px et se pose. Le rebond suit la
            courbe prévue. Appliquée à toute la glissade, cette courbe ferait traverser le disque précédent.
          </li>
          <li>Le numéro apparaît sur les disques de 56 px et plus. En dessous, il serait illisible.</li>
          <li>Icône de l'application : le disque rouge de la séance 1, vu de face.</li>
        </ol>
      </div>

      <section class="planche__section">
        <h2 class="planche__h2">Écran d'exercice</h2>
        <DemoExercice />
      </section>

      <section class="planche__section">
        <h2 class="planche__h2">Écran de repos</h2>
        <DemoRepos />
      </section>

      <section class="planche__section">
        <h2 class="planche__h2">Disques</h2>
        <DeuxThemes>{() => <Disques />}</DeuxThemes>
      </section>

      <section class="planche__section">
        <h2 class="planche__h2">Jetons</h2>
        <DeuxThemes>{() => <Jetons />}</DeuxThemes>
      </section>

      <section class="planche__section">
        <h2 class="planche__h2">Typographie et éléments</h2>
        <DeuxThemes>{() => <Typographie />}</DeuxThemes>
      </section>
    </main>
  );
}
