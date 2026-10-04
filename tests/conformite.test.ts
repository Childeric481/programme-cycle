// Test de conformité : compare src/data/program.ts à la section C du document
// de référence (spec/contenu.md, copie exacte). Chaque exercice, format, repos,
// compteur, saisie, palier, lien et texte est relu depuis le document.

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CALENDRIER,
  DEMOS,
  ETAPES_TRACTION,
  REGLES,
  SEANCES,
  type CaseCalendrier,
  type ElementEchauffement,
  type Exercice,
  type Saisie,
  type Seance,
  type Volet,
} from '../src/data/program';
import { exercicesDe, formatDe } from '../src/data/derive';

const DOC = readFileSync(new URL('../spec/contenu.md', import.meta.url), 'utf8');
const LIGNES = DOC.split('\n');

// ---------------------------------------------------------------------------
// Lecture du document

const nombre = (s: string): number => Number(s.replace(',', '.'));

function section(prefixe: string): string[] {
  const debut = LIGNES.findIndex((l) => l.startsWith(prefixe));
  if (debut < 0) throw new Error(`Section introuvable : ${prefixe}`);
  const suite = LIGNES.slice(debut + 1).findIndex((l) => /^#{1,2} /.test(l));
  return suite < 0 ? LIGNES.slice(debut) : LIGNES.slice(debut, debut + 1 + suite);
}

type Item =
  | { type: 'gras'; titre: string; reste: string }
  | { type: 'tableau'; entetes: string[]; lignes: string[][] }
  | { type: 'puce'; texte: string }
  | { type: 'texte'; texte: string };

const cellules = (ligne: string): string[] =>
  ligne
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());

function items(lignes: string[]): Item[] {
  const out: Item[] = [];
  for (let i = 0; i < lignes.length; i++) {
    const l = lignes[i] ?? '';
    if (l.trim() === '' || l.startsWith('#')) continue;
    if (l.startsWith('|')) {
      const bloc: string[] = [];
      while (i < lignes.length && (lignes[i] ?? '').startsWith('|')) bloc.push(lignes[i++] ?? '');
      i--;
      const [entete, , ...corps] = bloc;
      out.push({ type: 'tableau', entetes: cellules(entete ?? ''), lignes: corps.map(cellules) });
      continue;
    }
    const gras = /^\*\*(.+?)\*\*\s*(.*)$/.exec(l);
    if (gras) {
      out.push({ type: 'gras', titre: gras[1] ?? '', reste: gras[2] ?? '' });
      continue;
    }
    if (l.startsWith('- ')) {
      out.push({ type: 'puce', texte: l.slice(2) });
      continue;
    }
    out.push({ type: 'texte', texte: l });
  }
  return out;
}

function tableauApres(liste: Item[], index: number): { entetes: string[]; lignes: string[][] } {
  const t = liste[index + 1];
  if (!t || t.type !== 'tableau') throw new Error(`Tableau attendu après l'élément ${index}`);
  return t;
}

interface VoletDoc {
  nom: string;
  contexte: string | null;
  volet: Volet | null;
  renvoi: number | null;
}

function lireVolet(puce: string): VoletDoc {
  const m = /^\*\*(.+?)\*\*(?: \((.+?)\))?\. (.*)$/.exec(puce);
  if (!m) throw new Error(`Volet illisible : ${puce}`);
  const nom = m[1] ?? '';
  const contexte = m[2] ?? null;
  const reste = m[3] ?? '';
  const renvoi = /^Même volet qu'en séance (\d)\.$/.exec(reste);
  if (renvoi) return { nom, contexte, volet: null, renvoi: Number(renvoi[1]) };
  const t = /^Intérêt : \*(.+?)\*(?: Exécution : \*(.+?)\*)?$/.exec(reste);
  if (!t) throw new Error(`Volet illisible : ${puce}`);
  const volet: Volet = t[2] === undefined ? { interet: t[1] ?? '' } : { interet: t[1] ?? '', execution: t[2] };
  return { nom, contexte, volet, renvoi: null };
}

interface SaisieDoc {
  unite: 'kg' | 'cm' | 's' | 'rép.' | 'etape';
  prefixe: string;
  qualificatif: string;
  pas: number | null;
  facultatif: boolean;
  /** « Genou-mur gauche cm, droite cm » : groupe commun, libellé par côté. */
  groupe: string | null;
}

/** Lit la colonne « Saisie » : « Hip thrust kg, pas 2,5. Sumo RDL kg, pas 2 », etc. */
function lireSaisie(cellule: string): SaisieDoc[] {
  if (cellule === '' || cellule === 'aucune') return [];
  const etape = 'Étape (sélecteur, voir C.9) + ';
  if (cellule.startsWith(etape)) {
    return [
      { unite: 'etape', prefixe: 'Étape', qualificatif: '', pas: null, facultatif: false, groupe: null },
      ...lireSaisie(cellule.slice(etape.length)),
    ];
  }
  const out: SaisieDoc[] = [];
  for (const segment of cellule.split(/\. (?=[A-ZÀ-Ý0-9])/)) {
    const champs: SaisieDoc[] = [];
    let libelleEnAttente: string | null = null;
    let groupe: string | null = null;
    let pas: number | null = null;
    let facultatif = false;
    for (const partie of segment.split(', ')) {
      const p = /^pas (\d+(?:,\d+)?)$/.exec(partie);
      if (p) {
        pas = nombre(p[1] ?? '');
        continue;
      }
      if (partie === 'facultatif') {
        facultatif = true;
        continue;
      }
      const u = /^(?:(.*) )?(kg|cm|s|rép\.)(?: (.*))?$/.exec(partie);
      if (u) {
        let prefixe = u[1] ?? libelleEnAttente ?? '';
        if (prefixe.startsWith('Genou-mur ')) {
          groupe = 'Genou-mur';
          prefixe = prefixe.slice('Genou-mur '.length);
        }
        champs.push({
          unite: u[2] as SaisieDoc['unite'],
          prefixe,
          qualificatif: u[3] ?? '',
          pas: null,
          facultatif: false,
          groupe,
        });
        libelleEnAttente = null;
        continue;
      }
      libelleEnAttente = partie;
    }
    for (const c of champs) out.push({ ...c, pas, facultatif });
  }
  return out;
}

const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Libellé attendu dans l'interface, d'après D.4. */
function libelleAttendu(s: SaisieDoc, superset: boolean): string {
  if (s.unite === 'etape') return 'Étape';
  if (s.unite === 'rép.') return 'Répétitions sur ta meilleure série';
  if (s.groupe !== null) return majuscule(s.prefixe);
  if (superset) return s.prefixe;
  if (s.prefixe !== '') return s.prefixe;
  return s.qualificatif === '' ? 'Charge' : `Charge ${s.qualificatif}`;
}

function verifierSaisies(modele: readonly Saisie[], cellule: string, superset: boolean, ou: string): void {
  const doc = lireSaisie(cellule);
  expect(modele.length, `${ou} : nombre de champs`).toBe(doc.length);
  doc.forEach((d, i) => {
    const m = modele[i];
    if (!m) throw new Error(`${ou} : champ ${i} manquant`);
    expect(m.label, `${ou} : libellé du champ ${i}`).toBe(libelleAttendu(d, superset));
    switch (d.unite) {
      case 'etape':
        expect(m.kind, ou).toBe('etape');
        if (m.kind === 'etape') expect(m.options, ou).toEqual(ETAPES_TRACTION);
        break;
      case 'kg':
        expect(m.kind, ou).toBe('charge');
        if (m.kind === 'charge') expect(m.pas, `${ou} : pas`).toBe(d.pas);
        break;
      case 'rép.':
        expect(m.kind, ou).toBe('reps');
        if (m.kind === 'reps') expect(m.pas, `${ou} : pas`).toBe(d.pas ?? 1);
        break;
      case 's':
      case 'cm':
        expect(m.kind, ou).toBe('mesure');
        if (m.kind === 'mesure') {
          expect(m.unite, ou).toBe(d.unite);
          expect(m.pas, `${ou} : pas`).toBe(d.pas);
          expect(m.facultatif, `${ou} : facultatif`).toBe(d.facultatif);
        }
        break;
    }
  });
}

function verifierPaliers(ex: Exercice, cellule: string, ou: string): void {
  const avecPalier = ex.mouvements.flatMap((m) => m.saisies).filter((s) => s.kind === 'charge' || s.kind === 'reps');
  if (cellule === '') {
    expect(avecPalier, `${ou} : aucun palier`).toEqual([]);
    return;
  }
  const doc = cellule.split(' / ').map((p) => {
    const m = /^\+(\d+(?:,\d+)?)( rép\.)?$/.exec(p);
    if (!m) throw new Error(`${ou} : palier illisible ${p}`);
    return { valeur: nombre(m[1] ?? ''), reps: m[2] !== undefined };
  });
  expect(avecPalier.length, `${ou} : nombre de paliers`).toBe(doc.length);
  doc.forEach((d, i) => {
    const s = avecPalier[i];
    expect(s?.kind, `${ou} : type du palier ${i}`).toBe(d.reps ? 'reps' : 'charge');
    if (s && (s.kind === 'charge' || s.kind === 'reps')) expect(s.palier, `${ou} : palier ${i}`).toBe(d.valeur);
  });
}

// ---------------------------------------------------------------------------
// Lecture d'une séance du document

interface SeanceDoc {
  id: number;
  titre: string;
  entete: string;
  role: string;
  echauffementTitre: string;
  echauffement: { entetes: string[]; lignes: string[][] };
  blocs: { titre: string; sousTitre: string | undefined; lignes: string[][] }[];
  circuit: { reste: string; lignes: string[][] } | null;
  volets: VoletDoc[];
  versionCourte: string;
  courte: string[][];
}

function lireSeance(c: number): SeanceDoc {
  const lignes = section(`## C.${c} `);
  const titreLigne = /^## C\.\d Séance (\d)\. (.+)$/.exec(lignes[0] ?? '');
  if (!titreLigne) throw new Error(`Titre de séance illisible : ${lignes[0]}`);
  const liste = items(lignes);
  const premierTexte = liste.find((it) => it.type === 'texte');
  const doc: SeanceDoc = {
    id: Number(titreLigne[1]),
    titre: titreLigne[2] ?? '',
    entete: premierTexte && premierTexte.type === 'texte' ? premierTexte.texte : '',
    role: '',
    echauffementTitre: '',
    echauffement: { entetes: [], lignes: [] },
    blocs: [],
    circuit: null,
    volets: [],
    versionCourte: '',
    courte: [],
  };
  liste.forEach((it, i) => {
    if (it.type !== 'gras') return;
    if (it.titre === 'Rôle de la séance.') {
      doc.role = it.reste;
    } else if (it.titre === 'Échauffement' || it.titre === 'Mise en route') {
      doc.echauffementTitre = it.titre;
      doc.echauffement = tableauApres(liste, i);
    } else if (it.titre === 'Volets') {
      for (let j = i + 1; j < liste.length; j++) {
        const p = liste[j];
        if (!p || p.type !== 'puce') break;
        doc.volets.push(lireVolet(p.texte));
      }
    } else if (it.titre === 'Version courte.') {
      doc.versionCourte = it.reste;
      doc.courte = tableauApres(liste, i).lignes;
    } else if (it.titre === 'Circuit abdos.') {
      doc.circuit = { reste: it.reste, lignes: tableauApres(liste, i).lignes };
    } else {
      const t = tableauApres(liste, i);
      expect(t.entetes, `Bloc ${it.titre}`).toEqual([
        '#', 'Exercice', 'Format', 'Repos', 'Compteur', 'Saisie', 'Palier', 'Démo', 'Note',
      ]);
      const sousTitre = /^Sous-titre(?: du bloc)? : (.*)$/.exec(it.reste);
      doc.blocs.push({ titre: it.titre.replace(/\.$/, ''), sousTitre: sousTitre?.[1], lignes: t.lignes });
    }
  });
  return doc;
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

function trouverVoletModele(s: Seance, v: VoletDoc): Volet | undefined {
  if (v.contexte === 'échauffement' || v.contexte === 'mise en route') {
    const el = s.echauffement.elements.find((e) => e.element.toLowerCase().includes(v.nom.toLowerCase()));
    return el?.volet;
  }
  if (s.circuit && v.nom === s.circuit.titre) return s.circuit.volet;
  // « Sprints 30 m » désigne l'exercice « Sprints 30 m, départ debout ».
  return exercicesDe(s).find((e) => e.nom === v.nom || e.nom.startsWith(`${v.nom}, `))?.volet;
}

const SEANCES_DOC = [2, 3, 4, 5, 6].map(lireSeance);

// ---------------------------------------------------------------------------

describe('C.1 Structure et calendrier', () => {
  const lignes = items(section('## C.1 '));
  const tableaux = lignes.filter((i): i is Extract<Item, { type: 'tableau' }> => i.type === 'tableau');

  it('calendrier de référence', () => {
    const cal = tableaux[0];
    expect(cal?.entetes).toEqual(['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']);
    const lire = (c: string): CaseCalendrier => {
      const m = /^\*\*Séance (\d)\*\*$/.exec(c);
      return m ? (Number(m[1]) as CaseCalendrier) : (c as CaseCalendrier);
    };
    expect(cal?.lignes[0]?.[0]).toBe('Semaine chargée');
    expect(cal?.lignes[0]?.slice(1).map(lire)).toEqual(CALENDRIER.chargee);
    expect(cal?.lignes[1]?.[0]).toBe('Semaine tranquille');
    expect(cal?.lignes[1]?.slice(1).map(lire)).toEqual(CALENDRIER.tranquille);
  });

  it('titres, lieux, durées, couleurs', () => {
    const t = tableaux[1];
    expect(t?.entetes).toEqual(['Séance', 'Titre', 'Lieu', 'Durée', 'Couleur']);
    expect(t?.lignes.length).toBe(5);
    t?.lignes.forEach((l, i) => {
      const s = SEANCES[i];
      expect(l).toEqual([String(s?.id), s?.titre, s?.lieu, `${s?.duree} min`, s?.couleur]);
    });
  });

  it('demande nerveuse', () => {
    expect(DOC).toContain('Séances à forte demande nerveuse : 1, 3 et 5. Séances à faible demande : 2 et 4.');
    expect(SEANCES.filter((s) => s.demande === 'forte').map((s) => s.id)).toEqual([1, 3, 5]);
    expect(SEANCES.filter((s) => s.demande === 'faible').map((s) => s.id)).toEqual([2, 4]);
  });

  it('chaque séance tombe sur sa case du calendrier', () => {
    for (const s of SEANCES) expect(CALENDRIER[s.semaine][s.jour]).toBe(s.id);
  });
});

describe.each(SEANCES_DOC)('Séance $id', (doc) => {
  const s = SEANCES.find((x) => x.id === doc.id);
  if (!s) throw new Error(`Séance ${doc.id} absente du modèle`);
  const exercices = exercicesDe(s);

  it('titre, semaine, jour, lieu, durée', () => {
    expect(s.titre).toBe(doc.titre);
    const semaine = s.semaine === 'chargee' ? 'chargée' : 'tranquille';
    expect(doc.entete).toBe(`Semaine ${semaine}, ${JOURS[s.jour]}. ${s.lieu}. ${s.duree} min.`);
  });

  it('rôle de la séance', () => {
    expect(s.role).toBe(doc.role);
  });

  it('échauffement : éléments, doses, saisies', () => {
    expect(s.echauffement.titre).toBe(doc.echauffementTitre);
    expect(s.echauffement.elements.length).toBe(doc.echauffement.lignes.length);
    doc.echauffement.lignes.forEach((l, i) => {
      const el: ElementEchauffement | undefined = s.echauffement.elements[i];
      if (!el) throw new Error(`Élément ${i} manquant`);
      expect(el.element).toBe(l[0]);
      expect(el.dose).toBe(l[1]);
      verifierSaisies(el.saisies ?? [], l[2] ?? '', false, el.element);
    });
  });

  it('blocs : titres et sous-titres', () => {
    expect(s.blocs.map((b) => b.titre)).toEqual(doc.blocs.map((b) => b.titre));
    expect(s.blocs.map((b) => b.sousTitre)).toEqual(doc.blocs.map((b) => b.sousTitre));
  });

  it('exercices : numéro, nom, format, repos, compteur, saisie, palier, démo, note', () => {
    const lignes = doc.blocs.flatMap((b) => b.lignes);
    expect(exercices.length).toBe(lignes.length);
    lignes.forEach((l, i) => {
      const ex = exercices[i];
      if (!ex) throw new Error(`Exercice ${i} manquant`);
      const [numero, nom, format, repos, compteur, saisie, palier, demo, note] = l;
      const ou = `S${s.id} #${numero} ${ex.nom}`;
      expect(ex.numero, ou).toBe(Number(numero));
      expect(ex.superset ? `${ex.nom} (superset)` : ex.nom, ou).toBe(nom);
      if (ex.superset) {
        expect(ex.mouvements.length, ou).toBe(2);
        expect(ex.mouvements.map((m) => m.nom).join(' puis '), ou).toBe(ex.nom);
      } else {
        expect(ex.mouvements.map((m) => m.nom), ou).toEqual([ex.nom]);
      }
      expect(ex.format, ou).toBe(format);
      expect(ex.repos, ou).toBe(Number(repos));
      expect(ex.compteur, ou).toBe(Number(compteur));
      verifierSaisies(ex.mouvements.flatMap((m) => m.saisies), saisie ?? '', ex.superset, ou);
      verifierPaliers(ex, palier ?? '', ou);
      const demos = demo === 'aucune' ? [] : (demo ?? '').split(', ');
      expect(ex.mouvements.flatMap((m) => (m.demo ? [m.demo] : [])), ou).toEqual(demos);
      expect(ex.note ?? '', ou).toBe(note);
    });
  });

  it('circuit abdos', () => {
    if (!doc.circuit) {
      expect(s.circuit).toBeUndefined();
      return;
    }
    const c = s.circuit;
    if (!c) throw new Error('Circuit absent du modèle');
    const sousTitre = /^Sous-titre : (.+?\.) /.exec(doc.circuit.reste);
    expect(c.sousTitre).toBe(sousTitre?.[1]);
    const compteur = /Compteur de (\d+) tours, repos (\d+) s entre les tours\./.exec(doc.circuit.reste);
    expect(c.tours).toBe(Number(compteur?.[1]));
    expect(c.repos).toBe(Number(compteur?.[2]));
    expect(c.mouvements.map((m) => [m.mouvement, m.dose])).toEqual(doc.circuit.lignes);
  });

  it('volets « Pourquoi »', () => {
    for (const v of doc.volets) {
      const attendu = v.renvoi === null ? v.volet : SEANCES_DOC.find((d) => d.id === v.renvoi)?.volets.find((x) => x.nom === v.nom)?.volet;
      expect(attendu, `${v.nom} : volet de référence`).toBeTruthy();
      expect(trouverVoletModele(s, v), `${v.nom}`).toEqual(attendu);
    }
    // Aucun volet en plus de ceux du document.
    const echauffementAvecVolet = s.echauffement.elements.filter((e) => e.volet).length;
    const echauffementDoc = doc.volets.filter((v) => v.contexte !== null).length;
    expect(echauffementAvecVolet).toBe(echauffementDoc);
    const exercicesDoc = doc.volets.filter((v) => v.contexte === null).length;
    expect(exercices.length + (s.circuit ? 1 : 0)).toBe(exercicesDoc);
  });

  it('version courte : texte et compteurs', () => {
    expect(s.versionCourte).toBe(doc.versionCourte);
    const attendues = doc.courte;
    expect(attendues.length).toBe(exercices.length + (s.circuit ? 1 : 0));
    attendues.forEach((l, i) => {
      const [nom, complet, court] = l;
      if (s.circuit && i === exercices.length) {
        expect(nom).toBe(s.circuit.titre);
        expect(complet).toBe(`${s.circuit.tours} tours`);
        expect(court).toBe(`${s.circuit.toursCourt} tours`);
        return;
      }
      const ex = exercices[i];
      if (!ex) throw new Error(`Exercice ${i} manquant`);
      const ou = `S${s.id} ${ex.nom}`;
      expect(ex.nom.split(/[ ,]+/)[0], ou).toBe((nom ?? '').split(/[ ,]+/)[0]);
      expect(ex.compteur, ou).toBe(Number.parseInt(complet ?? '', 10));
      expect(ex.compteurCourt, ou).toBe(court === 'supprimé' ? null : Number.parseInt(court ?? '', 10));
    });
  });
});

describe('C.6 à C.7 Formats et durées des versions courtes', () => {
  it('formats recalculés', () => {
    expect(DOC).toContain('Une version courte affiche les formats recalculés (« 3 × 6 » au lieu de « 4 × 6 »).');
    const squat = exercicesDe(SEANCES[0]!).find((e) => e.id === 's1-squat')!;
    expect(formatDe(squat, 'courte')).toBe('3 × 6');
    const bucheron = /Pour le tirage bûcheron, le format court est « (.+?) »\./.exec(DOC)?.[1];
    const row = exercicesDe(SEANCES[1]!).find((e) => e.id === 's2-row')!;
    expect(formatDe(row, 'courte')).toBe(bucheron);
    for (const s of SEANCES) {
      for (const ex of exercicesDe(s)) {
        if (ex.compteurCourt === null || ex.formatCourt !== undefined) continue;
        expect(ex.format.startsWith(`${ex.compteur} × `), ex.nom).toBe(true);
      }
    }
  });

  it('durées affichées sur le bouton de version courte', () => {
    const c7 = section('## C.7 ').join('\n');
    const durees = [...c7.matchAll(/[Ss]éance (\d), (\d+) min/g)].map((m) => [Number(m[1]), Number(m[2])]);
    expect(durees).toEqual(SEANCES.map((s) => [s.id, s.dureeCourte]));
  });
});

describe('C.8 Liens de démonstration', () => {
  it('chaque clé et chaque adresse', () => {
    const t = items(section('## C.8 ')).find((i) => i.type === 'tableau');
    if (!t || t.type !== 'tableau') throw new Error('Tableau des liens introuvable');
    expect(t.entetes).toEqual(['Clé', 'Adresse']);
    expect(Object.entries(DEMOS)).toEqual(t.lignes.map((l) => [l[0], l[1]]));
  });

  it('chaque clé est utilisée', () => {
    const utilisees = new Set(SEANCES.flatMap((s) => exercicesDe(s).flatMap((e) => e.mouvements.map((m) => m.demo))));
    for (const cle of Object.keys(DEMOS)) expect(utilisees.has(cle as never), cle).toBe(true);
  });
});

describe('C.9 Onglet Règles', () => {
  const lignes = section('## C.9 ');
  type SectionDoc = { titre: string; reste: string; etapes: string[]; tableau: string[][] | null; notes: string[] };
  const sections: SectionDoc[] = [];
  const liste = items(lignes);
  liste.forEach((it) => {
    if (it.type === 'gras') {
      sections.push({ titre: it.titre.replace(/\.$/, ''), reste: it.reste, etapes: [], tableau: null, notes: [] });
      return;
    }
    const courante = sections[sections.length - 1];
    if (!courante) return;
    if (it.type === 'tableau') courante.tableau = [it.entetes, ...it.lignes];
    else if (it.type === 'texte') {
      const etape = /^\d+\. \*(.+)\*$/.exec(it.texte);
      if (etape) courante.etapes.push(etape[1] ?? '');
      else courante.notes.push(it.texte);
    }
  });

  it('sections dans l\'ordre, textes tels quels', () => {
    expect(REGLES.map((r) => r.titre)).toEqual(sections.map((s) => s.titre));
    REGLES.forEach((r, i) => {
      const d = sections[i]!;
      const attendus: unknown[] = [];
      let reste = d.reste;
      if (reste.startsWith('Le tableau de C.1, puis : ')) {
        attendus.push({ type: 'calendrier' });
        reste = reste.slice('Le tableau de C.1, puis : '.length);
      }
      const italique = /^\*(.+)\*$/.exec(reste);
      expect(italique, `${r.titre} : texte en italique`).toBeTruthy();
      attendus.push({ type: 'texte', texte: italique?.[1] });
      if (d.etapes.length) attendus.push({ type: 'etapes', items: d.etapes });
      if (d.tableau) attendus.push({ type: 'tableau', entetes: d.tableau[0], lignes: d.tableau.slice(1) });
      expect(r.blocs, r.titre).toEqual(attendus);
    });
  });

  it('sélecteur d\'étape de traction', () => {
    const traction = sections.find((s) => s.titre === 'Progression vers la traction')!;
    const premieresPhrases = traction.etapes.map((e) => e.split('. ')[0]);
    const quatrieme = /plus une quatrième, « (.+?) »/.exec(traction.notes.join(' '))?.[1];
    expect(ETAPES_TRACTION).toEqual([...premieresPhrases, quatrieme]);
  });
});

describe('G. Vérifications', () => {
  const ex = (id: string): Exercice => {
    const e = SEANCES.flatMap((s) => exercicesDe(s)).find((x) => x.id === id);
    if (!e) throw new Error(id);
    return e;
  };

  it('compteurs clés', () => {
    expect(ex('s3-sprint30').compteur).toBe(6);
    expect(ex('s3-sprint60').compteur).toBe(3);
    expect(ex('s2-row').compteur).toBe(4);
    expect(SEANCES[3]?.circuit?.tours).toBe(3);
  });

  it('aucun pronom de première ou deuxième personne dans les volets et les règles', () => {
    const textes: string[] = [];
    const ajouter = (v?: Volet): void => {
      if (!v) return;
      textes.push(v.interet);
      if (v.execution) textes.push(v.execution);
    };
    for (const s of SEANCES) {
      s.echauffement.elements.forEach((e) => ajouter(e.volet));
      exercicesDe(s).forEach((e) => ajouter(e.volet));
      ajouter(s.circuit?.volet);
    }
    for (const r of REGLES) {
      for (const b of r.blocs) {
        if (b.type === 'texte') textes.push(b.texte);
        if (b.type === 'etapes') textes.push(...b.items);
        if (b.type === 'tableau') textes.push(...b.lignes.flat());
      }
    }
    const interdits = new Set(['je', 'me', 'moi', 'tu', 'te', 'toi', 'nous', 'vous', 'on', 'ton', 'ta', 'tes', 'mon', 'ma', 'mes', 'votre', 'vos', 'notre', 'nos']);
    for (const t of textes) {
      const mots = t.toLowerCase().split(/[^\p{L}]+/u);
      for (const m of mots) expect(interdits.has(m), `« ${m} » dans : ${t}`).toBe(false);
      expect(/(^|[^\p{L}])[jmt]'\p{L}/u.test(t.toLowerCase()), t).toBe(false);
    }
  });
});
