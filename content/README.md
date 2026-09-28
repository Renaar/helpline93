# Contenu du jeu

Tout le texte du jeu (missions, pages du manuel, e-mails, appelants, fiches clients, codes) vit ici, en YAML. Voir la section 7 du GDD.

Arborescence prévue :

```
content/
├── nights/     # Déroulé de chaque nuit
├── missions/   # Un fichier par appel
├── docs/       # Pages du manuel de procédures
├── callers/    # Personnalités des appelants
├── clients/    # Fiches de la Base Clients
├── emails/     # E-mails
├── files/      # Fichiers du disque virtuel
└── codes/      # Codes de résolution
```

Validation : `npm run content:check` — syntaxe YAML, schémas, identifiants uniques, références cassées, balises de capture, paramètres des instructions, codes de résolution. Les avertissements (capture jamais balisée, question locale jamais débloquée…) n'empêchent pas de jouer.

## Où écrire quoi

- `nights/n01.yaml` : le déroulé de la nuit (appels à heure fixe ou `after_previous`, e-mails au démarrage et à heure fixe).
- `missions/` : un fichier par appel ; `callers/` : les personnalités (répliques de repli).
- `docs/` : les pages du manuel, avec leurs questions (`questions`) et étapes (`instructions`).
- `emails/`, `clients/`, `codes/` : e-mails, fiches de la Base Clients, codes de résolution.
- Tester une mission seule : `?mission=m.n01_02`. Toute la nuit : partir de l'écran « Allumer le poste », ou `?boot=skip`.

## Pièges d'écriture YAML

- Une réplique qui **commence** par une balise de capture doit être entre guillemets : `- '[[HX-486-0412|cap.serial]].'` (sinon YAML croit lire une liste).
- Même chose pour une réplique qui commence par `{`, `*`, `&`, `!`, `%`, `@` ou `` ` ``.
- Dans une liste sur une ligne (`[a, b]`), une virgule sépare deux répliques, et une balise de capture casse la liste : pour les répliques, préférer la liste en colonne (`- …`).
