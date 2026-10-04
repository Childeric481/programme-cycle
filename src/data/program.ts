// Contenu sportif. Source de vérité : section C du document de référence,
// copiée telle quelle dans spec/contenu.md.
// Contenu verrouillé : aucun texte ne se reformule, aucune série, répétition ou
// repos ne se modifie. tests/conformite.test.ts compare ce fichier au document.

export type SeanceId = 1 | 2 | 3 | 4 | 5;
export type TypeSemaine = 'chargee' | 'tranquille';
/** 0 = lundi, 6 = dimanche. */
export type JourIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Couleur = 'Rouge' | 'Bleu' | 'Jaune' | 'Vert' | 'Fonte';

export interface Volet {
  readonly interet: string;
  readonly execution?: string;
}

/** Charge en kg, avec le palier de progression proposé (D.4). */
export interface SaisieCharge {
  readonly kind: 'charge';
  readonly id: string;
  readonly label: string;
  readonly pas: number;
  readonly palier: number;
}

/** Répétitions sur la meilleure série, mouvements au poids du corps (« +1 rép. »). */
export interface SaisieReps {
  readonly kind: 'reps';
  readonly id: string;
  readonly label: string;
  readonly pas: number;
  readonly palier: number;
}

/** Mesure sans proposition de progression : temps, saut, distance genou-mur. */
export interface SaisieMesure {
  readonly kind: 'mesure';
  readonly id: string;
  readonly label: string;
  readonly unite: 's' | 'cm';
  readonly pas: number;
  readonly facultatif: boolean;
  readonly plusBasEstMieux: boolean;
}

/** Sélecteur d'étape de traction (C.9). */
export interface SaisieEtape {
  readonly kind: 'etape';
  readonly id: string;
  readonly label: string;
  readonly options: readonly string[];
}

export type Saisie = SaisieCharge | SaisieReps | SaisieMesure | SaisieEtape;

export type DemoCle =
  | 'squat' | 'ht' | 'rdl' | 'curtsy' | 'legext' | 'curl' | 'pulldown'
  | 'traction' | 'ohp' | 'row' | 'latraise' | 'oiseau' | 'bras' | 'broad'
  | 'ht4' | 'sumordl' | 'curtsy4' | 'kick45' | 'kick90' | 'abd' | 'legcurl'
  | 'calves' | 'cmj' | 'bonds' | 'zercher' | 'farmer';

export interface Mouvement {
  /** Nom du mouvement. Avec le numéro de séance, c'est la clé d'historique (D.10). */
  readonly nom: string;
  readonly saisies: readonly Saisie[];
  readonly demo: DemoCle | null;
}

export interface Exercice {
  readonly id: string;
  readonly numero: number;
  /** Nom affiché. Pour un superset : « A puis B ». */
  readonly nom: string;
  readonly superset: boolean;
  readonly mouvements: readonly Mouvement[];
  readonly format: string;
  /** Format court explicite, quand le recalcul du nombre de séries ne suffit pas. */
  readonly formatCourt?: string;
  readonly repos: number;
  readonly compteur: number;
  /** Compteur de la version courte. null : exercice supprimé. */
  readonly compteurCourt: number | null;
  readonly note?: string;
  readonly volet: Volet;
}

export interface Bloc {
  readonly titre: string;
  readonly sousTitre?: string;
  readonly exercices: readonly Exercice[];
}

export interface ElementEchauffement {
  readonly id: string;
  readonly element: string;
  readonly dose: string;
  /** Clé d'historique quand l'élément porte une saisie. */
  readonly mouvement?: string;
  readonly saisies?: readonly Saisie[];
  readonly volet?: Volet;
}

export interface MouvementCircuit {
  readonly mouvement: string;
  readonly dose: string;
}

export interface Circuit {
  readonly id: string;
  readonly titre: string;
  readonly sousTitre: string;
  readonly tours: number;
  readonly toursCourt: number;
  readonly repos: number;
  readonly mouvements: readonly MouvementCircuit[];
  readonly volet: Volet;
}

export interface Seance {
  readonly id: SeanceId;
  readonly titre: string;
  readonly lieu: 'Salle' | 'Piste';
  readonly duree: number;
  readonly dureeCourte: number;
  readonly couleur: Couleur;
  readonly semaine: TypeSemaine;
  readonly jour: JourIndex;
  readonly demande: 'forte' | 'faible';
  readonly role: string;
  readonly echauffement: {
    readonly titre: 'Échauffement' | 'Mise en route';
    readonly elements: readonly ElementEchauffement[];
  };
  readonly blocs: readonly Bloc[];
  readonly circuit?: Circuit;
  /** Texte « Version courte. » de la séance. */
  readonly versionCourte: string;
}

// ---------------------------------------------------------------------------
// Saisies

const charge = (pas: number, palier: number, label = 'Charge'): SaisieCharge => ({
  kind: 'charge',
  id: 'charge',
  label,
  pas,
  palier,
});

const REPS_MEILLEURE_SERIE = 'Répétitions sur ta meilleure série';

/** C.9 : trois étapes, plus une quatrième, « Traction complète ». */
export const ETAPES_TRACTION = [
  'Tirage vertical poulie',
  'Rowing inversé à la barre guidée, corps de plus en plus horizontal',
  'Négatives',
  'Traction complète',
] as const;

const GENOU_MUR: readonly Saisie[] = [
  { kind: 'mesure', id: 'gauche', label: 'Gauche', unite: 'cm', pas: 0.5, facultatif: false, plusBasEstMieux: false },
  { kind: 'mesure', id: 'droite', label: 'Droite', unite: 'cm', pas: 0.5, facultatif: false, plusBasEstMieux: false },
];

// ---------------------------------------------------------------------------
// Volets partagés

const VOLET_POGO: Volet = {
  interet:
    "Raideur de cheville et tendon d'Achille, le maillon qui restitue le plus d'énergie élastique en course. Coût de récupération quasi nul, ce qui permet de les placer en semaine chargée et de réveiller la cheville avant le travail lourd.",
  execution:
    "Rebonds sur place sur l'avant-pied, genoux quasi verrouillés, contact au sol le plus court possible. La hauteur importe peu, le temps de contact fait tout.",
};

const VOLET_GENOU_MUR: Volet = {
  interet:
    "Mesure et travaille la flexion dorsale de cheville. Une cheville qui ne fléchit pas empêche le tibia d'avancer sur le pied, le bassin recule et la course s'assoit. Repère : moins de 10 cm entre le gros orteil et le mur signale une cheville raide.",
  execution:
    'Pied à plat, talon au sol, genou poussé vers le mur au-dessus du petit orteil. Noter la distance en cm.',
};

// ---------------------------------------------------------------------------
// C.2 Séance 1. Bas du corps chargé

const SEANCE_1: Seance = {
  id: 1,
  titre: 'Bas du corps chargé',
  lieu: 'Salle',
  duree: 65,
  dureeCourte: 50,
  couleur: 'Rouge',
  semaine: 'chargee',
  jour: 2,
  demande: 'forte',
  role:
    'La séance qui signale au corps de conserver sa masse musculaire en période de restriction alimentaire, et qui construit la force absolue dont dépend tout le reste du programme. Si une seule séance devait survivre à une semaine catastrophique, c\'est celle-ci ou la 3.',
  echauffement: {
    titre: 'Échauffement',
    elements: [
      { id: 's1-e1', element: 'Vélo ou rameur, allure facile', dose: '5 min' },
      { id: 's1-e2', element: 'Glute bridge au sol', dose: '2 × 15' },
      { id: 's1-e3', element: 'Leg swings, avant-arrière puis latéraux', dose: '10 / jambe' },
      { id: 's1-e4', element: 'Pogo hops', dose: '3 × 20, repos 45 s', volet: VOLET_POGO },
      { id: 's1-e5', element: 'Squat barre à vide', dose: '2 × 10' },
    ],
  },
  blocs: [
    {
      titre: 'Corps de séance',
      exercices: [
        {
          id: 's1-squat',
          numero: 1,
          nom: 'Squat arrière',
          superset: false,
          mouvements: [{ nom: 'Squat arrière', saisies: [charge(2.5, 5)], demo: 'squat' }],
          format: '4 × 6',
          repos: 150,
          compteur: 4,
          compteurCourt: 3,
          note: "Garde 2 répétitions en réserve, jamais l'échec.",
          volet: {
            interet:
              'Le signal le plus fort qui existe pour conserver du muscle en période de restriction alimentaire. Il construit quadriceps et fessiers ensemble, avec la plus grosse charge du programme.',
            execution:
              "Réserve de 2 à 3 répétitions, jamais l'échec. 1 à 2 s de réarmement debout entre chaque répétition.",
          },
        },
        {
          id: 's1-ht',
          numero: 2,
          nom: 'Hip thrust barre',
          superset: false,
          mouvements: [{ nom: 'Hip thrust barre', saisies: [charge(2.5, 5)], demo: 'ht' }],
          format: '4 × 8',
          repos: 120,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              'Charge le fessier en extension complète de hanche, exactement là où le squat le sollicite peu. Les deux sont complémentaires, pas redondants.',
            execution: '1 s de serrage en haut, bassin aligné aux épaules, menton rentré, côtes basses.',
          },
        },
        {
          id: 's1-rdl',
          numero: 3,
          nom: 'Soulevé de terre roumain',
          superset: false,
          mouvements: [{ nom: 'Soulevé de terre roumain', saisies: [charge(2, 2)], demo: 'rdl' }],
          format: '3 × 8',
          repos: 120,
          compteur: 3,
          compteurCourt: 2,
          note: '3 secondes à la descente.',
          volet: {
            interet:
              "La charnière de hanche. Ischios chargés en position d'allongement, chaîne postérieure entière du mollet aux érecteurs.",
            execution:
              "3 s à la descente. Dos neutre, genoux légèrement fléchis, haltères qui frôlent les jambes. C'est un mouvement de hanche, pas de dos.",
          },
        },
        {
          id: 's1-fentes',
          numero: 4,
          nom: 'Fentes croisées haltères',
          superset: false,
          mouvements: [{ nom: 'Fentes croisées haltères', saisies: [charge(2, 2)], demo: 'curtsy' }],
          format: '3 × 10 / jambe',
          repos: 90,
          compteur: 3,
          compteurCourt: 2,
          volet: {
            interet:
              "Unilatéral chargé. La jambe arrière qui croise en diagonale met l'accent sur le fessier, grand et moyen, et révèle l'écart entre le côté fort et le côté faible, que le squat masque.",
            execution:
              "Pas arrière en diagonale derrière la jambe d'appui, genou avant aligné sur le pied, buste droit. Poussée dans le talon avant pour remonter.",
          },
        },
        {
          id: 's1-legext',
          numero: 5,
          nom: 'Leg extension',
          superset: false,
          mouvements: [{ nom: 'Leg extension', saisies: [charge(2.5, 5)], demo: 'legext' }],
          format: '3 × 12',
          repos: 60,
          compteur: 3,
          compteurCourt: null,
          volet: {
            interet:
              "Isole le quadriceps près de l'extension complète, là où le squat le charge le moins. Renforce aussi le tendon rotulien, sollicité par les sauts et le sprint.",
            execution: '1 s de contraction en haut, 2 s à la descente, dos collé au dossier.',
          },
        },
        {
          id: 's1-curl',
          numero: 6,
          nom: 'Curl ischios machine',
          superset: false,
          mouvements: [{ nom: 'Curl ischios machine', saisies: [charge(2.5, 5)], demo: 'curl' }],
          format: '3 × 10',
          repos: 90,
          compteur: 3,
          compteurCourt: 2,
          volet: {
            interet:
              "L'ischio a deux fonctions, hanche et genou. Le soulevé de terre roumain ne travaille que la première. Le curl comble le trou, et c'est l'assurance anti-claquage quand il y a du sprint dans le cycle.",
            execution: '2 s à la descente.',
          },
        },
        {
          id: 's1-tirage',
          numero: 7,
          nom: 'Tirage vertical poulie',
          superset: false,
          mouvements: [{ nom: 'Tirage vertical poulie', saisies: [charge(2.5, 2.5)], demo: 'pulldown' }],
          format: '4 × 10',
          repos: 90,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Premier des trois blocs de dos du cycle, les deux autres étant en séance 2. C'est ce cumul régulier qui construit le dos, pas une séance isolée. Ce tirage sert aussi de base à la future traction.",
            execution: 'Poitrine vers la barre, épaules basses et loin des oreilles, aucun élan du buste.',
          },
        },
      ],
    },
  ],
  versionCourte:
    'Échauffement complet. Leg extension supprimée. Une série de moins sur chaque autre exercice.',
};

// ---------------------------------------------------------------------------
// C.3 Séance 2. Haut du corps complet

const SEANCE_2: Seance = {
  id: 2,
  titre: 'Haut du corps complet',
  lieu: 'Salle',
  duree: 55,
  dureeCourte: 45,
  couleur: 'Bleu',
  semaine: 'chargee',
  jour: 3,
  demande: 'faible',
  role:
    "La seule séance entièrement dédiée au haut du corps. C'est elle qui construit les épaules et le dos, donc directement la silhouette recherchée. Structure en quatre patterns fondamentaux : tirage vertical, poussée verticale, poussée horizontale, tirage horizontal. Puis l'isolation en fin. Rien à ajouter, rien à retirer.",
  echauffement: {
    titre: 'Échauffement',
    elements: [
      { id: 's2-e1', element: 'Rameur, allure facile', dose: '5 min' },
      { id: 's2-e2', element: 'Cercles de bras, wall slides, cat-cow', dose: '10 chacun' },
      { id: 's2-e3', element: 'Band pull-apart', dose: '2 × 15' },
    ],
  },
  blocs: [
    {
      titre: 'Corps de séance',
      exercices: [
        {
          id: 's2-tractions',
          numero: 1,
          nom: 'Tractions, variante en cours',
          superset: false,
          mouvements: [
            {
              nom: 'Tractions, variante en cours',
              saisies: [
                { kind: 'etape', id: 'etape', label: 'Étape', options: ETAPES_TRACTION },
                { kind: 'reps', id: 'reps', label: REPS_MEILLEURE_SERIE, pas: 1, palier: 1 },
              ],
              demo: 'traction',
            },
          ],
          format: '4 × 6-8',
          repos: 120,
          compteur: 4,
          compteurCourt: 3,
          note: 'Arrêt 1 à 2 répétitions avant que la forme casse.',
          volet: {
            interet:
              'Le travail de traction proprement dit. La séance 1 charge le même pattern à la poulie, où la charge se règle au kilo près. Ici il se travaille au poids du corps, dans la position réelle. Deux angles complémentaires sur un même mouvement, ce qui accélère nettement l\'arrivée de la première traction complète.',
            execution:
              "La variante et le palier sont fixés en amont de la séance. Chaque série s'arrête 1 à 2 répétitions avant la perte de qualité technique.",
          },
        },
        {
          id: 's2-ohp',
          numero: 2,
          nom: 'Développé militaire debout, haltères',
          superset: false,
          mouvements: [
            { nom: 'Développé militaire debout, haltères', saisies: [charge(1, 1, 'Charge par haltère')], demo: 'ohp' },
          ],
          format: '4 × 8',
          repos: 120,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Force au-dessus de la tête, deltoïde antérieur et latéral. La version debout supprime le dossier : plus rien ne permet de cambrer pour tricher, et le tronc doit stabiliser la charge à chaque répétition. Le mouvement devient global au lieu de rester local à l'épaule.",
            execution: 'Côtes basses, fessiers serrés, 1 s de réarmement entre les répétitions.',
          },
        },
        {
          id: 's2-pompes',
          numero: 3,
          nom: 'Pompes',
          superset: false,
          mouvements: [
            {
              nom: 'Pompes',
              saisies: [{ kind: 'reps', id: 'reps', label: REPS_MEILLEURE_SERIE, pas: 1, palier: 1 }],
              demo: null,
            },
          ],
          format: '3 × échec',
          repos: 90,
          compteur: 3,
          compteurCourt: 2,
          note: "Chaque série jusqu'au moment où la forme casse.",
          volet: {
            interet: 'La poussée horizontale, pectoraux et triceps. Au poids du corps, donc directement transférable.',
            execution:
              "Inclinées sur un banc si besoin, inclinaison réduite au fil des semaines jusqu'au sol. Chaque série s'arrête quand la forme casse : bassin qui s'affaisse ou amplitude qui raccourcit.",
          },
        },
        {
          id: 's2-row',
          numero: 4,
          nom: 'Tirage bûcheron, un bras',
          superset: false,
          mouvements: [
            { nom: 'Tirage bûcheron, un bras', saisies: [charge(2, 2, 'Charge des séries lourdes')], demo: 'row' },
          ],
          format: '2 × 12 lourd + 2 × 15 léger',
          formatCourt: '2 × 12 lourd + 1 × 15 léger',
          repos: 90,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              'Épaisseur de dos, là où le tirage vertical donne la largeur. Unilatéral, donc il empêche le côté fort de compenser le côté faible.',
            execution:
              'Deux séries lourdes de 12, puis deux séries plus légères de 15. Genou et main en appui sur le banc, dos plat, coude qui remonte le long du corps vers la hanche.',
          },
        },
        {
          id: 's2-epaules',
          numero: 5,
          nom: 'Élévations latérales puis Oiseau',
          superset: true,
          mouvements: [
            { nom: 'Élévations latérales', saisies: [charge(1, 1, 'Élévations')], demo: 'latraise' },
            { nom: 'Oiseau', saisies: [charge(1, 1, 'Oiseau')], demo: 'oiseau' },
          ],
          format: '3 × (15 + 15)',
          repos: 60,
          compteur: 3,
          compteurCourt: 3,
          volet: {
            interet:
              "Le deltoïde latéral donne la largeur d'épaule, le postérieur protège l'articulation et corrige la posture. Deux faisceaux différents, donc le superset est légitime : pendant que l'un travaille, l'autre récupère.",
            execution:
              "Élévations : charge légère, coudes souples, montée à hauteur d'épaule sans balancer. Oiseau : buste penché à l'horizontale, dos plat, haltères écartés vers l'extérieur coudes légèrement fléchis, 1 s de contraction en haut.",
          },
        },
        {
          id: 's2-bras',
          numero: 6,
          nom: 'Curl biceps poulie puis Extension triceps poulie',
          superset: true,
          mouvements: [
            { nom: 'Curl biceps poulie', saisies: [charge(2.5, 2.5, 'Curl')], demo: 'bras' },
            { nom: 'Extension triceps poulie', saisies: [charge(2.5, 2.5, 'Extension')], demo: null },
          ],
          format: '3 × (12 + 12)',
          repos: 60,
          compteur: 3,
          compteurCourt: 3,
          volet: {
            interet:
              'Agoniste et antagoniste : pendant que le biceps travaille, le triceps récupère, donc le superset est légitime. Les bras contribuent peu à la performance et beaucoup au rendu visuel. Placés en fin de séance, ils ne coûtent rien au reste du travail.',
            execution: 'Coudes fixes le long du corps sur les deux mouvements, aucun élan du buste.',
          },
        },
      ],
    },
  ],
  versionCourte:
    'Échauffement complet. Une série de moins sur les quatre premiers exercices. Supersets conservés en entier.',
};

// ---------------------------------------------------------------------------
// C.4 Séance 3. Sprint

const SEANCE_3: Seance = {
  id: 3,
  titre: 'Sprint',
  lieu: 'Piste',
  duree: 70,
  dureeCourte: 50,
  couleur: 'Jaune',
  semaine: 'tranquille',
  jour: 1,
  demande: 'forte',
  role:
    "Explosivité et filière anaérobie alactique, c'est-à-dire l'effort maximal de moins de dix secondes. La seule qualité que le métier peut réclamer sans préavis. C'est aussi la séance qui construit le plus de densité osseuse et de raideur tendineuse, et celle qui donne la silhouette athlétique. Elle ne se saute jamais.",
  echauffement: {
    titre: 'Mise en route',
    elements: [
      { id: 's3-e1', element: 'Footing très souple', dose: '6 min' },
      {
        id: 's3-e2',
        element: 'Cheville, genou vers le mur, distance notée en cm',
        dose: '2 × 10 / jambe',
        mouvement: 'Genou vers le mur',
        saisies: GENOU_MUR,
        volet: VOLET_GENOU_MUR,
      },
      { id: 's3-e3', element: 'Cheville, mollets debout au poids du corps, 3 s de descente', dose: '2 × 12' },
      { id: 's3-e4', element: 'Cheville, pogo hops', dose: '2 × 20', volet: VOLET_POGO },
      {
        id: 's3-e5',
        element: 'Cheville, marche contre le mur avec montée de genou',
        dose: '2 × 10 / jambe',
        volet: {
          interet:
            "Correctif de posture. Corps en ligne droite incliné contre le mur, montée de genou alternée. Apprend à courir grande, bassin en avant, ce qui retire à la cheville une partie du travail qu'elle compense.",
        },
      },
      {
        id: 's3-e6',
        element: 'Éducatifs, skipping A et B, talons-fesses, jambes tendues',
        dose: '2 × 20 m, repos 45 s',
        volet: {
          interet:
            'Deux fonctions à la fois : réviser la mécanique de course et échauffer précisément les structures qui vont encaisser le sprint.',
        },
      },
      {
        id: 's3-e7',
        element: 'Accélérations progressives',
        dose: '3 × 40 m, repos 2 min',
        volet: {
          interet:
            "La marche d'escalier entre l'échauffement et le maximal. Sauter cette étape, c'est le claquage d'ischio.",
          execution: "Trois quarts d'allure, montée progressive sur les 40 m.",
        },
      },
    ],
  },
  blocs: [
    {
      titre: 'Vitesse',
      sousTitre: '360 m à fond, plafond 450.',
      exercices: [
        {
          id: 's3-sprint30',
          numero: 1,
          nom: 'Sprints 30 m, départ debout',
          superset: false,
          mouvements: [
            {
              nom: 'Sprints 30 m, départ debout',
              saisies: [
                {
                  kind: 'mesure',
                  id: 'temps',
                  label: 'Meilleur temps',
                  unite: 's',
                  pas: 0.01,
                  facultatif: true,
                  plusBasEstMieux: true,
                },
              ],
              demo: null,
            },
          ],
          format: '6 × 30 m',
          repos: 180,
          compteur: 6,
          compteurCourt: 4,
          note: 'À fond dès le premier. Retour en marchant.',
          volet: {
            interet:
              "La phase d'accélération pure, c'est-à-dire les premiers mètres. C'est la portion la plus utile en intervention et la plus exigeante en production de force.",
            execution:
              "Récupération complète, sinon ce n'est plus du travail de vitesse. Dès qu'une course est visiblement plus lente, le bloc est terminé, même s'il reste des répétitions.",
          },
        },
        {
          id: 's3-sprint60',
          numero: 2,
          nom: 'Sprints 60 m',
          superset: false,
          mouvements: [{ nom: 'Sprints 60 m', saisies: [], demo: null }],
          format: '3 × 60 m',
          repos: 240,
          compteur: 3,
          compteurCourt: null,
          volet: {
            interet:
              "La vitesse maximale une fois lancée, qui est une qualité différente de l'accélération et se travaille sur des distances plus longues.",
          },
        },
        {
          id: 's3-broad',
          numero: 3,
          nom: 'Standing broad jump',
          superset: false,
          mouvements: [
            {
              nom: 'Standing broad jump',
              saisies: [
                {
                  kind: 'mesure',
                  id: 'saut',
                  label: 'Meilleur saut',
                  unite: 'cm',
                  pas: 5,
                  facultatif: false,
                  plusBasEstMieux: false,
                },
              ],
              demo: 'broad',
            },
          ],
          format: '4 × 3',
          repos: 90,
          compteur: 4,
          compteurCourt: 4,
          note: 'Un seul saut par répétition, 20 s entre les sauts.',
          volet: {
            interet:
              "Puissance horizontale, mesurable au centimètre près. C'est l'indicateur de progression le plus lisible du programme.",
            execution: '20 s entre chaque saut, distance maximale à chaque essai.',
          },
        },
        {
          id: 's3-foulees',
          numero: 4,
          nom: 'Foulées bondissantes',
          superset: false,
          mouvements: [{ nom: 'Foulées bondissantes', saisies: [], demo: null }],
          format: '4 × 20 m',
          repos: 90,
          compteur: 4,
          compteurCourt: null,
          volet: {
            interet:
              "Le pont entre le saut et la course, et la pliométrie la plus transférable au sprint qui existe. Bond d'une jambe sur l'autre en cherchant l'amplitude maximale, exactement le geste de course poussé à l'extrême.",
            execution:
              'Chercher la distance par bond, pas la fréquence. Bras actifs, réception sous le bassin, buste droit. Environ 10 contacts par passage.',
          },
        },
      ],
    },
  ],
  versionCourte:
    'Mise en route complète, obligatoire. Sprints 30 m réduits à 4. Sprints 60 m supprimés. Broad jump conservé. Foulées bondissantes supprimées.',
};

// ---------------------------------------------------------------------------
// C.5 Séance 4. Fessier, mollets et épaules

const SEANCE_4: Seance = {
  id: 4,
  titre: 'Fessier, mollets et épaules',
  lieu: 'Salle',
  duree: 80,
  dureeCourte: 60,
  couleur: 'Vert',
  semaine: 'tranquille',
  jour: 4,
  demande: 'faible',
  role:
    'La séance de volume. Charges plus légères, séries plus longues, sur les zones qui dessinent la silhouette : les hanches et les épaules. La taille marquée vient du contraste entre ces deux zones, plus du taux de masse grasse. Aucun exercice ne fait fondre le tour de taille localement.',
  echauffement: {
    titre: 'Échauffement',
    elements: [
      { id: 's4-e1', element: 'Vélo facile', dose: '4 min' },
      {
        id: 's4-e2',
        element: 'Cheville, genou vers le mur',
        dose: '2 × 10 / jambe',
        mouvement: 'Genou vers le mur',
        saisies: GENOU_MUR,
        volet: VOLET_GENOU_MUR,
      },
      { id: 's4-e3', element: 'Cheville, mollets debout au poids du corps, 3 s de descente', dose: '2 × 12' },
      { id: 's4-e4', element: 'Cheville, pogo hops', dose: '2 × 20' },
      { id: 's4-e5', element: 'Glute bridge et band pull-apart', dose: '15 chacun' },
    ],
  },
  blocs: [
    {
      titre: 'Fessier et jambes',
      exercices: [
        {
          id: 's4-hanche',
          numero: 1,
          nom: 'Hip thrust puis Sumo RDL',
          superset: true,
          mouvements: [
            { nom: 'Hip thrust', saisies: [charge(2.5, 5, 'Hip thrust')], demo: 'ht4' },
            { nom: 'Sumo RDL', saisies: [charge(2, 4, 'Sumo RDL')], demo: 'sumordl' },
          ],
          format: '4 × (12 + 10)',
          repos: 90,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Deux mouvements de hanche sous deux angles. Le hip thrust charge le fessier en extension complète, le sumo RDL en position d'allongement, avec les adducteurs. Même zone, donc charges plus légères qu'en séance 1 : ici c'est le volume qui travaille.",
            execution:
              "Hip thrust : 1 s de serrage en haut, menton rentré, côtes basses. Sumo RDL : pieds larges, pointes ouvertes, dos neutre, la charge descend entre les jambes jusqu'à mi-tibia.",
          },
        },
        {
          id: 's4-fentes',
          numero: 2,
          nom: 'Fentes croisées haltères',
          superset: false,
          mouvements: [{ nom: 'Fentes croisées haltères', saisies: [charge(2, 2)], demo: 'curtsy4' }],
          format: '3 × 12 / jambe',
          repos: 90,
          compteur: 3,
          compteurCourt: 2,
          volet: {
            interet: "Deuxième dose d'unilatéral du cycle, en volume cette fois.",
            execution:
              "Pas arrière en diagonale derrière la jambe d'appui, genou avant aligné sur le pied, buste droit. Poussée dans le talon avant pour remonter.",
          },
        },
        {
          id: 's4-kickback',
          numero: 3,
          nom: 'Kickback 45° puis Kickback 90°',
          superset: true,
          mouvements: [
            { nom: 'Kickback 45°', saisies: [charge(1, 1, '45°')], demo: 'kick45' },
            { nom: 'Kickback 90°', saisies: [charge(1, 1, '90°')], demo: 'kick90' },
          ],
          format: '3 × (15 + 15) / jambe',
          repos: 60,
          compteur: 3,
          compteurCourt: 2,
          volet: {
            interet:
              "Deux angles d'extension de hanche à la poulie. À 45°, le grand fessier. À 90°, sur le côté, la partie haute du fessier et le moyen fessier. Charges légères, contraction volontaire.",
            execution:
              "Buste penché, bassin fixe, jambe d'appui légèrement fléchie. 1 s de contraction en fin de mouvement, sans cambrer.",
          },
        },
        {
          id: 's4-abduction',
          numero: 4,
          nom: 'Abduction hanche machine 3-3-3',
          superset: false,
          mouvements: [{ nom: 'Abduction hanche machine 3-3-3', saisies: [charge(2.5, 5)], demo: 'abd' }],
          format: '3 × 3 unités',
          repos: 60,
          compteur: 3,
          compteurCourt: 2,
          note:
            "Une unité, c'est 3 répétitions, puis 3 pulsations en position ouverte, puis 3 s de maintien. 3 unités enchaînées font une série.",
          volet: {
            interet:
              "Moyen fessier. C'est lui qui donne la largeur sur le côté de la hanche et la stabilité latérale, deux choses que le travail en ligne droite ne construit jamais.",
            execution:
              'Trois unités enchaînées sans relâcher la machine. Le maintien de 3 s se fait en position ouverte.',
          },
        },
        {
          id: 's4-legcurl',
          numero: 5,
          nom: 'Leg curl',
          superset: false,
          mouvements: [{ nom: 'Leg curl', saisies: [charge(2.5, 5)], demo: 'legcurl' }],
          format: '3 × 15',
          repos: 90,
          compteur: 3,
          compteurCourt: 2,
          volet: {
            interet:
              "Deuxième dose d'ischios du cycle. Avec du sprint au programme, deux expositions valent mieux qu'une.",
            execution: '2 s à la descente.',
          },
        },
        {
          id: 's4-mollets',
          numero: 6,
          nom: 'Mollets assis machine puis Relevés de pointes',
          superset: true,
          mouvements: [
            { nom: 'Mollets assis machine', saisies: [charge(2.5, 5, 'Mollets')], demo: 'calves' },
            { nom: 'Relevés de pointes', saisies: [], demo: null },
          ],
          format: '4 × (25 + 20)',
          repos: 60,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Le mollet et le tendon d'Achille encaissent l'essentiel des forces de contact au sprint. Les ignorer avec une séance de piste dans le cycle, c'est accepter une tendinopathie. Assis, c'est le soléaire qui travaille. Les relevés de pointes renforcent le muscle opposé, à l'avant du tibia.",
            execution:
              'Mollets : amplitude complète, 1 s en position basse. Relevés de pointes : dos au mur, talons au sol, pointes qui montent vers les tibias.',
          },
        },
      ],
    },
    {
      titre: 'Épaules',
      exercices: [
        {
          id: 's4-epaules',
          numero: 7,
          nom: 'Élévations latérales puis Reverse pec-deck',
          superset: true,
          mouvements: [
            { nom: 'Élévations latérales', saisies: [charge(1, 1, 'Élévations')], demo: 'latraise' },
            { nom: 'Reverse pec-deck', saisies: [charge(2.5, 2.5, 'Reverse pec-deck')], demo: null },
          ],
          format: '4 × (15 + 15)',
          repos: 60,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Deuxième exposition du deltoïde latéral et postérieur sur le cycle, la troisième arrive en séance 5. C'est cette accumulation régulière qui produit l'épaule, pas une séance isolée. Superset légitime : deux faisceaux différents.",
            execution:
              "Élévations : charge légère, contrôle total, coudes souples. Reverse pec-deck : poitrine contre le dossier, bras qui s'ouvrent à l'horizontale, omoplates serrées en fin de mouvement.",
          },
        },
      ],
    },
  ],
  circuit: {
    id: 's4-circuit',
    titre: 'Circuit abdos',
    sousTitre: '3 tours, 1 min entre les tours.',
    tours: 3,
    toursCourt: 2,
    repos: 60,
    mouvements: [
      { mouvement: 'Relevé de jambes, haltère tenu au-dessus de la tête', dose: '12' },
      { mouvement: 'Crunch pieds en haut', dose: '12' },
      { mouvement: 'Abs de côté, poids du corps', dose: '15 / côté' },
      { mouvement: 'Planche et twist du bassin', dose: '12 / côté' },
      { mouvement: "Planche, touches d'épaule", dose: '10 / côté' },
      { mouvement: 'Gainage', dose: '1 min' },
    ],
    volet: {
      interet:
        'Le tronc sous tous ses angles en une dizaine de minutes : flexion, inclinaison, rotation, anti-rotation et gainage. Placé en fin de séance, il ne coûte rien au travail lourd.',
    },
  },
  versionCourte: 'Échauffement complet. Une série de moins sur chaque exercice. Circuit abdos à 2 tours.',
};

// ---------------------------------------------------------------------------
// C.6 Séance 5. Puissance et portés

const SEANCE_5: Seance = {
  id: 5,
  titre: 'Puissance et portés',
  lieu: 'Salle',
  duree: 60,
  dureeCourte: 45,
  couleur: 'Fonte',
  semaine: 'tranquille',
  jour: 6,
  demande: 'forte',
  role:
    "La séance la plus proche du métier : produire de la force vite, traîner, porter, tenir une position sous charge. L'explosif ouvre la séance, sur système frais, jamais en circuit. Un saut fatigué ne développe pas la puissance, il développe la tolérance à la fatigue et augmente le risque à la réception.",
  echauffement: {
    titre: 'Échauffement',
    elements: [
      { id: 's5-e1', element: 'Vélo facile', dose: '5 min' },
      { id: 's5-e2', element: 'Charnière de hanche à vide', dose: '15' },
      { id: 's5-e3', element: 'Sauts verticaux sous-maximaux', dose: '2 × 5' },
    ],
  },
  blocs: [
    {
      titre: 'Explosif',
      sousTitre: 'En premier, quand tu es fraîche.',
      exercices: [
        {
          id: 's5-saut',
          numero: 1,
          nom: 'Saut vertical, une jambe, départ à genoux',
          superset: false,
          mouvements: [{ nom: 'Saut vertical, une jambe, départ à genoux', saisies: [], demo: null }],
          format: '4 × 3 / jambe',
          repos: 120,
          compteur: 4,
          compteurCourt: 4,
          note: 'Hauteur maximale à chaque saut, réception amortie.',
          volet: {
            interet:
              "Départ à genoux, donc aucun contre-mouvement et aucun rebond élastique. C'est de la production de force concentrique pure, sur une jambe, ce qui complète le sprint au lieu de le doubler.",
            execution: 'Repos complet entre les sauts. Cet exercice ne rentre jamais dans un circuit.',
          },
        },
        {
          id: 's5-cmj',
          numero: 2,
          nom: 'Countermovement jump',
          superset: false,
          mouvements: [{ nom: 'Countermovement jump', saisies: [], demo: 'cmj' }],
          format: '3 × 3',
          repos: 90,
          compteur: 3,
          compteurCourt: null,
          volet: {
            interet:
              'Saut vertical avec contre-mouvement et réception au sol, donc travail élastique complet, ce que le départ à genoux ne fait pas.',
            execution:
              "Descente rapide en demi-squat puis remontée immédiate, hauteur maximale à chaque répétition. 15 à 20 s entre les sauts. Réception amortie, genoux dans l'axe.",
          },
        },
        {
          id: 's5-bonds',
          numero: 3,
          nom: 'Bonds latéraux, une jambe',
          superset: false,
          mouvements: [{ nom: 'Bonds latéraux, une jambe', saisies: [], demo: 'bonds' }],
          format: '3 × 6 / jambe',
          repos: 60,
          compteur: 3,
          compteurCourt: null,
          volet: {
            interet:
              "Le seul travail explosif du programme dans le plan latéral. Sprint et sauts verticaux sont tous les deux en ligne droite, alors qu'un changement de direction ou un déséquilibre à absorber se joue sur le côté. Sollicite aussi le moyen fessier en réactif.",
            execution:
              "Bond latéral sur une jambe, réception sur l'autre, enchaînement immédiat dans l'autre sens, comme un patineur. Réception stable avant de repartir.",
          },
        },
      ],
    },
    {
      titre: 'Force et portés',
      exercices: [
        {
          id: 's5-zercher',
          numero: 4,
          nom: 'Squat Zercher',
          superset: false,
          mouvements: [{ nom: 'Squat Zercher', saisies: [charge(2.5, 5)], demo: 'zercher' }],
          format: '3 × 8',
          repos: 120,
          compteur: 3,
          compteurCourt: 2,
          note: 'Barre dans le creux des coudes, serviette autour.',
          volet: {
            interet:
              "Charge portée devant, dans le creux des coudes. Le tronc lutte pour rester droit, ce qui en fait le squat le plus proche d'un port de charge réel. Deuxième dose de quadriceps et de fessiers du cycle.",
            execution: 'Coudes serrés, buste vertical, descente contrôlée.',
          },
        },
        {
          id: 's5-sled',
          numero: 5,
          nom: 'Sled push',
          superset: false,
          mouvements: [{ nom: 'Sled push', saisies: [charge(5, 5, 'Charge ajoutée')], demo: null }],
          format: '5 × 20 m',
          repos: 120,
          compteur: 5,
          compteurCourt: 4,
          volet: {
            interet:
              "Poussée horizontale sous charge, sans phase excentrique donc sans courbatures. C'est le seul exercice qui charge lourd sans coûter en récupération, ce qui est décisif quand il n'y a que cinq séances par cycle.",
            execution:
              "Bras tendus, buste incliné vers l'avant, poussée continue sur toute la distance. Charge permettant de conserver la même vitesse du premier au dernier mètre.",
          },
        },
        {
          id: 's5-farmer',
          numero: 6,
          nom: 'Farmer walk',
          superset: false,
          mouvements: [{ nom: 'Farmer walk', saisies: [charge(2, 2, 'Charge par main')], demo: 'farmer' }],
          format: '4 × 30 m',
          repos: 120,
          compteur: 4,
          compteurCourt: 3,
          volet: {
            interet:
              "Grip, trapèzes et tronc anti-inclinaison. C'est l'exercice de salle le plus proche d'un port de charge réel en déplacement.",
            execution:
              'Lourd, épaules basses, tronc gainé, aucune inclinaison latérale. La charge par main sur 30 m est l\'indicateur de progression.',
          },
        },
        {
          id: 's5-elevations',
          numero: 7,
          nom: 'Élévations latérales haltères',
          superset: false,
          mouvements: [{ nom: 'Élévations latérales haltères', saisies: [charge(1, 1)], demo: 'latraise' }],
          format: '3 × 15',
          repos: 60,
          compteur: 3,
          compteurCourt: 3,
          volet: {
            interet:
              "Troisième dose de deltoïde latéral du cycle. C'est l'accumulation régulière qui construit la largeur d'épaule.",
            execution: "Charge légère, coudes souples, montée à hauteur d'épaule sans balancer.",
          },
        },
        {
          id: 's5-mollets',
          numero: 8,
          nom: 'Mollets assis machine',
          superset: false,
          mouvements: [{ nom: 'Mollets assis machine', saisies: [charge(2.5, 5)], demo: 'calves' }],
          format: '4 × 12',
          repos: 60,
          compteur: 4,
          compteurCourt: 4,
          note: 'Lourd, 1 s en position basse.',
          volet: {
            interet:
              "Le mollet et le tendon d'Achille encaissent l'essentiel des forces de contact au sprint. Les ignorer avec une séance de piste dans le cycle, c'est accepter une tendinopathie.",
            execution: 'Lourd, amplitude complète, 1 s en position basse.',
          },
        },
        {
          id: 's5-abduction',
          numero: 9,
          nom: 'Abduction debout à la poulie',
          superset: false,
          mouvements: [{ nom: 'Abduction debout à la poulie', saisies: [charge(2.5, 2.5)], demo: 'kick90' }],
          format: '3 × 15 / jambe',
          repos: 60,
          compteur: 3,
          compteurCourt: 3,
          volet: {
            interet: 'Le moyen fessier, debout et sur une jambe, donc dans la position où il sert réellement.',
            execution: 'Buste droit, bassin fixe, jambe qui monte sur le côté sans rotation du pied.',
          },
        },
      ],
    },
  ],
  versionCourte:
    'Échauffement complet. Bloc explosif réduit au seul saut vertical départ à genoux. Squat Zercher à 2 séries. Une série de moins au sled push et au farmer walk. Élévations, mollets et abduction conservés.',
};

export const SEANCES: readonly Seance[] = [SEANCE_1, SEANCE_2, SEANCE_3, SEANCE_4, SEANCE_5];

export function seance(id: SeanceId): Seance {
  const s = SEANCES[id - 1];
  if (!s) throw new Error(`Séance inconnue : ${id}`);
  return s;
}

// ---------------------------------------------------------------------------
// C.1 Structure et calendrier de référence

export type CaseCalendrier = SeanceId | 'Travail' | 'Récupération' | 'Libre';

export const CALENDRIER: Readonly<Record<TypeSemaine, readonly CaseCalendrier[]>> = {
  chargee: ['Travail', 'Travail', 1, 2, 'Travail', 'Travail', 'Travail'],
  tranquille: ['Récupération', 3, 'Travail', 'Travail', 4, 'Libre', 5],
};

// ---------------------------------------------------------------------------
// C.8 Liens de démonstration

export const DEMOS: Readonly<Record<DemoCle, string>> = {
  squat: 'https://musclewiki.com/fr-fr/exercise/barbell-squat?model=f',
  ht: 'https://musclewiki.com/fr-fr/exercise/machine-hip-thrust?model=f',
  rdl: 'https://musclewiki.com/fr-fr/exercise/dumbbell-romanian-deadlift?model=f',
  curtsy: 'https://musclewiki.com/fr-fr/exercise/curtsy-lunge?model=f',
  legext: 'https://musclewiki.com/fr-fr/exercise/machine-leg-extension?model=f',
  curl: 'https://musclewiki.com/fr-fr/exercise/machine-hamstring-curl?model=f',
  pulldown: 'https://musclewiki.com/fr-fr/exercise/machine-pulldown?model=f',
  traction: 'https://www.youtube.com/watch?v=XeErfmGSwfE',
  ohp: 'https://musclewiki.com/fr-fr/exercise/dumbbell-overhead-press?model=f',
  row: 'https://fr.pinterest.com/pin/773704411027442418/',
  latraise: 'https://fr.pinterest.com/pin/227924431132101085/',
  oiseau: 'https://fr.pinterest.com/pin/991917886693197255/',
  bras: 'https://fr.pinterest.com/pin/610941505744709308/',
  broad: 'https://fr.pinterest.com/pin/422212533840894553/',
  ht4: 'https://fr.pinterest.com/pin/6685099441992584/',
  sumordl: 'https://www.youtube.com/shorts/66AKPxeXLoI',
  curtsy4: 'https://fr.pinterest.com/pin/936678422504641505/',
  kick45: 'https://fr.pinterest.com/pin/8725793024607353/',
  kick90: 'https://fr.pinterest.com/pin/140806234963951/',
  abd: 'https://fr.pinterest.com/pin/13440498884411433/',
  legcurl: 'https://fr.pinterest.com/pin/8162843070097850/',
  calves: 'https://fr.pinterest.com/pin/682365781046094601/',
  cmj: 'https://fr.pinterest.com/pin/1001488035893290797/',
  bonds: 'https://pin.it/6Ip7Q7708',
  zercher: 'https://fr.pinterest.com/pin/146437425380955272/',
  farmer: 'https://fr.pinterest.com/pin/512706738850502516/',
};

// ---------------------------------------------------------------------------
// C.9 Onglet Règles

export type BlocRegle =
  | { readonly type: 'calendrier' }
  | { readonly type: 'texte'; readonly texte: string }
  | { readonly type: 'etapes'; readonly items: readonly string[] }
  | { readonly type: 'tableau'; readonly entetes: readonly string[]; readonly lignes: readonly (readonly string[])[] };

export interface SectionRegle {
  readonly titre: string;
  readonly blocs: readonly BlocRegle[];
}

export const REGLES: readonly SectionRegle[] = [
  {
    titre: 'Rythme',
    blocs: [
      { type: 'calendrier' },
      {
        type: 'texte',
        texte:
          "Le placement suit une règle simple : les séances les plus exigeantes nerveusement occupent les créneaux les plus frais. La séance 1 tombe le mercredi plutôt que le jeudi, pour que le pic de courbatures arrive sur une journée libre et non sur un poste de 12 h. Le lundi de la semaine tranquille reste vide. Il suit trois postes consécutifs et sert de récupération, pas de rattrapage. Le sprint tombe le mardi, après une journée pleine de repos, c'est-à-dire dans le meilleur état disponible du cycle. La séance 4 tombe le vendredi parce qu'elle est la seule que la fatigue de deux postes ne dégrade pas. La séance 5 tombe le dimanche, après un samedi libre, pour que le bloc explosif se fasse sur un système frais.",
      },
    ],
  },
  {
    titre: 'Progression des charges',
    blocs: [
      {
        type: 'texte',
        texte:
          "+2,5 kg sur le haut du corps, +5 kg sur le bas du corps, dès que la dernière série passe avec plus de 2 répétitions en réserve. Sur les mouvements au poids du corps, une répétition s'ajoute avant toute augmentation de difficulté.",
      },
    ],
  },
  {
    titre: 'Progression vers la traction',
    blocs: [
      {
        type: 'texte',
        texte: "Trois étapes. Le passage à l'étape suivante n'a lieu qu'une fois le critère rempli.",
      },
      {
        type: 'etapes',
        items: [
          'Tirage vertical poulie. Critère : 3 × 8 propres à 80 % du poids de corps.',
          'Rowing inversé à la barre guidée, corps de plus en plus horizontal. Critère : 3 × 10 corps parallèle au sol.',
          'Négatives. Menton au-dessus de la barre au départ, descente contrôlée en 5 s, 4 × 3. La première traction complète arrive de là.',
        ],
      },
    ],
  },
  {
    titre: 'Volume de sprint',
    blocs: [
      {
        type: 'texte',
        texte:
          "La séance 3 contient 360 m courus à intensité maximale, échauffement non compris. La limite haute est 450 m. Au-delà, la vitesse chute et l'effort bascule dans la filière lactique, qui est une autre qualité et qui dégrade la technique.",
      },
    ],
  },
  {
    titre: "Pliométrie : trois paliers d'intensité",
    blocs: [
      {
        type: 'texte',
        texte:
          'Un contact au sol ne vaut pas un autre. Le plafond dépend du palier, et les trois se cumulent dans une même séance.',
      },
      {
        type: 'tableau',
        entetes: ['Palier', 'Exercices', 'Plafond par séance'],
        lignes: [
          ['Raideur', 'Pogo hops, skipping', '60 à 100 contacts, coût articulaire faible'],
          ['Extensif', 'Foulées bondissantes, broad jump, countermovement jump', '40 à 80 contacts'],
          ['Intensif', 'Bonds unilatéraux, et plus tard les sauts en contrebas', '20 à 40 contacts, jamais davantage'],
        ],
      },
    ],
  },
  {
    titre: 'Explosif : jamais plus de volume',
    blocs: [
      {
        type: 'texte',
        texte:
          'Une fois les plafonds atteints, la progression se fait en hauteur, en distance et en qualité de réception, jamais en nombre de séries. Toujours frais, en début de séance, jamais en circuit.',
      },
    ],
  },
  {
    titre: "Sauts en contrebas : conditions d'entrée",
    blocs: [
      {
        type: 'texte',
        texte:
          'Volontairement absents du premier cycle. Quatre critères avant de les introduire : huit semaines de pliométrie continue derrière, squat à environ un poids de corps, réception de countermovement jump stable et silencieuse, aucune douleur de genou ni de tendon. Les quatre remplis, ils remplacent les bonds unilatéraux en séance 5, 4 × 4 depuis 30 cm.',
      },
    ],
  },
  {
    titre: 'Le repos fait partie de la charge',
    blocs: [
      {
        type: 'texte',
        texte:
          "Sur les sprints et sur le bloc explosif, raccourcir les repos ne rend pas la séance plus dure, il la rend inutile. Si le temps manque, la coupe se fait dans les exercices d'isolation.",
      },
    ],
  },
  {
    titre: 'Hiérarchie en cas de semaine difficile',
    blocs: [
      {
        type: 'texte',
        texte:
          'Séance 4 sacrifiée en premier. Jamais la séance 2. Le calendrier laisse déjà huit jours entre deux expositions fortes des épaules et du dos, et sauter la séance 2 porterait cet intervalle à vingt-deux jours, ce qui annule le travail du haut du corps sur le cycle. Jamais la 1, la 3 ni la 5 non plus.',
      },
    ],
  },
  {
    titre: 'Version courte',
    blocs: [
      {
        type: 'texte',
        texte:
          "Quand un poste a vidé la journée, la version courte passe avant le repos. L'échauffement n'est jamais réduit. Ce sont les dernières séries et l'isolation qui sautent, jamais le cœur de la séance.",
      },
    ],
  },
  {
    titre: 'Alimentation',
    blocs: [
      {
        type: 'texte',
        texte:
          '1,8 à 2,2 g de protéines par kg de poids de corps, 7 à 9 h de sommeil. À maintenance calorique avec des protéines hautes, une personne peu entraînée peut gagner du muscle et perdre de la graisse en même temps : plus lent sur la balance, mais la récupération reste intacte et les charges montent réellement. En déficit, le programme ne change pas, la progression est simplement plus lente.',
      },
    ],
  },
  {
    titre: 'Point de contrôle à 8 semaines',
    blocs: [
      {
        type: 'texte',
        texte:
          "Squat, hip thrust, développé militaire, étape atteinte sur la traction, charge de farmer walk, temps sur 30 m. Six indicateurs. S'ils montent, le programme fait son travail, quelle que soit la balance.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Section A. Rythme de travail et repères du calendrier

export type CaseRythme = 'Travail' | 'Libre';

export const RYTHME: Readonly<Record<TypeSemaine, readonly CaseRythme[]>> = {
  chargee: ['Travail', 'Travail', 'Libre', 'Libre', 'Travail', 'Travail', 'Travail'],
  tranquille: ['Libre', 'Libre', 'Travail', 'Travail', 'Libre', 'Libre', 'Libre'],
};

/** La semaine du lundi 7 septembre 2026 est une semaine chargée. Les semaines alternent ensuite strictement. */
export const LUNDI_SEMAINE_CHARGEE = '2026-09-07';

export interface PeriodeVacances {
  /** Date ISO (AAAA-MM-JJ), incluse. */
  readonly debut: string;
  /** Date ISO (AAAA-MM-JJ), incluse. */
  readonly fin: string;
}

/** Préremplissage des réglages : du jeudi 8 au jeudi 15 octobre 2026 inclus. */
export const VACANCES_PAR_DEFAUT: readonly PeriodeVacances[] = [{ debut: '2026-10-08', fin: '2026-10-15' }];
