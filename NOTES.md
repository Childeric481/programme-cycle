# Programme. Notes de construction

**Adresse publique :** https://childeric481.github.io/programme-cycle/ (vérifiée le 4 octobre 2026 : page, manifest et service worker servis, 22 fichiers en cache après la première visite)

**Planche de direction :** https://childeric481.github.io/programme-cycle/#/planche

## Installer l'application

**Android (Chrome)**
1. Ouvrir le lien dans Chrome.
2. Toucher le menu ⋮ en haut à droite.
3. Choisir « Ajouter à l'écran d'accueil », puis « Installer ».

**iPhone (Safari)**
1. Ouvrir le lien dans Safari.
2. Toucher le bouton Partager (le carré avec une flèche).
3. Choisir « Sur l'écran d'accueil », puis « Ajouter ».

## Étapes (méthode F)

| Étape | État |
|---|---|
| 1. Lecture, NOTES.md, vérifications | Fait le 4 octobre 2026 |
| 2. Modèle du contenu et test de conformité | Fait. 52 vérifications, toutes vertes |
| 3. Dépôt, workflow, squelette publié | Fait. Dépôt public `programme-cycle`, déploiement par GitHub Actions à chaque envoi sur `main` |
| 4. Planche de direction | Validée le 4 octobre 2026, avec ses six choix |
| 5. Socle : navigation, Aujourd'hui, séance guidée, repos, persistance, hors ligne | Fait, publié |
| 6. Cinq séances, versions courtes, progression proposée, saisies spéciales | À faire |
| 7. Progrès, décaler ou sauter, Règles, volets « Pourquoi » | À faire |
| 8. Notifications, réglages, finitions, vérifications finales | À faire |

## Choix techniques

- **Preact plutôt que Svelte** : API à composants connue, 4 ko compressés, TypeScript strict vérifié par `tsc` de bout en bout sans outil de compilation supplémentaire.
- **Preact 10.29.8 et non 11.0.0** : la 11.0.0 est sortie le 30 septembre 2026, quatre jours avant le début du projet. La 10.x est la branche éprouvée.
- **Pas de `@preact/preset-vite`** : Vite 8 compile le JSX lui-même (Oxc, `oxc.jsx.importSource = 'preact'`). Une dépendance de moins, pas de Babel.
- **Service worker écrit à la main** (`src/sw/sw.ts`), sans Workbox. Le plugin `build/pwa.ts` produit le manifest et la liste complète des fichiers à mettre en cache. Tout est mis en cache à l'installation, donc l'application fonctionne hors ligne dès la première visite. La version du cache est une empreinte du contenu, donc un déploiement sans changement ne déclenche pas de bandeau de mise à jour.
- **Mise à jour** : la nouvelle version attend. Le bandeau « Nouvelle version disponible » propose de recharger, et l'application n'active la nouvelle version que sur ce geste.
- **Routage par ancre** (`#/planche`, etc.) : fonctionne tel quel sur GitHub Pages, sans page 404 de secours.
- **Polices** : Barlow et Barlow Condensed en woff2, copiées depuis Fontsource 5.3.0 (licence OFL, `src/fonts/OFL-Barlow.txt`). Sous-ensembles latin et latin étendu, avec `unicode-range` : le latin étendu ne se charge que si un caractère l'exige.
- **Icônes** : générées par `scripts/make-icons.mjs` en Node pur (aucune dépendance), à partir de la géométrie du disque. Icônes maskable dans la zone sûre (rayon 40 %).
- **Contenu** : `src/data/program.ts`, séparé de l'interface. `spec/contenu.md` est la copie exacte de la section C du document de référence. `tests/conformite.test.ts` relit le document et compare chaque exercice, format, repos, compteur, saisie, palier, lien, volet, version courte et règle. Contrôlé par mutation : chaque modification volontaire d'un texte, d'un repos, d'un palier, d'une dose, d'un lien ou d'une règle fait échouer le test.

## Versions vérifiées (registre npm, 4 octobre 2026)

| Paquet | Version retenue | Note |
|---|---|---|
| vite | 8.3.2 | publiée le 1er octobre 2026, Node ≥ 22.12 |
| preact | 10.29.8 | 11.0.0 écartée, voir plus haut |
| typescript | 7.0.2 | compilateur natif, binaires par plateforme présents dans le verrou |
| vitest | 5.0.3 | accepte Vite 8 |
| @fontsource/barlow, @fontsource/barlow-condensed | 5.3.0 | fichiers copiés, pas de dépendance d'exécution |
| GitHub CLI | 2.102.0 | archive officielle, somme SHA-256 vérifiée |

Actions GitHub (pages de publication, 4 octobre 2026) : `actions/checkout@v7`, `actions/setup-node@v7`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`. Node 20 n'existe plus sur les machines GitHub depuis le 23 septembre 2026, le workflow utilise Node 24.

## API navigateur vérifiées (sources : MDN, caniuse, code source Chromium et WebKit, blogs WebKit et Chrome)

| API | Android Chrome | iPhone Safari | Décision |
|---|---|---|---|
| View Transitions (même document) | 111+ | 18.0+ | Forme `startViewTransition(callback)` uniquement, avec repli sans animation. |
| Screen Wake Lock | 84+ | 16.4+, mais dans une application installée seulement depuis 18.4 (avant : ne fait rien, sans erreur) | Demandé au début de la séance, redemandé à chaque retour au premier plan. |
| Vibration | Oui, si la page est visible et a déjà reçu un toucher | Non, aucune version | Vibrations sur Android, son seul sur iPhone. |
| Web Audio | Oui | Déverrouillage par un toucher, interrompu en arrière-plan | Contexte créé au premier toucher de la séance, relancé au retour. `navigator.audioSession.type = 'ambient'` sur iPhone : les sons se mêlent à la musique sans la couper, mais le bouton silencieux les coupe. |
| `navigator.storage.persist()` | 55+ | 15.2+ | Demandé au premier lancement. La règle d'effacement à 7 jours de Safari ne s'applique pas aux applications installées. |
| IndexedDB | Oui | Erreur « Connection to Indexed Database server lost » signalée de 17.4 à 18.x | Réouverture automatique de la base sur cette erreur. |
| `hyphens: auto` en français | Oui (dictionnaires du système) | Non confirmé | Césure activée, à contrôler sur l'iPhone. |
| `text-wrap: balance` | 114+ | 17.5+ | Utilisé sur les titres. |

**Installation.** Chrome exige un manifest avec nom, icônes 192 et 512, `start_url` et `display: standalone`. Un service worker n'est plus obligatoire, mais il est là pour le hors-ligne. iPhone : toute page ajoutée à l'écran d'accueil s'ouvre en application depuis iOS 26. L'icône vient de `apple-touch-icon`. Safari n'utilise ni `background_color` ni les icônes maskable. Un écran de démarrage personnalisé demande des images `apple-touch-startup-image` par taille d'écran : prévu à l'étape 8.

**Lighthouse.** La catégorie PWA a disparu de Lighthouse 12 (avril 2024). Lighthouse 13.5 ne donne plus de note PWA. L'installabilité se contrôle dans les outils de développement de Chrome (Application, Manifest, section Installability).

## Notifications de fin de repos (état provisoire, à confirmer à l'étape 8)

- **Planification à l'avance (Notification Triggers)** : abandonnée par Chrome, aucun navigateur ne la propose.
- **Android** : une page masquée est gelée au bout d'environ une minute, ses minuteries s'arrêtent. Un service worker peut rester actif jusqu'à 5 minutes pendant un événement (`waitUntil`), puis afficher la notification. C'est la piste retenue, pour les repos de moins de 4 min 30.
- **iPhone** : les notifications existent pour les applications installées (16.4+), mais le code s'arrête quand l'application passe en arrière-plan, et sans serveur d'envoi, rien ne peut réveiller l'application. Pas de notification de fin de repos sur iPhone.
- **Dans tous les cas**, au retour au premier plan, le repos est recalculé sur l'horloge du téléphone à partir de l'heure de fin enregistrée.

## Contenu : points signalés, laissés tels quels

1. **Séance 4, échauffement.** « Cheville, pogo hops » n'a pas de volet, alors que le même élément en séance 3 renvoie au volet de la séance 1. Le document ne liste pas ce volet en séance 4 : il n'est pas ajouté.
2. **Séance 4, rôle.** « La taille marquée vient du contraste entre ces deux zones, plus du taux de masse grasse. » La tournure « plus du » peut se lire « plus que du ». Texte conservé.
3. **Règles, hiérarchie.** « Huit jours » correspond bien à l'écart entre la séance 2 (jeudi) et la séance 4 (vendredi de la semaine suivante). Le chiffre de « vingt-deux jours » si la séance 2 saute ne se retrouve pas directement à partir du calendrier de C.1 (séance 2 tous les 14 jours). À confirmer. Texte conservé.
4. **Règles, progression des charges** (+2,5 kg haut du corps, +5 kg bas du corps) et **paliers des tableaux** (+2 au soulevé de terre roumain, +4 au sumo RDL, +1 au développé militaire, etc.). L'application propose les paliers des tableaux, comme le demande D.4.
5. **Supersets avec un seul lien de démonstration** (`bras`, `calves`, `latraise` en séance 4) : le lien est rattaché au premier mouvement (« Voir curl biceps poulie »). Le lien `bras` montre peut-être les deux mouvements.
6. **Séance 3, version courte.** Le sous-titre « 360 m à fond, plafond 450. » décrit la version complète. En version courte, il ne reste que 120 m. Proposition : masquer ce sous-titre en version courte plutôt que d'afficher un chiffre faux. À valider.

## Planche de direction : choix soumis à validation

- **Disque** (`src/ui/plate/Plate.tsx`) : un seul composant SVG, géométrie calculée (jante 11 %, anneau de lettrage à 72 %, moyeu, alésage 50/450). Lumière fixe en haut à gauche, relief en traits de 1 px. Grain généré une fois (96 px, 5 % ; fonte 11 %, grain plus gros). Niveaux de détail : 24 px pastille et moyeu, 40 à 64 px jante en plus, 120 px et plus lettrage et relief. Numéro affiché à partir de 56 px.
- **États** : prévu en contour, fait plein, en cours avec une bande à l'encre de la séance sur la jante (même langage que le repos), sauté estompé et barré, décalé en contour pointillé.
- **Repos** : le moyeu en acier s'efface derrière le temps restant (seul son relief reste), pour garder les chiffres lisibles à bout de bras. La jauge est une bande peinte au milieu de la jante, à l'encre de la séance, sur le caoutchouc nu. Deux lames en demi-anneau tournent dans deux moitiés masquées : uniquement `transform` et `opacity`. Lettrage en trois couches (ombre, lumière, encre) qui tournent ensemble, un tour par minute, la lumière reste fixe.
- **Fin du repos** : E.1 cite la pulsation du cadran de la version de référence, E.4 et E.5 décrivent la pulsation à chaque tic et la chute à zéro. Retenu : E.5, qui précise E.1.
- **Barre qui se charge** : appliquée à toute la glissade, la courbe `cubic-bezier(.2,.9,.3,1.35)` dépasse la cible de 12 % et ferait traverser le disque précédent. La glissade va jusqu'au contact, la courbe s'applique au rebond (3 px), le clic sonore tombe au contact. Durée totale 380 ms.
- **Volet « Pourquoi »** : E.5 demande une animation de hauteur, seule exception à la règle « transform et opacity ».
- **Typographie à l'affichage** : apostrophe typographique, espaces insécables avant les deux-points et entre chiffre et unité. Le contenu stocké reste identique au document.
- **Captures** : `scripts/captures-planche.mjs` (Playwright 1.63.0), à 390 × 844 et 360 × 800, clair et sombre. Corrigé après relecture : affichage « 60,0 kg » devenu « 60 kg », disque décalé allégé (seul le contour en pointillé), insert d'acier des disques de profil, raccord de la jauge à midi.

## Étape 5 : socle

- **Navigation** : routage par ancre, transitions de vue (avant vers la gauche, retour vers la droite, onglets sans glissement), fondus de 120 ms en mouvement réduit. La barre d'onglets disparaît pendant la séance et sur l'écran de fin. Progrès et Règles affichent un écran d'attente jusqu'à l'étape 7.
- **Persistance** : IndexedDB, base `programme`, schéma version 1 (réglages, séance en cours, journal, historique par mouvement, décalages et sauts), migrations par version. Chaque geste est écrit aussitôt. Réouverture automatique de la base si la connexion est perdue (iPhone). `navigator.storage.persist()` demandé au lancement.
- **Reprise** : une séance en cours, non mise en pause, rouvre directement l'écran de séance, repos compris. Après une pause volontaire, l'accueil affiche « Séance en cours » et « Reprendre la séance ».
- **Repos** : l'écran de repos est construit à l'avance, caché. Le minuteur part à la validation de la série, le panneau monte 460 ms plus tard, une fois le disque plaqué sur la barre. Mesuré : 60 images par seconde, processeur ralenti ×4.
- **Saisies** : la valeur se tape au clavier (virgule acceptée) ou s'ajuste avec − et +. Préremplie avec la dernière valeur de la même séance. Une correction faite après une série validée est enregistrée aussi.
- **Fin de séance** : sur le dernier exercice, le lien « Étape suivante » est désactivé, pour ne jamais terminer une séance d'un seul geste par erreur. Le bouton principal « Terminer la séance » n'apparaît qu'une fois toutes les séries faites.
- **Accueil** : disque héros centré à 82 % de la largeur, diamètre min(118 vw, 500 px), coupé par le bord droit. Contour (prévu, décalé) à 42 % d'opacité derrière la date. Sur un disque plein (en cours, fait), la date passe dans la couleur du texte de la séance, découpée au pixel près par `clip-path`.
- **Fin** : un disque par exercice fait se charge de chaque côté de la barre, en cascade (600 ms), puis la barre se soulève et se repose (600 ms). Les chiffres apparaissent ensuite.
- **Vérifié** (`scripts/parcours.mjs` en clair et en sombre, `scripts/parcours-cas.mjs`) : séance du jour, « Ensuite, série 2 sur 4. », fermeture pendant un repos puis réouverture (2:29 puis 2:26 après 3 s), pause et reprise, fin « 1 minute, 24 séries validées. », valeur notée « 62,5 kg », circuit de la séance 4 (trois tours, repos entre les tours, cases décochées, « Circuit terminé »), retour après la fin d'un repos (« Repos terminé il y a 0:40 », puis la séance enchaîne).
- **Reste pour l'étape 6** : version courte au départ, question de réserve et charge proposée, sélecteur d'étape de traction, genou-mur, meilleur temps au centième.

## Idées proposées, non implémentées

Aucune pour l'instant.
