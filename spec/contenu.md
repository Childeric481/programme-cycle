# C. Contenu sportif. Source de vérité

Tout ce qui suit se modélise dans `src/data/program.ts`, séparé de l'interface, et se vérifie par un test qui compare chaque exercice, chaque format, chaque repos, chaque compteur et chaque texte à ce document.

## C.1 Structure et calendrier de référence

Cinq séances sur un cycle de deux semaines.

| | Lun | Mar | Mer | Jeu | Ven | Sam | Dim |
|---|---|---|---|---|---|---|---|
| Semaine chargée | Travail | Travail | **Séance 1** | **Séance 2** | Travail | Travail | Travail |
| Semaine tranquille | Récupération | **Séance 3** | Travail | Travail | **Séance 4** | Libre | **Séance 5** |

| Séance | Titre | Lieu | Durée | Couleur |
|---|---|---|---|---|
| 1 | Bas du corps chargé | Salle | 65 min | Rouge |
| 2 | Haut du corps complet | Salle | 55 min | Bleu |
| 3 | Sprint | Piste | 70 min | Jaune |
| 4 | Fessier, mollets et épaules | Salle | 80 min | Vert |
| 5 | Puissance et portés | Salle | 60 min | Fonte |

Séances à forte demande nerveuse : 1, 3 et 5. Séances à faible demande : 2 et 4.

Lecture des tableaux de séance.
- **Format** : ce qui s'affiche en grand sur l'écran de l'exercice.
- **Repos** : en secondes, lancé automatiquement après chaque série validée.
- **Compteur** : nombre de séries à valider. Pour un superset, une série couvre les deux mouvements enchaînés.
- **Saisie** : champ(s) affiché(s) sous l'exercice, avec unité, pas des boutons +/− et libellé. « aucune » signifie pas de champ.
- **Palier** : augmentation proposée par la règle de progression (D.4). « +1 rép. » pour les mouvements au poids du corps. Vide quand la progression se fait en distance, en hauteur ou en temps.
- **Démo** : clé du lien de démonstration listé en C.8. Un superset peut avoir un lien par mouvement.
- **Note** : texte court affiché sous le format, toujours visible.

Chaque exercice reçoit aussi un volet « Pourquoi », replié par défaut, avec deux paragraphes, Intérêt et Exécution. Certains éléments d'échauffement en ont un aussi. Chaque séance a un texte « Rôle de la séance », affiché sur l'écran de détail.

## C.2 Séance 1. Bas du corps chargé

Semaine chargée, mercredi. Salle. 65 min.

**Rôle de la séance.** La séance qui signale au corps de conserver sa masse musculaire en période de restriction alimentaire, et qui construit la force absolue dont dépend tout le reste du programme. Si une seule séance devait survivre à une semaine catastrophique, c'est celle-ci ou la 3.

**Échauffement**

| Élément | Dose |
|---|---|
| Vélo ou rameur, allure facile | 5 min |
| Glute bridge au sol | 2 × 15 |
| Leg swings, avant-arrière puis latéraux | 10 / jambe |
| Pogo hops | 3 × 20, repos 45 s |
| Squat barre à vide | 2 × 10 |

**Corps de séance**

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Squat arrière | 4 × 6 | 150 | 4 | kg, pas 2,5 | +5 | squat | Garde 2 répétitions en réserve, jamais l'échec. |
| 2 | Hip thrust barre | 4 × 8 | 120 | 4 | kg, pas 2,5 | +5 | ht | |
| 3 | Soulevé de terre roumain | 3 × 8 | 120 | 3 | kg, pas 2 | +2 | rdl | 3 secondes à la descente. |
| 4 | Fentes croisées haltères | 3 × 10 / jambe | 90 | 3 | kg, pas 2 | +2 | curtsy | |
| 5 | Leg extension | 3 × 12 | 60 | 3 | kg, pas 2,5 | +5 | legext | |
| 6 | Curl ischios machine | 3 × 10 | 90 | 3 | kg, pas 2,5 | +5 | curl | |
| 7 | Tirage vertical poulie | 4 × 10 | 90 | 4 | kg, pas 2,5 | +2,5 | pulldown | |

**Volets**

- **Pogo hops** (échauffement). Intérêt : *Raideur de cheville et tendon d'Achille, le maillon qui restitue le plus d'énergie élastique en course. Coût de récupération quasi nul, ce qui permet de les placer en semaine chargée et de réveiller la cheville avant le travail lourd.* Exécution : *Rebonds sur place sur l'avant-pied, genoux quasi verrouillés, contact au sol le plus court possible. La hauteur importe peu, le temps de contact fait tout.*
- **Squat arrière**. Intérêt : *Le signal le plus fort qui existe pour conserver du muscle en période de restriction alimentaire. Il construit quadriceps et fessiers ensemble, avec la plus grosse charge du programme.* Exécution : *Réserve de 2 à 3 répétitions, jamais l'échec. 1 à 2 s de réarmement debout entre chaque répétition.*
- **Hip thrust barre**. Intérêt : *Charge le fessier en extension complète de hanche, exactement là où le squat le sollicite peu. Les deux sont complémentaires, pas redondants.* Exécution : *1 s de serrage en haut, bassin aligné aux épaules, menton rentré, côtes basses.*
- **Soulevé de terre roumain**. Intérêt : *La charnière de hanche. Ischios chargés en position d'allongement, chaîne postérieure entière du mollet aux érecteurs.* Exécution : *3 s à la descente. Dos neutre, genoux légèrement fléchis, haltères qui frôlent les jambes. C'est un mouvement de hanche, pas de dos.*
- **Fentes croisées haltères**. Intérêt : *Unilatéral chargé. La jambe arrière qui croise en diagonale met l'accent sur le fessier, grand et moyen, et révèle l'écart entre le côté fort et le côté faible, que le squat masque.* Exécution : *Pas arrière en diagonale derrière la jambe d'appui, genou avant aligné sur le pied, buste droit. Poussée dans le talon avant pour remonter.*
- **Leg extension**. Intérêt : *Isole le quadriceps près de l'extension complète, là où le squat le charge le moins. Renforce aussi le tendon rotulien, sollicité par les sauts et le sprint.* Exécution : *1 s de contraction en haut, 2 s à la descente, dos collé au dossier.*
- **Curl ischios machine**. Intérêt : *L'ischio a deux fonctions, hanche et genou. Le soulevé de terre roumain ne travaille que la première. Le curl comble le trou, et c'est l'assurance anti-claquage quand il y a du sprint dans le cycle.* Exécution : *2 s à la descente.*
- **Tirage vertical poulie**. Intérêt : *Premier des trois blocs de dos du cycle, les deux autres étant en séance 2. C'est ce cumul régulier qui construit le dos, pas une séance isolée. Ce tirage sert aussi de base à la future traction.* Exécution : *Poitrine vers la barre, épaules basses et loin des oreilles, aucun élan du buste.*

**Version courte.** Échauffement complet. Leg extension supprimée. Une série de moins sur chaque autre exercice.

| Exercice | Compteur complet | Compteur court |
|---|---|---|
| Squat arrière | 4 | 3 |
| Hip thrust barre | 4 | 3 |
| Soulevé de terre roumain | 3 | 2 |
| Fentes croisées haltères | 3 | 2 |
| Leg extension | 3 | supprimé |
| Curl ischios machine | 3 | 2 |
| Tirage vertical poulie | 4 | 3 |

## C.3 Séance 2. Haut du corps complet

Semaine chargée, jeudi. Salle. 55 min.

**Rôle de la séance.** La seule séance entièrement dédiée au haut du corps. C'est elle qui construit les épaules et le dos, donc directement la silhouette recherchée. Structure en quatre patterns fondamentaux : tirage vertical, poussée verticale, poussée horizontale, tirage horizontal. Puis l'isolation en fin. Rien à ajouter, rien à retirer.

**Échauffement**

| Élément | Dose |
|---|---|
| Rameur, allure facile | 5 min |
| Cercles de bras, wall slides, cat-cow | 10 chacun |
| Band pull-apart | 2 × 15 |

**Corps de séance**

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Tractions, variante en cours | 4 × 6-8 | 120 | 4 | Étape (sélecteur, voir C.9) + rép. sur la meilleure série | +1 rép. | traction | Arrêt 1 à 2 répétitions avant que la forme casse. |
| 2 | Développé militaire debout, haltères | 4 × 8 | 120 | 4 | kg par haltère, pas 1 | +1 | ohp | |
| 3 | Pompes | 3 × échec | 90 | 3 | rép. sur la meilleure série, pas 1 | +1 rép. | aucune | Chaque série jusqu'au moment où la forme casse. |
| 4 | Tirage bûcheron, un bras | 2 × 12 lourd + 2 × 15 léger | 90 | 4 | kg des séries lourdes, pas 2 | +2 | row | |
| 5 | Élévations latérales puis Oiseau (superset) | 3 × (15 + 15) | 60 | 3 | Élévations kg, pas 1. Oiseau kg, pas 1 | +1 / +1 | latraise, oiseau | |
| 6 | Curl biceps poulie puis Extension triceps poulie (superset) | 3 × (12 + 12) | 60 | 3 | Curl kg, pas 2,5. Extension kg, pas 2,5 | +2,5 / +2,5 | bras | |

**Volets**

- **Tractions, variante en cours**. Intérêt : *Le travail de traction proprement dit. La séance 1 charge le même pattern à la poulie, où la charge se règle au kilo près. Ici il se travaille au poids du corps, dans la position réelle. Deux angles complémentaires sur un même mouvement, ce qui accélère nettement l'arrivée de la première traction complète.* Exécution : *La variante et le palier sont fixés en amont de la séance. Chaque série s'arrête 1 à 2 répétitions avant la perte de qualité technique.*
- **Développé militaire debout, haltères**. Intérêt : *Force au-dessus de la tête, deltoïde antérieur et latéral. La version debout supprime le dossier : plus rien ne permet de cambrer pour tricher, et le tronc doit stabiliser la charge à chaque répétition. Le mouvement devient global au lieu de rester local à l'épaule.* Exécution : *Côtes basses, fessiers serrés, 1 s de réarmement entre les répétitions.*
- **Pompes**. Intérêt : *La poussée horizontale, pectoraux et triceps. Au poids du corps, donc directement transférable.* Exécution : *Inclinées sur un banc si besoin, inclinaison réduite au fil des semaines jusqu'au sol. Chaque série s'arrête quand la forme casse : bassin qui s'affaisse ou amplitude qui raccourcit.*
- **Tirage bûcheron, un bras**. Intérêt : *Épaisseur de dos, là où le tirage vertical donne la largeur. Unilatéral, donc il empêche le côté fort de compenser le côté faible.* Exécution : *Deux séries lourdes de 12, puis deux séries plus légères de 15. Genou et main en appui sur le banc, dos plat, coude qui remonte le long du corps vers la hanche.*
- **Élévations latérales puis Oiseau**. Intérêt : *Le deltoïde latéral donne la largeur d'épaule, le postérieur protège l'articulation et corrige la posture. Deux faisceaux différents, donc le superset est légitime : pendant que l'un travaille, l'autre récupère.* Exécution : *Élévations : charge légère, coudes souples, montée à hauteur d'épaule sans balancer. Oiseau : buste penché à l'horizontale, dos plat, haltères écartés vers l'extérieur coudes légèrement fléchis, 1 s de contraction en haut.*
- **Curl biceps poulie puis Extension triceps poulie**. Intérêt : *Agoniste et antagoniste : pendant que le biceps travaille, le triceps récupère, donc le superset est légitime. Les bras contribuent peu à la performance et beaucoup au rendu visuel. Placés en fin de séance, ils ne coûtent rien au reste du travail.* Exécution : *Coudes fixes le long du corps sur les deux mouvements, aucun élan du buste.*

**Version courte.** Échauffement complet. Une série de moins sur les quatre premiers exercices. Supersets conservés en entier.

| Exercice | Compteur complet | Compteur court |
|---|---|---|
| Tractions | 4 | 3 |
| Développé militaire | 4 | 3 |
| Pompes | 3 | 2 |
| Tirage bûcheron | 4 (2 lourdes + 2 légères) | 3 (2 lourdes + 1 légère) |
| Élévations latérales puis Oiseau | 3 | 3 |
| Curl puis Extension | 3 | 3 |

## C.4 Séance 3. Sprint

Semaine tranquille, mardi. Piste. 70 min.

**Rôle de la séance.** Explosivité et filière anaérobie alactique, c'est-à-dire l'effort maximal de moins de dix secondes. La seule qualité que le métier peut réclamer sans préavis. C'est aussi la séance qui construit le plus de densité osseuse et de raideur tendineuse, et celle qui donne la silhouette athlétique. Elle ne se saute jamais.

**Mise en route**

| Élément | Dose | Saisie |
|---|---|---|
| Footing très souple | 6 min | |
| Cheville, genou vers le mur, distance notée en cm | 2 × 10 / jambe | Genou-mur gauche cm, droite cm, pas 0,5 |
| Cheville, mollets debout au poids du corps, 3 s de descente | 2 × 12 | |
| Cheville, pogo hops | 2 × 20 | |
| Cheville, marche contre le mur avec montée de genou | 2 × 10 / jambe | |
| Éducatifs, skipping A et B, talons-fesses, jambes tendues | 2 × 20 m, repos 45 s | |
| Accélérations progressives | 3 × 40 m, repos 2 min | |

**Vitesse.** Sous-titre du bloc : 360 m à fond, plafond 450.

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Sprints 30 m, départ debout | 6 × 30 m | 180 | 6 | Meilleur temps, s, pas 0,01, facultatif | | aucune | À fond dès le premier. Retour en marchant. |
| 2 | Sprints 60 m | 3 × 60 m | 240 | 3 | aucune | | aucune | |
| 3 | Standing broad jump | 4 × 3 | 90 | 4 | Meilleur saut, cm, pas 5 | | broad | Un seul saut par répétition, 20 s entre les sauts. |
| 4 | Foulées bondissantes | 4 × 20 m | 90 | 4 | aucune | | aucune | |

**Volets**

- **Genou vers le mur** (mise en route). Intérêt : *Mesure et travaille la flexion dorsale de cheville. Une cheville qui ne fléchit pas empêche le tibia d'avancer sur le pied, le bassin recule et la course s'assoit. Repère : moins de 10 cm entre le gros orteil et le mur signale une cheville raide.* Exécution : *Pied à plat, talon au sol, genou poussé vers le mur au-dessus du petit orteil. Noter la distance en cm.*
- **Pogo hops** (mise en route). Même volet qu'en séance 1.
- **Marche contre le mur** (mise en route). Intérêt : *Correctif de posture. Corps en ligne droite incliné contre le mur, montée de genou alternée. Apprend à courir grande, bassin en avant, ce qui retire à la cheville une partie du travail qu'elle compense.*
- **Éducatifs** (mise en route). Intérêt : *Deux fonctions à la fois : réviser la mécanique de course et échauffer précisément les structures qui vont encaisser le sprint.*
- **Accélérations progressives** (mise en route). Intérêt : *La marche d'escalier entre l'échauffement et le maximal. Sauter cette étape, c'est le claquage d'ischio.* Exécution : *Trois quarts d'allure, montée progressive sur les 40 m.*
- **Sprints 30 m**. Intérêt : *La phase d'accélération pure, c'est-à-dire les premiers mètres. C'est la portion la plus utile en intervention et la plus exigeante en production de force.* Exécution : *Récupération complète, sinon ce n'est plus du travail de vitesse. Dès qu'une course est visiblement plus lente, le bloc est terminé, même s'il reste des répétitions.*
- **Sprints 60 m**. Intérêt : *La vitesse maximale une fois lancée, qui est une qualité différente de l'accélération et se travaille sur des distances plus longues.*
- **Standing broad jump**. Intérêt : *Puissance horizontale, mesurable au centimètre près. C'est l'indicateur de progression le plus lisible du programme.* Exécution : *20 s entre chaque saut, distance maximale à chaque essai.*
- **Foulées bondissantes**. Intérêt : *Le pont entre le saut et la course, et la pliométrie la plus transférable au sprint qui existe. Bond d'une jambe sur l'autre en cherchant l'amplitude maximale, exactement le geste de course poussé à l'extrême.* Exécution : *Chercher la distance par bond, pas la fréquence. Bras actifs, réception sous le bassin, buste droit. Environ 10 contacts par passage.*

**Version courte.** Mise en route complète, obligatoire. Sprints 30 m réduits à 4. Sprints 60 m supprimés. Broad jump conservé. Foulées bondissantes supprimées.

| Exercice | Compteur complet | Compteur court |
|---|---|---|
| Sprints 30 m | 6 | 4 |
| Sprints 60 m | 3 | supprimé |
| Standing broad jump | 4 | 4 |
| Foulées bondissantes | 4 | supprimé |

## C.5 Séance 4. Fessier, mollets et épaules

Semaine tranquille, vendredi. Salle. 80 min.

**Rôle de la séance.** La séance de volume. Charges plus légères, séries plus longues, sur les zones qui dessinent la silhouette : les hanches et les épaules. La taille marquée vient du contraste entre ces deux zones, plus du taux de masse grasse. Aucun exercice ne fait fondre le tour de taille localement.

**Échauffement**

| Élément | Dose | Saisie |
|---|---|---|
| Vélo facile | 4 min | |
| Cheville, genou vers le mur | 2 × 10 / jambe | Genou-mur gauche cm, droite cm, pas 0,5 |
| Cheville, mollets debout au poids du corps, 3 s de descente | 2 × 12 | |
| Cheville, pogo hops | 2 × 20 | |
| Glute bridge et band pull-apart | 15 chacun | |

**Fessier et jambes**

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Hip thrust puis Sumo RDL (superset) | 4 × (12 + 10) | 90 | 4 | Hip thrust kg, pas 2,5. Sumo RDL kg, pas 2 | +5 / +4 | ht4, sumordl | |
| 2 | Fentes croisées haltères | 3 × 12 / jambe | 90 | 3 | kg, pas 2 | +2 | curtsy4 | |
| 3 | Kickback 45° puis Kickback 90° (superset) | 3 × (15 + 15) / jambe | 60 | 3 | 45° kg, pas 1. 90° kg, pas 1 | +1 / +1 | kick45, kick90 | |
| 4 | Abduction hanche machine 3-3-3 | 3 × 3 unités | 60 | 3 | kg, pas 2,5 | +5 | abd | Une unité, c'est 3 répétitions, puis 3 pulsations en position ouverte, puis 3 s de maintien. 3 unités enchaînées font une série. |
| 5 | Leg curl | 3 × 15 | 90 | 3 | kg, pas 2,5 | +5 | legcurl | |
| 6 | Mollets assis machine puis Relevés de pointes (superset) | 4 × (25 + 20) | 60 | 4 | Mollets kg, pas 2,5 | +5 | calves | |

**Épaules**

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 7 | Élévations latérales puis Reverse pec-deck (superset) | 4 × (15 + 15) | 60 | 4 | Élévations kg, pas 1. Reverse pec-deck kg, pas 2,5 | +1 / +2,5 | latraise | |

**Circuit abdos.** Sous-titre : 3 tours, 1 min entre les tours. Un tour se valide d'un geste, chaque mouvement se coche. Compteur de 3 tours, repos 60 s entre les tours.

| Mouvement | Dose |
|---|---|
| Relevé de jambes, haltère tenu au-dessus de la tête | 12 |
| Crunch pieds en haut | 12 |
| Abs de côté, poids du corps | 15 / côté |
| Planche et twist du bassin | 12 / côté |
| Planche, touches d'épaule | 10 / côté |
| Gainage | 1 min |

**Volets**

- **Genou vers le mur** (échauffement). Même volet qu'en séance 3.
- **Hip thrust puis Sumo RDL**. Intérêt : *Deux mouvements de hanche sous deux angles. Le hip thrust charge le fessier en extension complète, le sumo RDL en position d'allongement, avec les adducteurs. Même zone, donc charges plus légères qu'en séance 1 : ici c'est le volume qui travaille.* Exécution : *Hip thrust : 1 s de serrage en haut, menton rentré, côtes basses. Sumo RDL : pieds larges, pointes ouvertes, dos neutre, la charge descend entre les jambes jusqu'à mi-tibia.*
- **Fentes croisées haltères**. Intérêt : *Deuxième dose d'unilatéral du cycle, en volume cette fois.* Exécution : *Pas arrière en diagonale derrière la jambe d'appui, genou avant aligné sur le pied, buste droit. Poussée dans le talon avant pour remonter.*
- **Kickback 45° puis Kickback 90°**. Intérêt : *Deux angles d'extension de hanche à la poulie. À 45°, le grand fessier. À 90°, sur le côté, la partie haute du fessier et le moyen fessier. Charges légères, contraction volontaire.* Exécution : *Buste penché, bassin fixe, jambe d'appui légèrement fléchie. 1 s de contraction en fin de mouvement, sans cambrer.*
- **Abduction hanche machine 3-3-3**. Intérêt : *Moyen fessier. C'est lui qui donne la largeur sur le côté de la hanche et la stabilité latérale, deux choses que le travail en ligne droite ne construit jamais.* Exécution : *Trois unités enchaînées sans relâcher la machine. Le maintien de 3 s se fait en position ouverte.*
- **Leg curl**. Intérêt : *Deuxième dose d'ischios du cycle. Avec du sprint au programme, deux expositions valent mieux qu'une.* Exécution : *2 s à la descente.*
- **Mollets assis machine puis Relevés de pointes**. Intérêt : *Le mollet et le tendon d'Achille encaissent l'essentiel des forces de contact au sprint. Les ignorer avec une séance de piste dans le cycle, c'est accepter une tendinopathie. Assis, c'est le soléaire qui travaille. Les relevés de pointes renforcent le muscle opposé, à l'avant du tibia.* Exécution : *Mollets : amplitude complète, 1 s en position basse. Relevés de pointes : dos au mur, talons au sol, pointes qui montent vers les tibias.*
- **Élévations latérales puis Reverse pec-deck**. Intérêt : *Deuxième exposition du deltoïde latéral et postérieur sur le cycle, la troisième arrive en séance 5. C'est cette accumulation régulière qui produit l'épaule, pas une séance isolée. Superset légitime : deux faisceaux différents.* Exécution : *Élévations : charge légère, contrôle total, coudes souples. Reverse pec-deck : poitrine contre le dossier, bras qui s'ouvrent à l'horizontale, omoplates serrées en fin de mouvement.*
- **Circuit abdos**. Intérêt : *Le tronc sous tous ses angles en une dizaine de minutes : flexion, inclinaison, rotation, anti-rotation et gainage. Placé en fin de séance, il ne coûte rien au travail lourd.*

**Version courte.** Échauffement complet. Une série de moins sur chaque exercice. Circuit abdos à 2 tours.

| Exercice | Compteur complet | Compteur court |
|---|---|---|
| Hip thrust puis Sumo RDL | 4 | 3 |
| Fentes croisées haltères | 3 | 2 |
| Kickback 45° puis 90° | 3 | 2 |
| Abduction 3-3-3 | 3 | 2 |
| Leg curl | 3 | 2 |
| Mollets puis Relevés de pointes | 4 | 3 |
| Élévations latérales puis Reverse pec-deck | 4 | 3 |
| Circuit abdos | 3 tours | 2 tours |

## C.6 Séance 5. Puissance et portés

Semaine tranquille, dimanche. Salle. 60 min.

**Rôle de la séance.** La séance la plus proche du métier : produire de la force vite, traîner, porter, tenir une position sous charge. L'explosif ouvre la séance, sur système frais, jamais en circuit. Un saut fatigué ne développe pas la puissance, il développe la tolérance à la fatigue et augmente le risque à la réception.

**Échauffement**

| Élément | Dose |
|---|---|
| Vélo facile | 5 min |
| Charnière de hanche à vide | 15 |
| Sauts verticaux sous-maximaux | 2 × 5 |

**Explosif.** Sous-titre : En premier, quand tu es fraîche.

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | Saut vertical, une jambe, départ à genoux | 4 × 3 / jambe | 120 | 4 | aucune | | aucune | Hauteur maximale à chaque saut, réception amortie. |
| 2 | Countermovement jump | 3 × 3 | 90 | 3 | aucune | | cmj | |
| 3 | Bonds latéraux, une jambe | 3 × 6 / jambe | 60 | 3 | aucune | | bonds | |

**Force et portés**

| # | Exercice | Format | Repos | Compteur | Saisie | Palier | Démo | Note |
|---|---|---|---|---|---|---|---|---|
| 4 | Squat Zercher | 3 × 8 | 120 | 3 | kg, pas 2,5 | +5 | zercher | Barre dans le creux des coudes, serviette autour. |
| 5 | Sled push | 5 × 20 m | 120 | 5 | Charge ajoutée, kg, pas 5 | +5 | aucune | |
| 6 | Farmer walk | 4 × 30 m | 120 | 4 | Charge par main, kg, pas 2 | +2 | farmer | |
| 7 | Élévations latérales haltères | 3 × 15 | 60 | 3 | kg, pas 1 | +1 | latraise | |
| 8 | Mollets assis machine | 4 × 12 | 60 | 4 | kg, pas 2,5 | +5 | calves | Lourd, 1 s en position basse. |
| 9 | Abduction debout à la poulie | 3 × 15 / jambe | 60 | 3 | kg, pas 2,5 | +2,5 | kick90 | |

**Volets**

- **Saut vertical, une jambe, départ à genoux**. Intérêt : *Départ à genoux, donc aucun contre-mouvement et aucun rebond élastique. C'est de la production de force concentrique pure, sur une jambe, ce qui complète le sprint au lieu de le doubler.* Exécution : *Repos complet entre les sauts. Cet exercice ne rentre jamais dans un circuit.*
- **Countermovement jump**. Intérêt : *Saut vertical avec contre-mouvement et réception au sol, donc travail élastique complet, ce que le départ à genoux ne fait pas.* Exécution : *Descente rapide en demi-squat puis remontée immédiate, hauteur maximale à chaque répétition. 15 à 20 s entre les sauts. Réception amortie, genoux dans l'axe.*
- **Bonds latéraux, une jambe**. Intérêt : *Le seul travail explosif du programme dans le plan latéral. Sprint et sauts verticaux sont tous les deux en ligne droite, alors qu'un changement de direction ou un déséquilibre à absorber se joue sur le côté. Sollicite aussi le moyen fessier en réactif.* Exécution : *Bond latéral sur une jambe, réception sur l'autre, enchaînement immédiat dans l'autre sens, comme un patineur. Réception stable avant de repartir.*
- **Squat Zercher**. Intérêt : *Charge portée devant, dans le creux des coudes. Le tronc lutte pour rester droit, ce qui en fait le squat le plus proche d'un port de charge réel. Deuxième dose de quadriceps et de fessiers du cycle.* Exécution : *Coudes serrés, buste vertical, descente contrôlée.*
- **Sled push**. Intérêt : *Poussée horizontale sous charge, sans phase excentrique donc sans courbatures. C'est le seul exercice qui charge lourd sans coûter en récupération, ce qui est décisif quand il n'y a que cinq séances par cycle.* Exécution : *Bras tendus, buste incliné vers l'avant, poussée continue sur toute la distance. Charge permettant de conserver la même vitesse du premier au dernier mètre.*
- **Farmer walk**. Intérêt : *Grip, trapèzes et tronc anti-inclinaison. C'est l'exercice de salle le plus proche d'un port de charge réel en déplacement.* Exécution : *Lourd, épaules basses, tronc gainé, aucune inclinaison latérale. La charge par main sur 30 m est l'indicateur de progression.*
- **Élévations latérales haltères**. Intérêt : *Troisième dose de deltoïde latéral du cycle. C'est l'accumulation régulière qui construit la largeur d'épaule.* Exécution : *Charge légère, coudes souples, montée à hauteur d'épaule sans balancer.*
- **Mollets assis machine**. Intérêt : *Le mollet et le tendon d'Achille encaissent l'essentiel des forces de contact au sprint. Les ignorer avec une séance de piste dans le cycle, c'est accepter une tendinopathie.* Exécution : *Lourd, amplitude complète, 1 s en position basse.*
- **Abduction debout à la poulie**. Intérêt : *Le moyen fessier, debout et sur une jambe, donc dans la position où il sert réellement.* Exécution : *Buste droit, bassin fixe, jambe qui monte sur le côté sans rotation du pied.*

**Version courte.** Échauffement complet. Bloc explosif réduit au seul saut vertical départ à genoux. Squat Zercher à 2 séries. Une série de moins au sled push et au farmer walk. Élévations, mollets et abduction conservés.

| Exercice | Compteur complet | Compteur court |
|---|---|---|
| Saut vertical, départ à genoux | 4 | 4 |
| Countermovement jump | 3 | supprimé |
| Bonds latéraux | 3 | supprimé |
| Squat Zercher | 3 | 2 |
| Sled push | 5 | 4 |
| Farmer walk | 4 | 3 |
| Élévations latérales | 3 | 3 |
| Mollets assis machine | 4 | 4 |
| Abduction debout | 3 | 3 |

Une version courte affiche les formats recalculés (« 3 × 6 » au lieu de « 4 × 6 »). Pour le tirage bûcheron, le format court est « 2 × 12 lourd + 1 × 15 léger ».

## C.7 Durées des versions courtes

À afficher sur le bouton de version courte : séance 1, 50 min. Séance 2, 45 min. Séance 3, 50 min. Séance 4, 60 min. Séance 5, 45 min.

## C.8 Liens de démonstration

Ouverts dans le navigateur, hors de l'application. Libellé « Voir le mouvement », ou « Voir » suivi du nom du mouvement pour un superset.

| Clé | Adresse |
|---|---|
| squat | https://musclewiki.com/fr-fr/exercise/barbell-squat?model=f |
| ht | https://musclewiki.com/fr-fr/exercise/machine-hip-thrust?model=f |
| rdl | https://musclewiki.com/fr-fr/exercise/dumbbell-romanian-deadlift?model=f |
| curtsy | https://musclewiki.com/fr-fr/exercise/curtsy-lunge?model=f |
| legext | https://musclewiki.com/fr-fr/exercise/machine-leg-extension?model=f |
| curl | https://musclewiki.com/fr-fr/exercise/machine-hamstring-curl?model=f |
| pulldown | https://musclewiki.com/fr-fr/exercise/machine-pulldown?model=f |
| traction | https://www.youtube.com/watch?v=XeErfmGSwfE |
| ohp | https://musclewiki.com/fr-fr/exercise/dumbbell-overhead-press?model=f |
| row | https://fr.pinterest.com/pin/773704411027442418/ |
| latraise | https://fr.pinterest.com/pin/227924431132101085/ |
| oiseau | https://fr.pinterest.com/pin/991917886693197255/ |
| bras | https://fr.pinterest.com/pin/610941505744709308/ |
| broad | https://fr.pinterest.com/pin/422212533840894553/ |
| ht4 | https://fr.pinterest.com/pin/6685099441992584/ |
| sumordl | https://www.youtube.com/shorts/66AKPxeXLoI |
| curtsy4 | https://fr.pinterest.com/pin/936678422504641505/ |
| kick45 | https://fr.pinterest.com/pin/8725793024607353/ |
| kick90 | https://fr.pinterest.com/pin/140806234963951/ |
| abd | https://fr.pinterest.com/pin/13440498884411433/ |
| legcurl | https://fr.pinterest.com/pin/8162843070097850/ |
| calves | https://fr.pinterest.com/pin/682365781046094601/ |
| cmj | https://fr.pinterest.com/pin/1001488035893290797/ |
| bonds | https://pin.it/6Ip7Q7708 |
| zercher | https://fr.pinterest.com/pin/146437425380955272/ |
| farmer | https://fr.pinterest.com/pin/512706738850502516/ |

## C.9 Onglet Règles

Sections dans cet ordre, textes tels quels. En pied d'onglet, le numéro de version.

**Rythme.** Le tableau de C.1, puis : *Le placement suit une règle simple : les séances les plus exigeantes nerveusement occupent les créneaux les plus frais. La séance 1 tombe le mercredi plutôt que le jeudi, pour que le pic de courbatures arrive sur une journée libre et non sur un poste de 12 h. Le lundi de la semaine tranquille reste vide. Il suit trois postes consécutifs et sert de récupération, pas de rattrapage. Le sprint tombe le mardi, après une journée pleine de repos, c'est-à-dire dans le meilleur état disponible du cycle. La séance 4 tombe le vendredi parce qu'elle est la seule que la fatigue de deux postes ne dégrade pas. La séance 5 tombe le dimanche, après un samedi libre, pour que le bloc explosif se fasse sur un système frais.*

**Progression des charges.** *+2,5 kg sur le haut du corps, +5 kg sur le bas du corps, dès que la dernière série passe avec plus de 2 répétitions en réserve. Sur les mouvements au poids du corps, une répétition s'ajoute avant toute augmentation de difficulté.*

**Progression vers la traction.** *Trois étapes. Le passage à l'étape suivante n'a lieu qu'une fois le critère rempli.*
1. *Tirage vertical poulie. Critère : 3 × 8 propres à 80 % du poids de corps.*
2. *Rowing inversé à la barre guidée, corps de plus en plus horizontal. Critère : 3 × 10 corps parallèle au sol.*
3. *Négatives. Menton au-dessus de la barre au départ, descente contrôlée en 5 s, 4 × 3. La première traction complète arrive de là.*

Le sélecteur d'étape de l'exercice « Tractions, variante en cours » propose ces trois étapes, plus une quatrième, « Traction complète ».

**Volume de sprint.** *La séance 3 contient 360 m courus à intensité maximale, échauffement non compris. La limite haute est 450 m. Au-delà, la vitesse chute et l'effort bascule dans la filière lactique, qui est une autre qualité et qui dégrade la technique.*

**Pliométrie : trois paliers d'intensité.** *Un contact au sol ne vaut pas un autre. Le plafond dépend du palier, et les trois se cumulent dans une même séance.*

| Palier | Exercices | Plafond par séance |
|---|---|---|
| Raideur | Pogo hops, skipping | 60 à 100 contacts, coût articulaire faible |
| Extensif | Foulées bondissantes, broad jump, countermovement jump | 40 à 80 contacts |
| Intensif | Bonds unilatéraux, et plus tard les sauts en contrebas | 20 à 40 contacts, jamais davantage |

**Explosif : jamais plus de volume.** *Une fois les plafonds atteints, la progression se fait en hauteur, en distance et en qualité de réception, jamais en nombre de séries. Toujours frais, en début de séance, jamais en circuit.*

**Sauts en contrebas : conditions d'entrée.** *Volontairement absents du premier cycle. Quatre critères avant de les introduire : huit semaines de pliométrie continue derrière, squat à environ un poids de corps, réception de countermovement jump stable et silencieuse, aucune douleur de genou ni de tendon. Les quatre remplis, ils remplacent les bonds unilatéraux en séance 5, 4 × 4 depuis 30 cm.*

**Le repos fait partie de la charge.** *Sur les sprints et sur le bloc explosif, raccourcir les repos ne rend pas la séance plus dure, il la rend inutile. Si le temps manque, la coupe se fait dans les exercices d'isolation.*

**Hiérarchie en cas de semaine difficile.** *Séance 4 sacrifiée en premier. Jamais la séance 2. Le calendrier laisse déjà huit jours entre deux expositions fortes des épaules et du dos, et sauter la séance 2 porterait cet intervalle à vingt-deux jours, ce qui annule le travail du haut du corps sur le cycle. Jamais la 1, la 3 ni la 5 non plus.*

**Version courte.** *Quand un poste a vidé la journée, la version courte passe avant le repos. L'échauffement n'est jamais réduit. Ce sont les dernières séries et l'isolation qui sautent, jamais le cœur de la séance.*

**Alimentation.** *1,8 à 2,2 g de protéines par kg de poids de corps, 7 à 9 h de sommeil. À maintenance calorique avec des protéines hautes, une personne peu entraînée peut gagner du muscle et perdre de la graisse en même temps : plus lent sur la balance, mais la récupération reste intacte et les charges montent réellement. En déficit, le programme ne change pas, la progression est simplement plus lente.*

**Point de contrôle à 8 semaines.** *Squat, hip thrust, développé militaire, étape atteinte sur la traction, charge de farmer walk, temps sur 30 m. Six indicateurs. S'ils montent, le programme fait son travail, quelle que soit la balance.*
