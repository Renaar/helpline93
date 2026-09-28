# HELPLINE93 — Suivi du développement

## Jalon en cours

**J3 — Nuit 1 jouable (MVP)** : premier jet livré sur la branche `j3`, **à tester par Loïc**. Fusion dans `main` seulement après « J3 validé ». Contrôle prévu (GDD 9.3) : playtest par 2 à 3 personnes extérieures.

## J3 — Nuit 1 jouable (premier jet)

### Fait

- [x] **Planificateur de nuit** (moteur, testé) : appels à heure fixe (`at`) ou N minutes de jeu après la fin du précédent (`after_previous`), appels conditionnels (`when`), e-mails au démarrage et à heure fixe, fin du service à 06:00. Le saut vers la fin du service n'est possible qu'une fois **tous les tickets clôturés**.
- [x] **Messagerie** : boîte de réception, lecture, pastille des non-lus, icône qui clignote doucement dans la zone de notification, petit carillon à l'arrivée d'un e-mail (qui peut tomber en plein appel).
- [x] **Base Clients** : recherche par nom, société, ville, numéro de série ou modèle (accents et majuscules ignorés), fiche détaillée (matériel, historique des contacts, remarques). Une info capturée de type numéro de série, nom ou lieu ouvre la Base Clients ; les autres ouvrent le manuel (chat et Carnet).
- [x] **Rapport de fin de service** à 06:00 : appels pris, tickets clôturés, pannes résolues, durée moyenne, journal d'activité. Bouton « Fermer la session ».
- [x] **Sauvegarde automatique** en fin de nuit (navigateur) : nom de l'opérateur, variables, flags, confiance, notes libres du Carnet. À l'ouverture de session, le nom est prérempli et on peut choisir parmi les nuits atteintes (dès qu'il y aura une nuit 2).
- [x] **Contenu, premier jet de la nuit 1** (selon le synopsis validé) :
  - 22:20 **Doris Kowalski**, fleuriste : imprimante LX-80 qui imprime des signes (p. 20, commutateur SW1-5 sur ON). Appel « tutoriel ».
  - ~22:40 **Kevin Tran**, étudiant : « Disque non formaté » (p. 24, SETUP, lecteur 1.44M). Piège : FORMAT A: efface son mémoire, il raccroche.
  - ~23:00 **Bernard Fleury** : trois bips (inchangé, + une ligne sur Marc).
  - ~23:30 **Conrad Adler** : procédure 7-B, sifflement d'alimentation, fiche client incohérente (appels à 23 h 50, R-14 à répétition, « Ne pas facturer. Voir M. Kessler. »). Il dicte R-14 ; un autre code fait monter la suspicion.
  - E-mails : Kessler (accueil, règles, départ de Marc), service informatique à 23:30 (compte de Marc désactivé, notes archivées), inconnu à 04:10 (« Marc aussi notait tout. »).
  - Manuel : 7 pages (p. 1 accueil, p. 5 codes de résolution, p. 12 bips, p. 20 imprimantes, p. 24 disquettes, p. 31 cavaliers, p. 40 alimentation). 11 codes. 8 fiches clients.
- [x] `content:check` vérifie aussi les nuits, e-mails et fiches (références, e-mails jamais envoyés, missions hors de toute nuit). GDD 7.9 complété (v1.8), `content/README.md` aussi.
- [x] Tests : 187 (dont chaque mission de la nuit jouée avec ses mauvaises réponses, et la nuit entière de 22:00 au rapport).

### Comment tester

1. `npm run dev`, ouvrir `http://localhost:5173/` et jouer normalement : **Allumer le poste**, taper son nom.
2. Lire l'e-mail de Kessler (icône enveloppe dans la zone de notification, ou Messagerie).
3. Ouvrir le Téléphone, **Attendre le prochain appel** : Doris appelle à 22:20. Enchaîner les 4 appels (le bouton sert aussi entre les appels).
4. Essayer la Base Clients : capturer un numéro de série, puis recliquer dessus. Pour Adler : regarder la fiche HX-486-0007.
5. Après le dernier appel et la dernière clôture : attendre jusqu'à 04:10 (e-mail), puis 06:00 : rapport, **Fermer la session**, rallumer : le nom est prérempli.
6. Pour rejouer depuis zéro : effacer les données du site dans le navigateur (ou fenêtre privée).
7. Raccourcis : `?boot=skip` (nuit 1 directement), `?mission=m.n01_04` (un appel seul, sans nuit).

### Décisions prises (à valider)

1. **Fin de service** : elle attend que tous les tickets soient clôturés (sinon le saut vers 06:00 est bloqué).
2. **Rapport** puis **Fermer la session** : le poste redémarre (écran « Allumer le poste »), la sauvegarde est faite juste avant.
3. **Recherche par capture** : numéro de série, nom, lieu → Base Clients ; le reste → manuel.
4. Les **notes libres du Carnet** passent d'une nuit à l'autre ; les indices capturés, non (ils sont propres à la nuit).
5. Champs de fiche client écrits comme des nombres (`since: 1991`) acceptés tels quels.

### Questions ouvertes

- Le premier jet des dialogues te convient-il (ton de Doris, stress de Kevin, froideur d'Adler) ? Tout est à retoucher librement dans `content/`.
- Faut-il qu'un e-mail arrivé pendant un appel se signale plus fort (son plus présent) ?

---

## Jalons terminés

| Jalon                             | État                                                                  | Fusion dans `main`     | Tag                              |
| --------------------------------- | --------------------------------------------------------------------- | ---------------------- | -------------------------------- |
| **J0 — Fondations**               | ✅ terminé, validé par Loïc, fusionné                                 | merge commit `2ae1fbb` | `j0-valide`                      |
| **J1 — Interface HelplineOS**     | ✅ terminé, validé par Loïc (effet VHS compris), fusionné             | merge commit `7e02b48` | `j1-valide`                      |
| **J2 — Système de communication** | ✅ terminé, validé par Loïc (palette ambre / gris comprise), fusionné | merge commit `e2a5378` | `j2-valide` (à pousser par Loïc) |

Branches d'origine conservées : `claude/loving-johnson-w3ytfi` (J0), `claude/j1-interface-helplineos` (J1), `j2` (J2).

### Retour de Loïc sur J2

Validé, **ne plus toucher** : recherche dans la doc qui débloque les lignes de dialogue (fausses pistes comprises) ; choix multiples dans INSTRUIRE ; auto-organisation des fenêtres au décroché ; redimensionnement des fenêtres ; palette ambre / gris.

À ajuster :

- [x] **Frappe du chat ~25 % plus rapide** (`TYPING` dans `src/engine/config.ts` : 23 ms par caractère au lieu de 30, délais de réponse et entre messages raccourcis). Les pauses de suspense écrites dans les missions ne changent pas.
- [x] **Échelle générale à 85 %** (choix de Loïc) : textes, espacements, boutons, barres (titre 30 px, tâches 44 px), tailles des fenêtres. Les icônes pixel gardent leurs tailles pour rester nettes.
- [x] **Nouvelle mise en scène de l'appel** (proposée par Loïc) :
  - au décroché, la fenêtre Téléphone laisse place à un **widget dans la barre des tâches** : voyant, ligne, numéro, durée de l'appel, **Attente / Reprendre** et **Raccrocher** ;
  - disposition automatique : **Chat à gauche, Visionneuse au centre, Carnet à droite** (les captures y volent) ;
  - le ticket se remplit en coulisse ; **à la fin de l'appel, HelpDesk s'ouvre en récapitulatif** pour choisir le code et clôturer.
  - GDD 5.4 et 8.4 mis à jour (v1.7).

#### Comment tester

1. `npm run dev`, puis `http://localhost:5173/?mission=m.n01_03` (F9 masque le débogage).
2. Décrocher : Chat, Visionneuse et Carnet se rangent ; le widget d'appel apparaît en bas à droite, avec la durée qui tourne.
3. Capturer « 3 bips » : l'info vole vers le Carnet. Mettre en attente puis reprendre depuis le widget.
4. Résoudre l'appel (p. 12, ouvrir le boîtier, barrette 2) : à la fin, le ticket s'ouvre au centre avec les codes ; choisir R-07, clôturer.
5. Vérifier que tout est plus compact mais lisible (menu Démarrer, Visionneuse, onglets).

Pour plus tard : l'humeur de l'appelant est une bonne base pour des répliques alternatives (itération future sur le contenu narratif, rien à changer pour l'instant).

---

## J2 — Système de communication (livraison validée)

### Fait

- [x] **Nouvelle palette ambre / gris** (demandée par Loïc), à la place de cuivre / pétrole : valeurs dans `src/ui/theme/palette.ts` (variables et curseurs regénérés), aucun composant modifié. Choix de Loïc sur les deux couples qui échouaient :
  - fonds qui portent du texte (sélection, barre de titre active, feutre, tampons) : **ambre assombri calculé** `#7B521D` (60 % ambre profond + 40 % fond), 5,44:1 ;
  - alerte éclaircie de `#B4432E` à **`#C8533B`** (3,11:1 sur les fenêtres).
  - Reliefs adaptés : `#4A4036` (clair) et `#14110E` (sombre). Nouveau rôle **Succès** `#6E7F4A`. GDD 6.2 (v1.6) et `CLAUDE.md` mis à jour.
- [x] **Format du contenu** : schémas Zod complets (pages, questions et instructions, appelants, missions, conditions `when`, effets `then`, codes de résolution). Un seul chargeur (`src/content/bundle.ts`) sert au jeu et à `content:check`.
- [x] **`npm run content:check`** vérifie aussi : références cassées (appelant, question, instruction, page, capture, code), balises de capture mal formées ou inconnues, paramètres des instructions (`{slot}` ↔ `params`), valeurs impossibles dans `param`. Avertissements (sans bloquer) : capture jamais balisée, question locale jamais débloquée, instruction sans réponse par défaut en dernier (GDD 7.11), pas de règle `default` à la clôture, flag testé mais jamais posé, mission qui ne peut pas finir en `resolved`.
- [x] **Moteur de dialogue** (pur, testé) : première réponse dont le `when` est vrai ; répliques de repli (« hors sujet », « déjà dit », réaction aux options GÉRER) ; humeur de −2 à +2 ; rythme de frappe (longueur du message × vitesse de l'appelant × humeur, pauses de suspense, indicateur « l'appelant écrit… ») ; fin d'appel par l'appelant (`end_call`) ; mise en attente ; raccrochage par l'opérateur.
- [x] **Chat Opérateur** : transcription, trois verbes en onglets (**Demander / Instruire / Gérer**), options groupées par origine (base, puis pages dans l'ordre de consultation), pastille sur un onglet qui reçoit du nouveau, options « Déjà dit », refus (son + tremblement) tant que l'appelant répond.
- [x] **La doc débloque les options** : une page restée ~1 s à l'écran dans la Visionneuse compte comme consultée. Ses questions et étapes (affichées en bas de la page : « Checklist de diagnostic », « Étapes d'intervention ») s'envolent vers le chat, avec un petit carillon, puis brillent un instant.
- [x] **Instructions paramétrées** : la ligne s'ouvre en place (« Retirez la barrette en position [1] [2] [3] [4] »), Envoyer seulement quand la valeur est valide. Mauvaise valeur = autre réponse, jamais de blocage.
- [x] **`<Capturable>`** (kit feel) : soulignement discret au survol, trait de feutre + son au clic, l'info s'envole vers le ticket et le Carnet (petit son de stylo). Second clic : recherche du mot-clé dans la Visionneuse. Dans le Carnet, cliquer un indice fait la même recherche.
- [x] **HelpDesk** : ticket ouvert automatiquement au décroché (n° 1041, 1042…), champs remplis par les captures, clôture par code **après** la fin de l'appel (liste des codes, tampon « CLOS · R-07 »), onglet Historique.
- [x] **Mode debug `?mission=m.n01_03`** : passe le démarrage, fait sonner la mission, panneau d'état ouvert (humeur, flags, variables, captures, questions, instructions, pages, ticket). Boutons « Appel : <mission> » dans le panneau de débogage.
- [x] **Contenu** : mission « Trois bips » (appelant Bernard Fleury), pages p.12 (bips BIOS, la bonne piste) et p.31 (cavaliers, la fausse piste), questions de base, options GÉRER, 10 codes de résolution.
- [x] 6 nouveaux sons (message reçu, envoi, feutre, option débloquée, tampon, stylo), tous doux et sous le niveau des sons ponctuels existants.
- [x] **Correction d'un défaut de J1** : cliquer une fenêtre pour la mettre au premier plan remettait ses listes à zéro (la Visionneuse remontait en haut du manuel). Seul l'empilement change désormais.
- [x] Tests : 168 (dont chaque condition `when`, chaque effet `then`, et « Trois bips » joué de bout en bout avec ses mauvaises réponses).

### Comment tester

1. `npm run dev`, puis ouvrir `http://localhost:5173/?mission=m.n01_03` (la touche **F9** masque le panneau de débogage).
2. **Décrocher** : les fenêtres se rangent (chat, visionneuse, ticket, téléphone). Bernard Fleury écrit.
3. Cliquer **« 3 bips »** dans son message : trait de feutre, l'info vole vers le ticket (champ Symptômes).
4. Dans la Visionneuse, ouvrir **p. 12 Codes sonores BIOS** et attendre une seconde : les nouvelles questions / étapes s'envolent vers le chat.
5. Demander **« Les bips sont-ils longs ou courts ? »**, capturer « courts ».
6. Instruire **« Retirez la barrette… »** _avant_ d'ouvrir le boîtier (il proteste), puis **« Ouvrez le boîtier »**, puis la barrette **2** : suspense, « IL DÉMARRE ! », l'appelant raccroche.
7. Dans HelpDesk : choisir **R-07**, **Clore le ticket** : tampon.
8. Mauvaises réponses à essayer (aucune ne bloque) : p. 31 et ses cavaliers (JP5 surtout), redémarrer deux fois, barrettes 1, 3 ou 4, questions répétées, GÉRER, mise en attente puis reprise, raccrocher en plein appel puis clôturer avec un autre code.
9. `?sandbox` : nouvelle section **Capturable** et les 6 nouveaux sons.

### Décisions prises (validées avec J2)

1. **Options GÉRER** : identifiants `g.` (absent du tableau GDD 7.4) et liste dans `content/docs/base.yaml` (calmer : humeur +1 la première fois ; récapituler ; faire patienter). Chaque appelant peut avoir sa réaction (`fallback.manage`).
2. **Numéro de l'appelant** : champ `phone` (facultatif) dans la fiche appelant, affiché à l'arrivée de l'appel.
3. **Une page compte comme consultée** après ~1 s à l'écran (réglage `viewer.consultDwellMs`). Les pages lues avant l'appel ne comptent pas : il faut les (re)garder pendant l'appel.
4. **Un échange à la fois** : on ne peut pas répondre tant que l'appelant écrit (évite le « clic-tout »).
5. **Clôture du ticket seulement après la fin de l'appel**.
6. **Contenu lu au lancement** (YAML validé au démarrage) au lieu d'un bundle JSON préparé au build (GDD 7.2) : même résultat pour le joueur, plus simple tant que le contenu est petit. À revoir en J8 (publication).
7. Glisser-déposer d'une capture vers la recherche : remplacé pour l'instant par le clic (un second clic cherche).

### Questions tranchées

- Rythme de frappe : un peu trop lent (réglage à faire, voir « À ajuster »).
- Humeur : répliques alternatives écrites par le rédacteur (`when: { mood: … }`), dans une itération future du contenu.

---

## J1 — Révision 3 (retours de Loïc)

Validé : l'effet VHS (« on comprend qu'on avance ») ; la réorganisation des fenêtres au décroché.

- [x] **« ▶▶ » au centre de l'écran** pendant le saut (72 px, lisible sans être envahissant).
- [x] **Plus de grattement de disque à l'ouverture des apps** : il parasitait. Le sablier reste ; le disque ne s'entend plus qu'au démarrage du poste (BIOS, ouverture de session). GDD 5.1 mis à jour.
- [x] **Fenêtres redimensionnables à la main** par les 4 bords et les 4 coins : curseurs pixel dédiés (doubles flèches), poignée visuelle en bas à droite, sons de prise / pose, taille minimale 360 × 200, la fenêtre ne sort jamais du bureau. La nouvelle taille est conservée quand on déplace la fenêtre. Calcul testé (`resizeRect`). GDD 8.3 mis à jour.
  - Cas qui gênait : après avoir raccroché, le Téléphone gardait la taille compacte de la disposition d'appel et cachait l'historique ; il suffit maintenant de l'agrandir.

### Comment tester la révision 3

1. `npm run dev`, ouvrir `/?boot=skip`.
2. Déplier **Débogage** (en bas au centre), **Simuler un appel**, décrocher : les fenêtres se réorganisent.
3. Raccrocher, puis agrandir le Téléphone en tirant son bord haut (ou un coin) : l'historique apparaît. Le déplacer ensuite : il garde sa taille. Essayer de le réduire au maximum : il s'arrête à la taille minimale.
4. Ouvrir des apps : sablier, sans bruit de disque.
5. **Programmer un appel (+15 min)**, puis **Attendre le prochain appel** : « ▶▶ » au centre pendant l'effet VHS.

---

## J1 — Révision 2 (retours de Loïc)

Validé, ne plus toucher : durée du saut (2,5 s), son du saut, délai de 60 s avant le saut automatique ; comportement des fenêtres ; séquence de boot ; feeling général. Nuit de démonstration : pas nécessaire.

- [x] **Effet « avance rapide VHS » pendant le saut dans le temps** (2,5 s, synchronisé avec l'horloge et le son) : bandes horizontales nettes qui défilent, léger tremblement / décalage horizontal de l'écran, luminosité légèrement modulée, indicateur « ▶▶ » discret en haut au centre, puis retour net à l'image normale. Avec « Animations réduites » : simple fondu discret. Réglages : `vhs` dans `feel.config.ts`. Aperçu dans `?sandbox`.
- [x] GDD : exception unique à « aucun effet CRT » inscrite en 6.1 (avec renvois en 2.2, 5.1, 8.4 et 10.6), et rappelée dans `CLAUDE.md`.
- [x] GDD : **glossaire** en tête (Helpline93, HelplineOS, Heltron Computer Corp., Nightline / NL, San Aurelio). Version 1.5.
- [x] **Règle « Nightline »** appliquée (voir le bilan ci-dessous).
- [x] Console propre même quand l'ordinateur est réglé en « animations réduites » : les retours de refus, l'enfoncement et le tremblement VHS animent maintenant des valeurs de mouvement (la bibliothèque Motion affichait un avertissement sinon).
- [x] Changements trouvés dans la copie de travail en début de session, conservés et intégrés : panneau de débogage toujours disponible sur le serveur de développement, **F9** pour le masquer ou l'afficher.

### Bilan « Nightline »

| Endroit                                        | Texte                                             | Décision                                                                                    |
| ---------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| En-tête du manuel (`content/docs/manual.yaml`) | « Service de nuit « Nightline » — usage interne » | Gardé (demandé)                                                                             |
| En-tête de l'app Téléphone                     | « Standard · Service Nightline »                  | **Retiré** (visible en permanence dans une app principale) → « Standard · Service de nuit » |
| Mots-clés de la page p.01                      | `nightline`                                       | **Retiré** (une recherche « nightline » y menait directement)                               |
| Poste NL-04, lignes NL-01 à NL-03              | « NL »                                            | Gardé (demandé)                                                                             |

Aucune occurrence dans l'écran de boot, le logo, les noms d'applications, les titres de fenêtres ou la barre des tâches.

### Comment tester la révision 2

1. `npm run dev`, ouvrir `/?boot=skip`.
2. Ouvrir le Téléphone, déplier **Débogage** (en bas au centre), **Programmer un appel (+15 min)**, puis **Attendre le prochain appel** : regarder l'effet VHS pendant le saut.
3. Dans `?sandbox`, section « Avance rapide VHS » : **Lancer l'effet** ; activer « Animations réduites » et relancer pour voir le fondu.

---

## J1 — Révision 1 (retours de Loïc)

Validé, ne plus toucher : comportement des fenêtres (ouverture, déplacement, focus, réduction, fermeture), séquence de boot (y compris la possibilité de la passer), feeling général.

- [x] **Sons répétitifs beaucoup plus discrets** : clavier redessiné (un seul petit « tic » étouffé, à peine audible), page de la Visionneuse plus courte et plus douce, nouveau son très bref pour aller à une page depuis le sommaire ou un résultat de recherche.
- [x] **Règle des sons répétitifs** (GDD 6.5) : chaque son est déclaré répétitif ou ponctuel ; un test vérifie que le plus fort des répétitifs (survol, clavier, pages) reste sous le plus doux des ponctuels.
- [x] **Horloge du shift en temps réel** : 22:00, puis 1 minute de jeu = 1 minute réelle.
- [x] **Appels programmés en minutes de jeu** (préparation du planificateur de nuit J3, GDD 7.9).
- [x] **Saut vers le prochain événement**, mis en scène : l'horloge défile en accélérant puis en ralentissant pendant 2,5 s, s'éclaire en cuivre, avec un tic-tac feutré ; puis l'appel sonne.
  - Bouton **« Attendre le prochain appel »** dans l'app Téléphone (grisé pendant un appel ou si rien n'est prévu).
  - **Saut automatique** après 60 s sans aucune action (souris, clavier, molette), jamais pendant un appel. Réglage : `clock.autoSkipIdleMs` dans `feel.config.ts`.
- [x] GDD mis à jour : 2.2 et 4.1 (temps du service), 6.5 (sons répétitifs), 9.3 (piste de refonte graphique au J7). Version 1.4.
- [x] Panneau de débogage replié par défaut et déplaçable (il cachait le bouton du Téléphone).

### Comment tester la révision 1

1. `npm run dev`, puis ouvrir `/?debug&boot=skip` (ou faire l'allumage complet avec `/?debug`).
2. **Sons** : taper dans le Carnet ou la recherche de la Visionneuse, tourner les pages, cliquer le sommaire.
3. **Horloge** : ouvrir le Téléphone. Le bouton « Attendre le prochain appel » est grisé (rien de prévu).
4. En bas au centre, déplier **Débogage**, cliquer **Programmer un appel (+15 min)** : le bouton du Téléphone devient actif. Le cliquer : l'horloge défile jusqu'à l'appel, qui sonne.
5. Décrocher, raccrocher, programmer un appel (+45 min), puis **ne plus toucher à rien pendant une minute** : le saut se fait tout seul.

### Note pour plus tard

- **Refonte graphique** : piste à évaluer après le playtest du MVP (inscrite au J7 dans le GDD 9.3). Rien à faire d'ici là.

---

## J1 — Interface HelplineOS : premier jet

### Livré

- **Allumage** : écran « Allumer le poste » (clac d'interrupteur, ronronnement du PC synthétisé en direct), séquence BIOS (lignes qui apparaissent, mémoire qui compte, bip, disque qui démarre), ouverture de session avec le **nom de l'opérateur** (GDD 3.3), puis bureau. Échap, Entrée ou un clic passe le BIOS.
- **Moteur** : horloge du shift (22:00 ; temps réel depuis la révision 1), 3 lignes téléphoniques (sonnerie, décrocher, attente, reprise, raccrocher, historique), mise en attente automatique quand on prend un autre appel. Tout est testé.
- **Fenêtres (`Window95`)** : ouverture avec latence d'époque (sablier + grattement de disque, 0,26 à 0,65 s), fenêtre qui se déploie depuis son icône, déplacement par la barre de titre avec inertie légère, focus (barre de titre cuivrée), réduction dans son bouton de barre des tâches, restauration, fermeture, empilement. Sons pour chaque geste.
- **Bureau** : icônes (un clic sélectionne, double-clic ouvre), barre des tâches (un bouton par fenêtre : focus, réduire, restaurer), menu Démarrer (toutes les apps, « Arrêter le poste »), zone de notification (téléphone qui clignote quand une ligne sonne, plus vite si urgent), horloge du shift.
- **Téléphone** : fenêtre « Appel entrant » qui glisse depuis le coin, app Téléphone (voyants par ligne, boutons, historique), sonnerie répétée, disposition automatique au décroché (Chat à gauche, Visionneuse à droite, ticket et téléphone en bas).
- **Visionneuse** : sommaire par chapitre, signets, recherche insensible aux accents (résultats, extraits, surlignage dans la page), pages continues façon document imprimé (papier crème, tampon de révision), page précédente / suivante avec bruit de page, zoom de 75 % à 150 %.
- **Carnet** : onglets Indices (vide jusqu'à J2) et Notes libres (son de clavier).
- **Coquilles** : Chat Opérateur, HelpDesk (ticket de l'appel en cours), Messagerie, Base Clients.
- **Kit feel** : `Window95`, `useDrag` (glisser corrigé de l'échelle, sons prise / pose), `TextField` (son de clavier, refus quand plein), `TypedText`, `IconButton`, voyants à 5 modes. Tous présents dans `?sandbox`.
- **Sons** (toujours doux et feutrés) : interrupteur, disque, bip BIOS, fenêtres, menu, prise / pose, clavier, page, sonnerie, décrocher, raccrocher, attente. Les sons validés du J0 sont inchangés.

### Comment tester J1

1. `npm run dev`, ouvrir l'adresse affichée.
2. Cliquer **Allumer le poste**, regarder (ou passer) le BIOS, taper un nom, **OK** (essayer aussi OK avec un nom vide : refus).
3. Sur le bureau : double-cliquer les icônes, déplacer les fenêtres (lâcher en mouvement pour sentir l'inertie), réduire / restaurer par la barre des tâches, fermer, ouvrir depuis **Démarrer**.
4. **Visionneuse** : naviguer par le sommaire, les flèches, le zoom ; poser un signet ; onglet Recherche, taper « mémoire ».
5. **Appels** : ouvrir `/?debug` (panneau « Débogage » en haut à droite), **Simuler un appel**, décrocher depuis la fenêtre « Appel entrant ». Puis simuler un 2e appel (urgent), le prendre depuis le Téléphone : la ligne 1 passe en attente. Reprendre, raccrocher, regarder l'historique.
6. **Démarrer › Arrêter le poste** : retour à l'écran éteint.
7. Raccourci de développement : `/?boot=skip` va directement au bureau.

### Décisions prises (J1)

- **Fenêtre « Appel entrant »** : elle ne s'affiche pas quand l'app Téléphone est ouverte à l'écran (elle en couvrait les boutons). Le voyant de ligne, la sonnerie et l'icône de la barre des tâches prennent le relais.
- **Pages de manuel provisoires** dans `content/docs/` (format GDD 7.5) pour tester la Visionneuse, avec un schéma Zod minimal vérifié par `content:check`. Le schéma complet (questions, instructions) arrive en J2.
- **Touches narratives discrètes** (validées, règle précisée en révision 2) : « Poste NL-04 » à la connexion, codes de ligne NL-01 à NL-03, « Service de nuit « Nightline » — usage interne » en tête du manuel (GDD 1.4 et glossaire).
- **Arrêter le poste** revient à l'écran éteint ; la session (heure, appels, fenêtres) est conservée si on rallume.
- Pas de redimensionnement des fenêtres ni de déplacement des icônes du bureau (absents du GDD) : à ajouter si le test le demande.

### Validation

J1 validé par Loïc après la révision 3, puis fusionné dans `main` (tag `j1-valide`).

---

## J0 — Fondations : ✅ terminé et validé par Loïc

Branche : `claude/loving-johnson-w3ytfi`.

### Livré

- Projet Vite + React + TypeScript strict, ESLint, Prettier, Vitest.
- Commandes : `npm run dev`, `npm run check` (typecheck + lint + format + tests + content:check), `npm run content:check`, `npm run theme:generate`, `npm run sounds:generate`.
- Thème par **rôles** (fond, surface, texte, accent…), palette **cuivre / pétrole** niveau A1 (GDD 6.2), contrastes vérifiés par un test.
- Polices IBM Plex auto-hébergées (4 familles).
- 18 icônes et 5 curseurs en pixel art (grille 32 × 32), rendus en SVG net aux couleurs du thème.
- Scène logique 1920 × 1080 mise à l'échelle, bandes pétrole si le format diffère.
- Moteur pur : horloge injectable, bus d'événements typé, planificateur, état versionné (langue `fr`), aléatoire déterministe.
- Audio Howler : sons doux et feutrés, variations très légères (±1,5 % hauteur, ±4 % volume), démarrage au premier geste du joueur.
- Kit feel : `feel.config.ts`, `useSound`, `useFeedback`, `Pressable`, `Button95`.
- Libellés en français par clé (`fr.ts`, `t()`), pluriels et nombres via `Intl`.
- Bac à sable `?sandbox` : chaque primitive, sons, icônes, curseurs, typographie, palette, contrastes, aller-retour moteur → interface.
- `content:check` minimal (YAML valide + identifiants uniques).

### Décisions prises

- **TypeScript 6.0** (typescript-eslint ne supporte pas encore la 7.0).
- **Sons provisoires synthétisés** par un script du projet : originaux, sans licence tierce. À remplacer en J7.
- **Icônes et curseurs** = grilles de lettres (une lettre = un rôle de couleur), modifiables à la main.
- **Action au relâchement** des boutons ; glisser hors du bouton annule.
- **Garde-fous automatiques** : ESLint refuse `<button>` brut et `onClick` non instrumenté, et refuse DOM, `Date.now` et `Math.random` dans le moteur ; les tests refusent couleurs, tailles, durées et polices en dur hors du thème, et vérifient que les fichiers générés sont à jour.
- **Sons** : « doux et feutrés, jamais agressifs » (GDD 5.1 et 6.5). Appui = son validé par Loïc ; survol à peine perceptible ; relâchement plus doux que l'appui.
- **Palette** : cuivre / pétrole, sombres niveau A1, texte désactivé `#8A7358`. Palettes B (ambre / violet) et A2/A3 écartées.
- Outils TypeScript exécutés directement par Node : **Node 22.18+** requis.
