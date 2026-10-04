import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { DEMOS, type Exercice } from '../../data/program';
import { formatDe, type Version } from '../../data/derive';
import { dureeEnClair } from '../../logic/repos';
import { IconeChevron } from '../../ui/icones';
import { Manchon } from '../../ui/manchon/Manchon';
import { Saisie } from '../../ui/saisie/Saisie';
import { typo } from '../../ui/typo';
import type { SeanceId } from '../../data/program';
import './ecran-exercice.css';

export interface ChampExercice {
  cle: string;
  label: string;
  unite: string;
  pas: number;
  valeur: number | null;
  /** « La dernière fois 60 kg » ou « Première fois, note ce que tu fais. » */
  rappel: string;
}

export interface EcranExerciceProps {
  seance: SeanceId;
  exercice: Exercice;
  version: Version;
  reperage: string;
  faites: number;
  total: number;
  champs: readonly ChampExercice[];
  libelleSuivant: string;
  reduit: boolean;
  enTete: ComponentChildren;
  onValeur: (cle: string, v: number) => void;
  onValider: () => void;
  onAnnuler: () => void;
  onPrecedent: () => void;
  onSuivant: () => void;
}

/** Format en très grand, réduit par paliers pour les formats longs. */
function tailleFormat(format: string): 'grand' | 'moyen' | 'petit' {
  if (format.length <= 10) return 'grand';
  if (format.length <= 16) return 'moyen';
  return 'petit';
}

const minusculeInitiale = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

export function EcranExercice(p: EcranExerciceProps) {
  const [pourquoi, setPourquoi] = useState(false);
  const ex = p.exercice;
  const format = formatDe(ex, p.version) ?? ex.format;
  const liens = ex.mouvements.flatMap((m) => (m.demo ? [{ nom: m.nom, url: DEMOS[m.demo] }] : []));
  const toutFait = p.faites >= p.total;

  return (
    <section class="exercice" data-seance={p.seance}>
      {p.enTete}
      <div class="exercice__defilement">
        <p class="exercice__reperage">{p.reperage}</p>
        {ex.superset ? (
          <h1 class="exercice__nom" lang="fr">
            {ex.mouvements[0]?.nom}
            <span class="exercice__puis">puis, sans pause</span>
            {ex.mouvements[1]?.nom}
          </h1>
        ) : (
          <h1 class="exercice__nom" lang="fr">
            {ex.nom}
          </h1>
        )}
        <p class={`exercice__format exercice__format--${tailleFormat(format)} num`}>{typo(format)}</p>
        <p class="exercice__repos">Repos {typo(dureeEnClair(ex.repos))}</p>
        {ex.note && <p class="exercice__note">{typo(ex.note)}</p>}
        <div class="exercice__liens">
          {liens.map((l) => (
            <a key={l.url} class="exercice__lien" href={l.url} target="_blank" rel="noopener noreferrer">
              {ex.superset ? `Voir ${minusculeInitiale(l.nom)}` : 'Voir le mouvement'}
            </a>
          ))}
          <button
            type="button"
            class="exercice__lien exercice__pourquoi-bouton"
            aria-expanded={pourquoi}
            onClick={() => setPourquoi((v) => !v)}
          >
            Pourquoi
            <IconeChevron taille={20} class={pourquoi ? 'exercice__chevron--ouvert' : ''} />
          </button>
        </div>
        <div class={`exercice__volet${pourquoi ? ' exercice__volet--ouvert' : ''}`}>
          <div class="exercice__volet-interieur">
            <p>
              <strong>Intérêt.</strong> {typo(ex.volet.interet)}
            </p>
            {ex.volet.execution && (
              <p>
                <strong>Exécution.</strong> {typo(ex.volet.execution)}
              </p>
            )}
          </div>
        </div>

        <div class="exercice__charge">
          <Manchon
            seance={p.seance}
            total={p.total}
            faites={p.faites}
            reduit={p.reduit}
            label={`${p.faites} série${p.faites > 1 ? 's' : ''} validée${p.faites > 1 ? 's' : ''} sur ${p.total}`}
          />
        </div>

        <div class="exercice__champs">
          {p.champs.map((c) => (
            <div key={c.cle} class="exercice__champ">
              <Saisie label={c.label} valeur={c.valeur} unite={c.unite} pas={c.pas} onChange={(v) => p.onValeur(c.cle, v)} />
              <p class="exercice__rappel">{typo(c.rappel)}</p>
            </div>
          ))}
        </div>
      </div>

      <div class="exercice__actions">
        <button
          type="button"
          class="bouton bouton--principal bouton--seance bouton--plein exercice__valider"
          onClick={toutFait ? p.onSuivant : p.onValider}
        >
          {toutFait ? p.libelleSuivant : `Valider la série ${p.faites + 1}`}
        </button>
        <div class="exercice__navigation">
          <button type="button" class="exercice__nav" onClick={p.onPrecedent}>
            Étape précédente
          </button>
          <button type="button" class="exercice__nav" disabled={p.faites === 0} onClick={p.onAnnuler}>
            Annuler la dernière série
          </button>
          <button type="button" class="exercice__nav" onClick={p.onSuivant}>
            Étape suivante
          </button>
        </div>
      </div>
    </section>
  );
}
