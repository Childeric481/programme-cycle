import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import type { SeanceId } from '../../data/program';
import { choc, tic, vibrer } from '../../audio/sons';
import {
  ajuster,
  enPause as estEnPause,
  formatDuree,
  mettreEnPause,
  relancer,
  resteDe,
  secondesAffichees,
  type EtatRepos,
} from '../../logic/repos';
import { CadranRepos } from '../../ui/repos/CadranRepos';
import { useMouvementReduit } from '../../ui/mouvement';
import { typo } from '../../ui/typo';
import './ecran-repos.css';

export interface EcranReposProps {
  seance: SeanceId;
  /** État du minuteur, conservé par la séance (persistance). */
  etat: EtatRepos;
  onEtat: (e: EtatRepos) => void;
  /** « Ensuite, série 3 sur 4. » */
  ensuite: string;
  /** Fin du repos : l'écran se ferme et la séance avance. */
  onTermine: () => void;
  /** Question de réserve, sous le chronomètre. */
  children?: ComponentChildren;
  /** Identifiant du repos en cours : l'écran reste monté d'un repos à l'autre. */
  cycle?: number;
  /** Écran construit à l'avance et caché : ni horloge, ni son. */
  dormant?: boolean;
}

type Phase = 'repos' | 'zero' | 'retard';

export function EcranRepos({ seance, etat, onEtat, ensuite, onTermine, children, cycle = 0, dormant = false }: EcranReposProps) {
  const reduit = useMouvementReduit();
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [phase, setPhase] = useState<Phase>(() => (resteDe(etat, Date.now()) <= 0 ? 'retard' : 'repos'));
  const [pulsation, setPulsation] = useState(0);
  const [chute, setChute] = useState(0);
  const [taille, setTaille] = useState(300);
  const scene = useRef<HTMLDivElement>(null);
  const derniereSeconde = useRef<number | null>(null);
  const termine = useRef(onTermine);
  termine.current = onTermine;

  // Nouveau repos sur un écran déjà monté : tout repart de zéro.
  useEffect(() => {
    const t = Date.now();
    derniereSeconde.current = null;
    setMaintenant(t);
    setPulsation(0);
    setChute(0);
    setPhase(resteDe(etat, t) <= 0 ? 'retard' : 'repos');
    // Seul le changement de repos compte ici, pas chaque mise à jour du minuteur.
  }, [cycle]);

  const reste = resteDe(etat, maintenant);
  const secondes = secondesAffichees(reste);
  const pause = estEnPause(etat);

  // Taille du disque : environ 80 % de la largeur, 340 px au plus.
  useEffect(() => {
    const el = scene.current;
    if (!el) return undefined;
    const mesurer = (): void => {
      const l = el.clientWidth;
      const h = el.clientHeight;
      setTaille(Math.round(Math.min(340, l * 0.8, h * 0.62) / 2) * 2);
    };
    mesurer();
    const ro = new ResizeObserver(mesurer);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Horloge : réveil à chaque changement de seconde, et au retour au premier plan.
  useEffect(() => {
    if (dormant || phase !== 'repos' || pause) return undefined;
    let id = 0;
    const boucle = (): void => {
      const t = Date.now();
      setMaintenant(t);
      const r = resteDe(etat, t);
      if (r > 0) id = window.setTimeout(boucle, (r % 1000 || 1000) + 4);
    };
    boucle();
    const auRetour = (): void => {
      if (document.visibilityState !== 'visible') return;
      const t = Date.now();
      // Revenue après la fin du repos : on l'annonce avant d'enchaîner.
      if (etat.fin !== null && t - etat.fin > 1500) setPhase('retard');
      setMaintenant(t);
    };
    document.addEventListener('visibilitychange', auRetour);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('visibilitychange', auRetour);
    };
  }, [etat, phase, pause, dormant]);

  // Trois dernières secondes, puis zéro.
  useEffect(() => {
    if (dormant || phase !== 'repos' || pause) return;
    const avant = derniereSeconde.current;
    derniereSeconde.current = secondes;
    if (avant === null || avant === secondes) return;
    if (secondes >= 1 && secondes <= 3) {
      tic();
      setPulsation((p) => p + 1);
    }
    if (secondes === 0) {
      choc();
      vibrer([220, 90, 220]);
      setChute((c) => c + 1);
      setPhase('zero');
    }
  }, [secondes, phase, pause, dormant]);

  useEffect(() => {
    if (dormant) return undefined;
    if (phase === 'zero') {
      const id = window.setTimeout(() => termine.current(), 900);
      return () => window.clearTimeout(id);
    }
    if (phase === 'retard') {
      const id = window.setTimeout(() => termine.current(), 3000);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [phase, dormant]);

  const retard = etat.fin !== null ? Math.max(0, Math.round((maintenant - etat.fin) / 1000)) : 0;
  const libelle = phase === 'repos' ? 'Repos' : phase === 'zero' ? "C'est reparti" : `Repos terminé il y a ${formatDuree(retard)}`;
  const actif = phase === 'repos';

  return (
    <section
      class={`repos${phase !== 'repos' ? ' repos--fini' : ''}`}
      data-seance={seance}
      style={`--face: var(--s${seance}); --face-texte: var(--s${seance}-texte)`}
      aria-label="Repos"
    >
      <p class="repos__libelle" aria-live="polite">
        {typo(libelle)}
      </p>
      <div class="repos__scene" ref={scene}>
        <div role="timer" aria-label={`Temps restant ${formatDuree(secondes)}`}>
          <CadranRepos
            seance={seance}
            taille={taille}
            duree={etat.duree}
            reste={reste}
            enPause={pause || !actif || dormant}
            temps={formatDuree(secondes)}
            pulsation={pulsation}
            chute={chute}
            reduit={reduit}
          />
        </div>
        <p class="repos__ensuite">{typo(ensuite)}</p>
        {children}
      </div>
      <div class="repos__actions">
        <div class="repos__reglages">
          <button
            type="button"
            class="bouton repos__secondaire num"
            disabled={!actif}
            onClick={() => onEtat(ajuster(etat, -15_000, Date.now()))}
          >
            −15 s
          </button>
          <button
            type="button"
            class="bouton repos__secondaire"
            disabled={!actif}
            onClick={() => onEtat(pause ? relancer(etat, Date.now()) : mettreEnPause(etat, Date.now()))}
          >
            {pause ? 'Relancer' : 'Pause'}
          </button>
          <button
            type="button"
            class="bouton repos__secondaire num"
            disabled={!actif}
            onClick={() => onEtat(ajuster(etat, 30_000, Date.now()))}
          >
            +30 s
          </button>
        </div>
        <button type="button" class="bouton bouton--seance repos__principal" onClick={() => termine.current()}>
          Reprendre
        </button>
      </div>
    </section>
  );
}

