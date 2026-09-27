# HELPLINE93 — Suivi du développement

## Jalon en cours

**J1 — Interface HelplineOS** : ✅ **validé par Loïc, sous réserve de l'effet VHS** du saut dans le temps (révision 2, à valider).
Prochain jalon après validation : **J2 — Système de communication**.
Branche : `claude/j1-interface-helplineos` (partie de J0, PR J0 : https://github.com/Renaar/helpline93/pull/1).

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

### Point à valider par Loïc

1. **Effet VHS** du saut dans le temps (révision 2) : lisibilité, intensité des bandes et du tremblement.

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
