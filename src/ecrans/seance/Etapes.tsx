import type { ComponentChildren } from 'preact';
import type { Circuit, ElementEchauffement, SeanceId } from '../../data/program';
import { IconeCoche } from '../../ui/icones';
import { Manchon } from '../../ui/manchon/Manchon';
import { typo } from '../../ui/typo';
import './etapes.css';

/** Ligne à cocher : une touche sur la ligne coche ou décoche. */
function LigneACocher({ cochee, texte, dose, onBascule }: { cochee: boolean; texte: string; dose: string; onBascule: () => void }) {
  return (
    <li>
      <button type="button" class={`cocher${cochee ? ' cocher--cochee' : ''}`} role="checkbox" aria-checked={cochee} onClick={onBascule}>
        <span class="cocher__case" aria-hidden="true">
          {cochee && <IconeCoche taille={20} />}
        </span>
        <span class="cocher__texte">{typo(texte)}</span>
        <span class="cocher__dose num">{typo(dose)}</span>
      </button>
    </li>
  );
}

export function EtapeEchauffement({
  titre,
  elements,
  coches,
  enTete,
  onBascule,
  onCommencer,
}: {
  titre: string;
  elements: readonly ElementEchauffement[];
  coches: readonly string[];
  enTete: ComponentChildren;
  onBascule: (id: string) => void;
  onCommencer: () => void;
}) {
  return (
    <section class="etape">
      {enTete}
      <div class="etape__defilement" style="view-transition-name: etape-contenu">
        <h1 class="etape__titre" style="view-transition-name: etape-titre">
          {titre}
        </h1>
        <ul class="etape__liste">
          {elements.map((e) => (
            <LigneACocher
              key={e.id}
              cochee={coches.includes(e.id)}
              texte={e.element}
              dose={e.dose}
              onBascule={() => onBascule(e.id)}
            />
          ))}
        </ul>
      </div>
      <div class="etape__actions">
        <button type="button" class="bouton bouton--principal bouton--seance bouton--plein etape__principal" onClick={onCommencer}>
          Commencer les exercices
        </button>
      </div>
    </section>
  );
}

export function EtapeCircuit({
  seance,
  circuit,
  sousTitre,
  tours,
  total,
  coches,
  reduit,
  enTete,
  onBascule,
  onValider,
  onAnnuler,
  onPrecedent,
  onTerminer,
}: {
  seance: SeanceId;
  circuit: Circuit;
  sousTitre: string;
  tours: number;
  total: number;
  coches: readonly number[];
  reduit: boolean;
  enTete: ComponentChildren;
  onBascule: (i: number) => void;
  onValider: () => void;
  onAnnuler: () => void;
  onPrecedent: () => void;
  onTerminer: () => void;
}) {
  const fini = tours >= total;
  return (
    <section class="etape">
      {enTete}
      <div class="etape__defilement" style="view-transition-name: etape-contenu">
        <p class="etape__reperage">{typo(sousTitre)}</p>
        <h1 class="etape__titre" style="view-transition-name: etape-titre">
          {circuit.titre}
        </h1>
        <p class="etape__tour num">{fini ? 'Circuit terminé' : `Tour ${tours + 1} sur ${total}`}</p>
        <div class="etape__manchon">
          <Manchon seance={seance} total={total} faites={tours} reduit={reduit} label={`${tours} tour${tours > 1 ? 's' : ''} sur ${total}`} />
        </div>
        {!fini && (
          <ul class="etape__liste">
            {circuit.mouvements.map((m, i) => (
              <LigneACocher
                key={m.mouvement}
                cochee={coches.includes(i)}
                texte={m.mouvement}
                dose={m.dose}
                onBascule={() => onBascule(i)}
              />
            ))}
          </ul>
        )}
      </div>
      <div class="etape__actions">
        <button
          type="button"
          class="bouton bouton--principal bouton--seance bouton--plein etape__principal"
          onClick={fini ? onTerminer : onValider}
        >
          {fini ? 'Terminer la séance' : `Valider le tour ${tours + 1}`}
        </button>
        <div class="exercice__navigation">
          <button type="button" class="exercice__nav" onClick={onPrecedent}>
            Étape précédente
          </button>
          <button type="button" class="exercice__nav" disabled={tours === 0} onClick={onAnnuler}>
            Annuler le dernier tour
          </button>
          <span />
        </div>
      </div>
    </section>
  );
}
