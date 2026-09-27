# HELPLINE93 — Suivi du développement

## Jalon en cours

**J1 — Interface HelplineOS** : livré, **en attente du test « game feel » de Loïc** (10 minutes sans contenu).
Branche : `claude/j1-interface-helplineos` (partie de J0, PR J0 : https://github.com/Renaar/helpline93/pull/1).

---

## J1 — Interface HelplineOS : livré, à tester

### Livré

- **Allumage** : écran « Allumer le poste » (clac d'interrupteur, ronronnement du PC synthétisé en direct), séquence BIOS (lignes qui apparaissent, mémoire qui compte, bip, disque qui démarre), ouverture de session avec le **nom de l'opérateur** (GDD 3.3), puis bureau. Échap, Entrée ou un clic passe le BIOS.
- **Moteur** : horloge du shift (22:00, 1 minute de jeu = 3 s réelles), 3 lignes téléphoniques (sonnerie, décrocher, attente, reprise, raccrocher, historique), mise en attente automatique quand on prend un autre appel. Tout est testé.
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
- **Touches narratives discrètes** (à valider) : « Poste NL-04 · Service de nuit » à la connexion, « Standard · Service Nightline » et codes de ligne NL-01 à NL-03 dans le Téléphone, « Service de nuit « Nightline » — usage interne » en tête du manuel (GDD 1.4).
- **Arrêter le poste** revient à l'écran éteint ; la session (heure, appels, fenêtres) est conservée si on rallume.
- Pas de redimensionnement des fenêtres ni de déplacement des icônes du bureau (absents du GDD) : à ajouter si le test le demande.

### Points à valider par Loïc (test « game feel » de 10 minutes)

1. **Ressenti des fenêtres** : latence d'ouverture, déploiement depuis l'icône, inertie au lâcher, réduction. Trop lent, trop rapide ? (`feel.config.ts`)
2. **Sons du J1** : lesquels sont trop présents ou trop discrets ? (Sonnerie, clavier, disque, fenêtres…)
3. **Rythme du BIOS** et **horloge** (1 minute de jeu = 3 s).
4. **Touches « Nightline »** ci-dessus : on garde ?

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
