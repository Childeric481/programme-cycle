import { useEffect, useState } from 'preact/hooks';
import { seance as seanceDe } from '../../data/program';
import { recapitulatif } from '../../logic/historique';
import { accorder, seriesValidees } from '../../logic/textes';
import { useApp } from '../../store/app';
import { naviguer } from '../../app/routeur';
import { BarreChargee } from '../../ui/barre/BarreChargee';
import { useMouvementReduit } from '../../ui/mouvement';
import { typo } from '../../ui/typo';
import './fin.css';

/** « Séance terminée » : la barre se charge, se soulève, puis le récapitulatif apparaît. */
export function FinSeance({ id }: { id: string }) {
  const reduit = useMouvementReduit();
  const entree = useApp((e) => e.journal.find((j) => j.id === id) ?? null);
  const historique = useApp((e) => e.historique);
  const [chiffres, setChiffres] = useState(false);

  useEffect(() => {
    if (!entree) naviguer('/', { remplacer: true, sens: 'retour' });
  }, [entree === null]);

  if (!entree) return null;
  const s = seanceDe(entree.seance);
  const recap = recapitulatif(historique, entree.seance, entree.date);

  return (
    <main class="fin" data-seance={entree.seance}>
      <div class="fin__scene">
        <BarreChargee seance={entree.seance} disques={entree.exercicesFaits ?? 1} reduit={reduit} onFini={() => setChiffres(true)} />
      </div>
      <div class={`fin__texte${chiffres ? ' fin__texte--visible' : ''}`}>
        <h1 class="fin__titre">Séance terminée</h1>
        <p class="fin__seance">{s.titre}</p>
        <p class="fin__resume num">
          {accorder(entree.duree, 'minute', 'minutes')}, {seriesValidees(entree.series)}.
        </p>
        {recap.length > 0 && (
          <ul class="fin__valeurs">
            {recap.map((l) =>
              l.valeurs.map((v) => (
                <li key={`${l.mouvement}-${v.label}`} class="fin__valeur">
                  <span class="fin__mouvement">{l.mouvement}</span>
                  <span class="fin__chiffre num">{typo(v.texte)}</span>
                  <span class="fin__ecart num">{v.ecart ? typo(v.ecart) : ''}</span>
                </li>
              )),
            )}
          </ul>
        )}
      </div>
      <div class="fin__actions">
        <button
          type="button"
          class="bouton bouton--principal bouton--seance bouton--plein"
          onClick={() => naviguer('/', { remplacer: true, sens: 'retour' })}
        >
          {typo("Retour à l'accueil")}
        </button>
      </div>
    </main>
  );
}
