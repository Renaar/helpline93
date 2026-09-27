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

Validation : `npm run content:check` (analyse YAML + identifiants uniques en J0 ; schémas complets en J2).
