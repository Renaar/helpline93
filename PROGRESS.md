# HELPLINE93 — Suivi du développement

## Jalon en cours

**J0 — Fondations** : terminé et validé. Prochain jalon : **J1 — Interface HelplineOS**.

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
