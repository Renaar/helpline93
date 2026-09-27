# HELPLINE93 — Suivi du développement

## Jalon en cours

**J0 — Fondations** : terminé, **en attente de validation par Loïc**.
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
- [x] Audio : gestionnaire Howler, variations ±5 % hauteur / ±10 % volume, variantes tirées au hasard sans répétition immédiate, catégories de volume.
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
   - **Sons** : cliquer plusieurs fois le même bouton, la hauteur et le volume varient.
   - **Moteur → interface** : **Envoyer un ping**, 1,5 s plus tard le voyant s'allume avec un son.
   - **Curseurs** : survoler chaque zone.
   - **Réglages** : **Animations réduites** (tremblements atténués, sons gardés), **Son coupé**.
4. Redimensionner la fenêtre : l'écran garde son format 16:9, avec des bandes bleu nuit.
5. Clavier : Tab pour naviguer (halo ambre), Entrée ou Espace pour appuyer.

## Décisions prises (J0)

- **TypeScript 6.0** (et non 7.0) : l'outil de lint (typescript-eslint) ne supporte pas encore la version 7.
- **Sons provisoires synthétisés** par un script du projet (`npm run sounds:generate`) : originaux, donc aucune question de licence. À remplacer en J7.
- **Icônes et curseurs** décrits comme des grilles de lettres dans `src/ui/icons/` (une lettre = une couleur du thème). Modifiables à la main, pixel par pixel. Les curseurs sont convertis en SVG par `npm run cursors:generate`.
- **Action au relâchement** (comme un vrai bouton de bureau) : l'appui donne le son et l'enfoncement, l'action part au relâchement, glisser dehors annule.
- **Garde-fous automatiques** :
  - ESLint refuse tout `<button>` brut et tout `onClick` sur un élément HTML hors de `src/ui/feel/`.
  - ESLint refuse `window`, `document`, `Date.now` et `Math.random` dans le moteur.
  - Des tests refusent toute couleur, taille, durée ou police écrite en dur hors du thème.
- **Réglages joueur** (son coupé, animations réduites) dans un petit store Zustand, prêt pour le futur Panneau de configuration.
- Outils en TypeScript exécutés directement par Node : **Node 22.18 ou plus récent** requis.
- Dépendances d'outillage ajoutées pour J0 (lint et formatage) : `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`, `globals`, `prettier`, et les types `@types/*`.

## Points à valider par Loïc

1. **Ressenti des boutons** : enfoncement, rebond, tremblement de refus. Trop ? Pas assez ? (Tout se règle dans `src/ui/feel/feel.config.ts`.)
2. **Son au survol** : un « tic » très discret est joué au survol. Le garder, l'adoucir ou le supprimer ?
3. **Icônes provisoires** : la direction (documents sur papier ambre, violet pour les objets « système ») convient-elle ?

## À faire ensuite (J1, après validation)

- Écran « Allumer le poste » → séquence BIOS → bureau.
- `Window95`, barre des tâches, menu Démarrer, horloge du shift.
- Zone de notification, fenêtre « Appel entrant », app Téléphone.
- Visionneuse, Carnet, coquilles des autres applications.
