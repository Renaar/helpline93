# HELPLINE93 — Instructions pour Claude Code

## Le projet en bref
Jeu web narratif (thriller, 1993, San Aurelio, ville fictive de la côte Ouest américaine). Le joueur est opérateur de nuit d'une hotline informatique et joue **uniquement** à travers **HelplineOS**, un système d'exploitation fictif en plein écran (1920 × 1080 logiques).
Style **néo-rétro** : structure d'un OS de 1993, finition d'une interface moderne (section 6). Palette ambre / gris (gris chauds très sombres, texte crème, accents ambrés ; section 6.2). Polices IBM Plex (auto-hébergées). Icônes originales sur grille pixel, en SVG. Pas d'effet CRT, pas de décor autour de l'OS.

**Source de vérité : `GDD_HELPLINE93.md`.** Le lire en entier au début de chaque jalon. Section 10 = règles détaillées.

## Priorités
1. **L'interface est le jeu** : chaque interaction doit être ultra satisfaisante (charte 5.1, kit feel 8.3).
2. **Le système de communication** avec l'appelant (section 4.2).
3. Le reste. Jauge d'urgence (4.10) : plus tard.

## Méthode
- Un jalon à la fois (section 9). Jalon en cours : voir `PROGRESS.md`.
- Début de session : annoncer le plan. Fin de session : résumé + **comment tester** + questions ouvertes. Mettre à jour `PROGRESS.md`.
- En cas de doute : **demander à Loïc** (en français, simplement), avec 2-3 options et une recommandation.
- Demander avant de changer la stack, l'architecture, le format du contenu ou d'ajouter une dépendance.
- Le jeu doit toujours démarrer sans erreur. `npm run check` doit passer avant de livrer.

## Branches et fusions
- main ne contient que des jalons validés par Loïc : c'est toujours une version stable et jouable.
- Chaque jalon démarre sur une nouvelle branche créée depuis main à jour, nommée jN (j2, j3…). Une seule branche par jalon.
- Fusion dans main uniquement quand Loïc écrit explicitement « JN validé ». Jamais avant, jamais de ta propre initiative.
- Procédure de fusion : vérifier le contenu de la branche → `npm run check` → merge commit (`--no-ff`) → `npm run check` sur main → tag annoté `jN-valide` → push de main et du tag.
- Interdits sur main : squash, rebase, force-push, commits directs (sauf la mise à jour de PROGRESS.md après une fusion).
- Ne jamais supprimer de branche ni de tag sans l'accord de Loïc.
- En cas de conflit : s'arrêter, expliquer, proposer des options.
- Pour revenir en arrière : `git revert` sur le commit de fusion (jamais de réécriture d'historique).

## Stack
TypeScript strict · Vite · React · Motion · Zustand · Zod + YAML · Howler.js + Web Audio · Vitest

## Règles non négociables
- Moteur (`src/engine/`) pur, déterministe, testé, sans DOM. Aucune logique de jeu dans les composants React.
- Jamais de `<button>` brut ni de `onClick` non instrumenté : passer par le kit feel (`Pressable`, `Button95`, `Draggable`, `Capturable`…).
- Chaque élément interactif : survol, enfoncé, son varié, refus si désactivé, animation interruptible, curseur adapté.
- Animations sur `transform` / `opacity` uniquement. 60 fps.
- Aucune couleur/taille/police en dur (thème) ; aucune durée/volume en dur (`feel.config.ts`).
- Aucun texte joueur dans le code : `content/` ou `src/ui/strings/fr.ts`.
- Aucun HUD hors fiction. Aucun effet CRT (seule exception : l'avance rapide VHS du saut dans le temps, GDD 6.1). Aucun décor hors de l'OS.
- Aucun nom/logo/police Microsoft ni marque réelle. Assets sous licence commerciale, tracés dans `assets/CREDITS.md`.

## Langues
Code, identifiants, commentaires, commits : anglais. Textes du jeu, échanges avec Loïc, `PROGRESS.md` : français.
Jeu en français uniquement pour l'instant, **mais prêt pour la localisation** : libellés par clé, pas de concaténation, formats via `Intl`, mises en page tolérantes (8.10).

## Commandes (à créer en J0)
- `npm run dev` — serveur de développement
- `npm run check` — typecheck + lint + tests + content:check
- `npm run content:check` — validation du contenu YAML
- `?sandbox` — bac à sable du kit feel · `?mission=<id>` — mission isolée en debug
