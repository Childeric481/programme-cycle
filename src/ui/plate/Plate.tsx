import { useId } from 'preact/hooks';
import { seance, type SeanceId } from '../../data/program';
import {
  anneau,
  cercle,
  R,
  R_ALESAGE,
  R_BANDE_EXT,
  R_BANDE_INT,
  R_JANTE,
  R_LETTRAGE,
  R_LEVRE,
  R_MOYEU,
} from './geometrie';
import { grainCaoutchouc, grainFonte, TUILE } from './grain';
import './plate.css';

export type EtatDisque = 'prevu' | 'fait' | 'encours' | 'saute' | 'decale';
export type Detail = 'pastille' | 'jante' | 'complet';

/** 24 px : pastille et moyeu. 40 à 64 px : jante en plus. 120 px et plus : lettrage et relief. */
export function detailPour(taille: number): Detail {
  if (taille < 40) return 'pastille';
  if (taille < 120) return 'jante';
  return 'complet';
}

export interface PlateProps {
  seance: SeanceId;
  taille: number;
  etat?: EtatDisque;
  /** 0 à 1. État « en cours » : part de la jante colorée. */
  progression?: number;
  detail?: Detail;
  /** Couches séparées (écran de repos) : le lettrage et le numéro sont dessinés à part. */
  sansLettrage?: boolean;
  sansNumero?: boolean;
  /** Jante neutre : l'écran de repos dessine la jauge dans une couche à part. */
  janteJauge?: boolean;
  /** « fantome » : moyeu réduit à son relief, sans acier ni alésage (le temps de repos s'affiche au centre). */
  moyeu?: 'acier' | 'fantome';
  label?: string;
  class?: string;
}

/** Corps typographique du lettrage, en unités du disque. */
const CORPS_LETTRAGE = 12.5;
const HAUTEUR_CAPITALE = 0.7;

/** Chemins du lettrage : arc du haut (sens horaire) et arc du bas (sens inverse, texte à l'endroit). */
function CheminsLettrage({ uid }: { uid: string }) {
  const demiCapitale = (CORPS_LETTRAGE * HAUTEUR_CAPITALE) / 2;
  const rHaut = R_LETTRAGE - demiCapitale;
  const rBas = R_LETTRAGE + demiCapitale;
  return (
    <defs>
      <path id={`${uid}-haut`} d={`M ${-rHaut} 0 A ${rHaut} ${rHaut} 0 0 1 ${rHaut} 0`} />
      <path id={`${uid}-bas`} d={`M ${-rBas} 0 A ${rBas} ${rBas} 0 0 0 ${rBas} 0`} />
    </defs>
  );
}

/** Textes du lettrage, dans une seule couleur : « SÉANCE 1 » d'un côté, le titre de l'autre. */
export function TextesLettrage({ id, uid, classe, decalage = 0 }: { id: SeanceId; uid: string; classe: string; decalage?: number }) {
  const titre = seance(id).titre.toLocaleUpperCase('fr');
  const espacement = titre.length > 20 ? 0.06 : 0.14;
  return (
    <g class={classe} transform={decalage ? `translate(${decalage} ${decalage})` : undefined} font-size={CORPS_LETTRAGE}>
      <text class="plate__lettrage" style="letter-spacing: 0.14em">
        <textPath href={`#${uid}-haut`} startOffset="50%" text-anchor="middle">
          {`SÉANCE ${id}`}
        </textPath>
      </text>
      <text class="plate__lettrage" style={`letter-spacing: ${espacement}em`}>
        <textPath href={`#${uid}-bas`} startOffset="50%" text-anchor="middle">
          {titre}
        </textPath>
      </text>
    </g>
  );
}

/** Couche de lettrage autonome (écran de repos : trois couches qui tournent ensemble). */
export function CoucheLettrage({ id, classe }: { id: SeanceId; classe: string }) {
  const uid = `l${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg class="plate" viewBox="-100 -100 200 200" aria-hidden="true">
      <CheminsLettrage uid={uid} />
      <TextesLettrage id={id} uid={uid} classe={classe} />
    </svg>
  );
}

/** Lettrage sur chemin circulaire, avec relief : trait clair côté lumière, sombre côté ombre. */
function Lettrage({ id, uid, relief, px }: { id: SeanceId; uid: string; relief: boolean; px: number }) {
  return (
    <g class="plate__couche-lettrage">
      <CheminsLettrage uid={uid} />
      {relief && <TextesLettrage id={id} uid={uid} classe="plate__relief-sombre" decalage={px} />}
      {relief && <TextesLettrage id={id} uid={uid} classe="plate__relief-clair" decalage={-px} />}
      <TextesLettrage id={id} uid={uid} classe="plate__encre" />
    </g>
  );
}

function Numero({ id, relief, px }: { id: SeanceId; relief: boolean; px: number }) {
  const n = (cls: string, dx: number) => (
    <text class={`plate__numero ${cls}`} x={dx} y={-26 + dx} text-anchor="middle" font-size="50">
      {id}
    </text>
  );
  return (
    <g>
      {relief && n('plate__relief-sombre', px)}
      {relief && n('plate__relief-clair', -px)}
      {n('plate__encre', 0)}
    </g>
  );
}

function Relief({ uid }: { uid: string }) {
  return (
    <>
      {/* Lumière fixe en haut à gauche : arête saillante claire en haut à gauche, creuse à l'inverse. */}
      <linearGradient id={`${uid}-saillant`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" class="plate__stop-clair" />
        <stop offset="0.45" class="plate__stop-clair-nul" />
        <stop offset="0.55" class="plate__stop-sombre-nul" />
        <stop offset="1" class="plate__stop-sombre" />
      </linearGradient>
      <linearGradient id={`${uid}-creux`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" class="plate__stop-sombre" />
        <stop offset="0.45" class="plate__stop-sombre-nul" />
        <stop offset="0.55" class="plate__stop-clair-nul" />
        <stop offset="1" class="plate__stop-clair" />
      </linearGradient>
      <radialGradient id={`${uid}-ombrage`} cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
        <stop offset={R_JANTE / R} stop-color="#000" stop-opacity="0" />
        <stop offset="1" stop-color="#000" stop-opacity="0.16" />
      </radialGradient>
    </>
  );
}

export function Plate({
  seance: id,
  taille,
  etat = 'fait',
  progression = 0,
  detail = detailPour(taille),
  sansLettrage = false,
  sansNumero = false,
  janteJauge = false,
  moyeu = 'acier',
  label,
  class: classe,
}: PlateProps) {
  const uid = `p${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const px = 200 / taille;
  const fonte = seance(id).couleur === 'Fonte';
  const contour = etat === 'prevu' || etat === 'decale';
  const complet = detail === 'complet';
  const pastille = detail === 'pastille';
  const rMoyeu = pastille ? 32 : R_MOYEU;
  const rAlesage = pastille ? 15 : R_ALESAGE;
  const avecNumero = !sansNumero && detail !== 'pastille' && taille >= 56;
  const tuile = TUILE * px;
  const fantome = moyeu === 'fantome';
  const rTrou = fantome ? 0 : rAlesage;
  const disqueTroue = (rExt: number): string => (fantome ? cercle(rExt) : anneau(rExt, rAlesage));

  const classes = ['plate', `plate--${etat}`, `plate--${detail}`, fonte ? 'plate--fonte' : '', classe ?? '']
    .filter(Boolean)
    .join(' ');

  const style = `--face: var(--s${id}); --face-texte: var(--s${id}-texte)`;

  if (contour) {
    return (
      <svg
        class={classes}
        viewBox="-100 -100 200 200"
        width={taille}
        height={taille}
        style={style}
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
      >
        <g class="plate__trait">
          <path class="plate__silhouette" d={cercle(R - px)} />
          {!pastille && etat === 'prevu' && <path d={cercle(R_JANTE)} />}
          {complet && etat === 'prevu' && <path d={cercle(R_BANDE_EXT)} />}
          {complet && etat === 'prevu' && <path d={cercle(R_BANDE_INT)} />}
          <path d={cercle(rMoyeu)} />
          <path d={cercle(rAlesage)} />
        </g>
        {complet && !sansLettrage && <Lettrage id={id} uid={uid} relief={false} px={px} />}
        {avecNumero && (
          <text class="plate__numero plate__numero--contour" x="0" y="-26" text-anchor="middle" font-size="50">
            {id}
          </text>
        )}
      </svg>
    );
  }

  const progres = Math.min(1, Math.max(0, progression));

  return (
    <svg
      class={classes}
      viewBox="-100 -100 200 200"
      width={taille}
      height={taille}
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        {complet && <Relief uid={uid} />}
        {complet && (
          <pattern id={`${uid}-grain`} patternUnits="userSpaceOnUse" x="-100" y="-100" width={tuile} height={tuile}>
            <image href={fonte ? grainFonte() : grainCaoutchouc()} width={tuile} height={tuile} />
          </pattern>
        )}
      </defs>

      <g class="plate__corps">
        {/* Jante et face, percées de l'alésage. */}
        {pastille ? (
          <path class="plate__face" d={disqueTroue(R)} fill-rule="evenodd" />
        ) : (
          <>
            <path
              class={janteJauge ? 'plate__piste' : 'plate__jante'}
              d={anneau(R, R_JANTE - 0.5)}
              fill-rule="evenodd"
            />
            <path class="plate__face" d={disqueTroue(R_JANTE)} fill-rule="evenodd" />
          </>
        )}

        {etat === 'encours' && !pastille && (
          <circle
            class="plate__progression"
            r={(R + R_JANTE) / 2}
            pathLength={100}
            stroke-dasharray={`${progres * 100} 100`}
            transform="rotate(-90)"
            stroke-width={R - R_JANTE - 5.2}
          />
        )}

        {complet && <path d={anneau(R, R_JANTE)} fill={`url(#${uid}-ombrage)`} fill-rule="evenodd" />}
        {complet && (
          <path class="plate__grain" d={disqueTroue(R)} fill={`url(#${uid}-grain)`} fill-rule="evenodd" />
        )}
        {complet && fonte && <path class="plate__usine" d={anneau(R_BANDE_EXT, R_BANDE_INT)} fill-rule="evenodd" />}

        {/* Moyeu en acier : deux cercles concentriques, puis l'alésage. */}
        {!fantome && <path class="plate__acier" d={anneau(rMoyeu, rAlesage)} fill-rule="evenodd" />}
        {!fantome && !pastille && <path class="plate__levre" d={anneau(R_LEVRE, rAlesage)} fill-rule="evenodd" />}

        {complet && (
          <g class="plate__aretes">
            <path d={cercle(R - px / 2)} stroke={`url(#${uid}-saillant)`} />
            <path d={cercle(R_JANTE)} stroke={`url(#${uid}-creux)`} />
            <path d={cercle(R_BANDE_EXT)} stroke={`url(#${uid}-saillant)`} />
            <path d={cercle(R_BANDE_INT)} stroke={`url(#${uid}-creux)`} />
            <path d={cercle(R_MOYEU - px / 2)} stroke={`url(#${uid}-saillant)`} />
            <path d={cercle(R_LEVRE)} stroke={`url(#${uid}-creux)`} />
            {rTrou > 0 && <path d={cercle(R_ALESAGE + px / 2)} stroke={`url(#${uid}-creux)`} />}
          </g>
        )}

        {complet && !sansLettrage && <Lettrage id={id} uid={uid} relief px={px} />}
        {avecNumero && <Numero id={id} relief={complet} px={px} />}
      </g>

      {etat === 'saute' && <line class="plate__barre" x1="-78" y1="78" x2="78" y2="-78" />}
    </svg>
  );
}
