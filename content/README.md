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

## Pièges d'écriture YAML

- Une réplique qui **commence** par une balise de capture doit être entre guillemets : `- '[[HX-486-0412|cap.serial]].'` (sinon YAML croit lire une liste).
- Même chose pour une réplique qui commence par `{`, `*`, `&`, `!`, `%`, `@` ou `` ` ``.
- Dans une liste sur une ligne (`[a, b]`), une virgule sépare deux répliques, et une balise de capture casse la liste : pour les répliques, préférer la liste en colonne (`- …`).
