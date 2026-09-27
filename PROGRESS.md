# HELPLINE93 — Suivi du développement

## Jalon en cours

**J0 — Fondations** : révision 2 prête, **en attente du choix du niveau de sombres (A1, A2 ou A3)** pour clôturer le jalon.
Prochain jalon après validation : **J1 — Interface HelplineOS**.

## J0 — Fait

- [x] Projet Vite + React + TypeScript strict, ESLint, Prettier, Vitest.
- [x] Commandes : `npm run dev`, `npm run check` (typecheck + lint + format + tests + content:check), `npm run content:check`.
- [x] Thème : palette en variables CSS (`src/ui/theme/tokens.css`), tailles, reliefs, halo de focus.
- [x] Polices IBM Plex auto-hébergées (`assets/fonts/`), 4 familles.
- [x] Icônes provisoires néo-rétro sur grille 32 × 32, rendues en SVG net (18 icônes du MVP).
- [x] Curseurs ambre (flèche, main, texte, sablier, refus).
- [x] Scène logique 1920 × 1080 mise à l'échelle, bandes bleu nuit si le format diffère.
- [x] Moteur (`src/engine/`) : horloge injectable, bus d'événements typé, planificateur, état versionné avec langue `fr`, générateur aléatoire déterministe. 14 tests.
- [x] Audio : gestionnaire Howler, variations légères de hauteur et de volume, variantes tirées au hasard sans répétition immédiate, catégories de volume.
- [x] Kit feel : `feel.config.ts`, `useSound`, `useFeedback`, `Pressable`, `Button95`.
- [x] Libellés en français par clé (`src/ui/strings/fr.ts`, `t()`), pluriels et nombres via `Intl`.
- [x] Bac à sable `?sandbox` : chaque primitive, sons, icônes, curseurs, typographie, palette, aller-retour moteur → interface.
- [x] `content:check` minimal (YAML valide + identifiants uniques). Les schémas Zod complets arrivent en J2.

## Comment tester J0

1. `npm install` puis `npm run dev`, ouvrir l'adresse affichée.
2. L'écran d'accueil provisoire s'affiche. Cliquer **Ouvrir le bac à sable** (ou ajouter `?sandbox` à l'adresse).
3. Dans le bac à sable :
   - **Button95** : survoler, appuyer, garder appuyé (relief inversé, texte décalé), relâcher. Appuyer puis glisser hors du bouton : l'action est annulée. Cliquer **Désactivé** : son sourd + tremblement. **Bascule** reste enfoncée.
   - **Pressable** : cliquer les icônes (ressort à l'appui, rebond au relâchement, compteur). La dernière (estompée) est désactivée.
   - **Sons** : cliquer plusieurs fois le même bouton, la hauteur et le volume varient très légèrement.
   - **Moteur → interface** : **Envoyer un ping**, 1,5 s plus tard le voyant s'allume avec un son.
   - **Curseurs** : survoler chaque zone.
   - **Réglages** : **Animations réduites** (tremblements atténués, sons gardés), **Son coupé**.
4. Redimensionner la fenêtre : l'écran garde son format 16:9, avec des bandes bleu nuit.
5. Clavier : Tab pour naviguer (halo ambre), Entrée ou Espace pour appuyer.

## Décisions prises (J0)

- **TypeScript 6.0** (et non 7.0) : l'outil de lint (typescript-eslint) ne supporte pas encore la version 7.
- **Sons provisoires synthétisés** par un script du projet (`npm run sounds:generate`) : originaux, donc aucune question de licence. À remplacer en J7.
- **Icônes et curseurs** décrits comme des grilles de lettres dans `src/ui/icons/` (une lettre = un rôle de couleur du thème). Modifiables à la main, pixel par pixel.
- **Action au relâchement** (comme un vrai bouton de bureau) : l'appui donne le son et l'enfoncement, l'action part au relâchement, glisser dehors annule.
- **Garde-fous automatiques** :
  - ESLint refuse tout `<button>` brut et tout `onClick` sur un élément HTML hors de `src/ui/feel/`.
  - ESLint refuse `window`, `document`, `Date.now` et `Math.random` dans le moteur.
  - Des tests refusent toute couleur, taille, durée ou police écrite en dur hors du thème.
- **Réglages joueur** (son coupé, animations réduites) dans un petit store Zustand, prêt pour le futur Panneau de configuration.
- **Thème généré** : après une modification de `palette.ts` ou `cursorArt.ts`, lancer `npm run theme:generate`. Un test vérifie que les fichiers générés sont à jour.
- Outils en TypeScript exécutés directement par Node : **Node 22.18 ou plus récent** requis.
- Dépendances d'outillage ajoutées pour J0 (lint et formatage) : `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`, `prettier`, et les types `@types/*`.

## J0 — Révision 1 (retours de Loïc)

Validé tel quel : **boutons** et **icônes** (rendu et comportement).

- [x] Sons plus doux et feutrés :
  - **Appui** = l'ancien son de survol (fichiers identiques, même volume).
  - **Survol** : nouveau son à peine perceptible.
  - **Relâchement** : adouci aussi (plus bas que l'appui), sinon il serait devenu le son le plus fort.
  - **Refus** et **validation** : plus doux, plus graves, plus courts.
  - **Variations** : ±1,5 % en hauteur et ±4 % en volume (au lieu de ±5 % et ±10 %).
- [x] GDD : principe « Sons doux et feutrés, jamais agressifs… » ajouté en 5.1 et 6.5. Section 8.5 mise à jour avec les nouvelles variations.
- [x] Thème organisé par **rôles** (fond, surface, texte, accent…) : chaque palette remplit les mêmes rôles, icônes et curseurs compris.
- [x] Palette **A cuivre/pétrole** avec les ajouts demandés, et palette **B** (J0) conservée pour comparer.
- [x] Sélecteur A/B en haut du bac à sable, bascule en direct, choix mémorisé au rechargement.
- [x] Tableau des contrastes WCAG en direct dans le bac à sable. Un test automatique vérifie les minimums de la palette A.
- [x] L'audio ne démarre qu'au premier clic ou à la première touche : plus d'avertissement du navigateur dans la console.

### Palette A — répartition

| Rôle                                              | Couleur   | Origine                     |
| ------------------------------------------------- | --------- | --------------------------- |
| Fond du bureau                                    | `#143642` | palette de base             |
| Fenêtres, panneaux                                | `#263C41` | palette de base             |
| Relief clair                                      | `#4A473E` | palette de base             |
| Séparateurs                                       | `#38413F` | palette de base             |
| Bordures                                          | `#5C4D3C` | palette de base             |
| Texte désactivé                                   | `#6F523B` | palette de base             |
| Accent vif (icônes, dégradés)                     | `#B76935` | palette de base             |
| Accent profond (sélection, barre de titre active) | `#815839` | palette de base             |
| Texte (crème chaud)                               | `#EFDFC6` | **ajout**                   |
| Texte secondaire (sable)                          | `#BDA88C` | **ajout**                   |
| Info importante / capturable (cuivre clair)       | `#E9A263` | **ajout**                   |
| Alerte (rouge sourd)                              | `#D9656B` | **ajout**                   |
| Relief sombre, contours                           | `#0B232B` | **ajout** (pétrole profond) |

### Contrastes (palette A)

| Texte            | Fond                       | Rapport | Exigé                            |
| ---------------- | -------------------------- | ------- | -------------------------------- |
| Texte            | Fenêtres                   | 8,89:1  | 4,5:1 ✓                          |
| Texte            | Fond du bureau             | 9,80:1  | 4,5:1 ✓                          |
| Texte            | Accent profond (sélection) | 4,73:1  | 4,5:1 ✓                          |
| Texte secondaire | Fenêtres                   | 5,07:1  | 4,5:1 ✓                          |
| Texte secondaire | Fond du bureau             | 5,59:1  | 4,5:1 ✓                          |
| Info importante  | Fenêtres                   | 5,44:1  | 4,5:1 ✓                          |
| Info importante  | Fond du bureau             | 6,00:1  | 4,5:1 ✓                          |
| Alerte           | Fenêtres                   | 3,34:1  | 3:1 (signal) ✓                   |
| Accent vif       | Fenêtres                   | 2,82:1  | indicatif (jamais pour du texte) |
| Texte désactivé  | Fenêtres                   | 1,63:1  | indicatif (exempté par WCAG)     |

## J0 — Révision 2 (retours de Loïc)

Validé, ne plus toucher : sons, comportement des primitives, icônes (pour le moment), direction de la palette A.

- [x] Trois niveaux de sombres pour la palette A, sélectionnables en direct dans le bac à sable (avec la palette A actuelle comme référence). La palette B (ambre/violet) est retirée.
- [x] Tons clairs et moyens inchangés : cuivres, crème, sable, cuivre clair, alerte, bordures, texte désactivé.
- [x] Tons sombres (fond, fenêtres, reliefs, séparateurs) assombris en OKLCH : même teinte, luminosité réduite, écarts réguliers entre fond, fenêtres et reliefs.
- [x] Test automatique des contrastes pour chaque niveau.

| Rôle                    | A (actuelle) | A1        | A2        | A3        |
| ----------------------- | ------------ | --------- | --------- | --------- |
| Fond du bureau          | `#143642`    | `#0B2B35` | `#031D26` | `#001017` |
| Fenêtres, panneaux      | `#263C41`    | `#1E3337` | `#14262A` | `#09191C` |
| Séparateurs             | `#38413F`    | `#323A38` | `#262D2C` | `#19201E` |
| Relief clair            | `#4A473E`    | `#45423A` | `#38352D` | `#2A2821` |
| Relief sombre, contours | `#0B232B`    | `#041920` | `#010D13` | `#000407` |

| Contraste                     | A      | A1      | A2      | A3      |
| ----------------------------- | ------ | ------- | ------- | ------- |
| Texte sur fenêtres            | 8,89:1 | 10,13:1 | 11,97:1 | 13,74:1 |
| Texte sur fond du bureau      | 9,80:1 | 11,37:1 | 13,28:1 | 14,76:1 |
| Texte secondaire sur fenêtres | 5,07:1 | 5,77:1  | 6,82:1  | 7,83:1  |
| Info importante sur fenêtres  | 5,44:1 | 6,20:1  | 7,32:1  | 8,41:1  |
| Alerte sur fenêtres           | 3,34:1 | 3,80:1  | 4,49:1  | 5,16:1  |

## Points à valider par Loïc

1. **Niveau de sombres** : A1, A2 ou A3. Ensuite : palette unique, suppression du sélecteur, mise à jour du GDD (6.2, pilier 4), de `CLAUDE.md` et de ce fichier, puis préparation de la pull request vers `main`.
2. **Texte désactivé** `#6F523B` (question de la révision 1, toujours ouverte) : très peu lisible, et encore moins sur les fonds sombres. Proposition : `#8A7358`.

## À faire ensuite (J1, après validation)

- Écran « Allumer le poste » → séquence BIOS → bureau.
- `Window95`, barre des tâches, menu Démarrer, horloge du shift.
- Zone de notification, fenêtre « Appel entrant », app Téléphone.
- Visionneuse, Carnet, coquilles des autres applications.
