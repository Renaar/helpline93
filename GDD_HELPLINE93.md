# HELPLINE93 — Game Design Document

> Version 1.4 — temps du service en temps réel avec sauts mis en scène, sons répétitifs discrets (J1)
> Destinataire final : Claude Code (implémentation de l'interface et des systèmes)

---

## 1. Vision

### 1.1 Pitch

**San Aurelio, côte Ouest, hiver 1993.** Tu es le nouvel opérateur de nuit de la hotline de **Heltron Computer Corp.**, un fabricant local d'ordinateurs. Ton travail : décrocher, écouter, consulter les procédures dans la Visionneuse, guider les clients pas à pas, puis clore le ticket avec le bon code de résolution.

Mais certains appels arrivent à des heures étranges. Certains clients ont des numéros de série qui n'existent pas. Et ton prédécesseur, Marc, a disparu sans laisser d'adresse.

Peu à peu, tu comprends que la hotline sert de **relais à un réseau clandestin** hérité de la guerre froide. Leurs « pannes » sont des messages codés. Et chaque fois que tu as suivi la procédure à la lettre… **tu leur as obéi sans le savoir.**

### 1.2 Piliers

| # | Pilier | Ce que ça implique |
|---|--------|-------------------|
| 1 | **La procédure comme gameplay** | Le plaisir vient de bien faire : chercher, régler, valider, attendre le résultat. |
| 2 | **La double lecture** | Chaque document, code ou appel a un sens banal ET un sens caché. |
| 3 | **Tension sans game over** | Les erreurs ne font jamais recommencer : elles changent l'histoire. |
| 4 | **Néo-rétro** | Structure 1993, finition 2026 : l'ossature d'un OS façon Win95 (HelplineOS) rendue avec la netteté, la typographie et la fluidité d'une interface moderne. Palette cuivre / pétrole : sombres pétrole profonds, texte crème, accents cuivrés. **Aucun filtre CRT.** Voir section 6. |
| 5 | **L'interface EST le jeu** | **Tout se passe dans HelplineOS**, en plein écran : pas de décor autour, pas de bureau physique. Aucun autre moyen d'agir : chaque clic, glissement, frappe doit être ultra satisfaisant à voir, entendre et manipuler. Priorité n°1 de l'implémentation. |

### 1.3 Références

- *Keep Talking and Nobody Explodes* : guider quelqu'un avec une documentation
- *IronNest*, *PVKK* : procédure tactile, attente du résultat
- *Papers, Please* : routine de bureau qui glisse vers le dilemme moral
- *Hypnospace Outlaw*, *Emily is Away* : simulation de système d'exploitation, chat d'époque
- *Her Story*, *Return of the Obra Dinn* : déduction du joueur, carnet d'indices

### 1.4 Fiction : ce qui est vrai, ce qui est inventé

- **Lieu :** **San Aurelio**, grande ville côtière **fictive** de l'Ouest américain, à mi-chemin entre Los Angeles, Miami et Seattle : palmiers et néons sur le front de mer, pluie et brouillard la nuit, zones industrielles et quartiers tech en périphérie. L'État n'est jamais nommé.
- **Inspiration historique :** les réseaux clandestins « stay-behind » de la guerre froide (Gladio, P-26…), révélés en Europe au début des années 1990. Le jeu imagine leur équivalent américain, resté actif.
- Tout le reste est **fictif** : Heltron Computer Corp., le réseau **Nightline**, les personnages, les quartiers, les entreprises.
- **Nightline, caché en pleine vue :** pour le joueur, « Nightline » ressemble d'abord au nom interne du service de nuit de la hotline. Le mot apparaît dès la nuit 1 dans des éléments anodins (en-tête d'une procédure, nom d'un dossier, signature d'un e-mail, code de ligne dans l'app Téléphone). Ce n'est qu'à l'acte II qu'il comprend que le mot désigne le réseau, et qu'il le relit partout.
- **Convention de « doublage » :** les personnages s'expriment en français (comme un film doublé), mais le décor reste américain : noms propres, adresses, numéros de téléphone à 10 chiffres, dollars, unités impériales dans les fiches techniques si utile.

---

## 2. Boucle de jeu

### 2.1 Micro-boucle : un appel (3 à 8 min)

1. **Sonnerie** → l'icône Téléphone clignote dans la barre des tâches, une fenêtre « Appel entrant » s'ouvre ; le joueur décroche.
2. **Ticket** → un ticket s'ouvre automatiquement (numéro client, heure, produit).
3. **Écoute** → l'appelant décrit son problème dans le chat (typing indicator, rythme réaliste).
4. **Recherche** → le joueur consulte les procédures (Visionneuse) et la Base Clients.
5. **Guidage** → le joueur répond par :
   - des **choix de répliques** (ce qu'il dit) ;
   - des **valeurs exactes** qu'il saisit ou règle (numéro de page, code, position de cavaliers, référence de pièce).
6. **Attente** → l'appelant exécute (« … ok, je redémarre »). Silence, sons, suspense.
7. **Résultat** → ça marche, ça échoue, ou quelque chose d'inattendu se passe.
8. **Clôture** → le joueur choisit un **code de résolution** (ex. `R-14 : remplacement alimentation`).

> 🔑 **Mécanique centrale :** le code de résolution est le **canal secret**. Pour le réseau, `R-14` n'est pas une alimentation : c'est un ordre. Au début le joueur l'ignore. Plus tard, il peut **choisir délibérément** quel code transmettre.

### 2.2 Macro-boucle : une nuit (20 à 30 min)

1. **Boot** du poste (séquence BIOS, puis bureau HelplineOS).
2. **E-mail de début de shift** : consignes du chef, notes internes, parfois un message anormal.
3. **4 à 6 appels**, entrecoupés de temps morts.
4. **Temps morts** : lire les e-mails, fouiller les fichiers, annoter le Carnet, relire les procédures.

**Le temps du service** — il passe comme dans la vraie vie :
- Le service commence toujours à **22:00**.
- Pendant les appels et l'exploration, l'horloge avance **en temps réel** : 1 minute de jeu = 1 minute réelle.
- Entre deux appels, quand il ne se passe rien, l'horloge **saute jusqu'au prochain événement programmé**. Le saut est mis en scène : l'horloge défile vite pendant 2 à 3 s avec un son discret, puis l'événement arrive.
- Le saut se déclenche de deux façons : le bouton discret **« Attendre le prochain appel »** de l'app Téléphone, ou **automatiquement après un délai d'inactivité** (réglable dans `feel.config.ts`). Jamais de saut pendant un appel, ni pendant que le joueur lit, tape ou fouille : toute action remet le délai à zéro.
- Les délais du format de nuit (`at`, `after_previous`, section 7.9) sont en **minutes de jeu**. Une nuit reste ainsi autour de 20 à 30 minutes réelles.
5. **Fin de shift** : rapport automatique (tickets clos, temps moyen) + journal d'activité.
6. **Conséquences** visibles la nuit suivante (nouveaux e-mails, pages de procédures modifiées, appelants qui reviennent).

### 2.3 Méta-progression

- **Carnet du joueur** : indices collectés automatiquement + notes libres.
- **Compréhension du code** : le joueur déchiffre progressivement la table de correspondance des codes.
- **Variables d'état** (invisibles au joueur) :

| Variable | Sens | Monte quand… |
|----------|------|-------------|
| `reputation` | Estime de Heltron | Tickets bien résolus, rapides |
| `suspicion` | Méfiance du réseau envers toi | Codes déviés, fouilles, retards |
| `awareness` | Ce que le joueur a compris | Indices trouvés, décodages réussis |
| `trust_<pnj>` | Relation avec chaque PNJ | Choix de dialogue, services rendus |

- **Flags** par mission (`mission_07_code_devie`, etc.) pour les embranchements.

---

## 3. Structure narrative

### 3.1 Découpage : 9 nuits en 3 actes (3 à 5 h de jeu)

**Acte I — Routine (nuits 1 à 3)**
- Vrai support technique : imprimantes, disquettes, cavaliers, mémoire.
- Anomalies subtiles : un appelant réclame la « procédure 7-B » absente des procédures… qui apparaît la nuit suivante.
- Premiers e-mails mentionnant Marc, « parti précipitamment ».

**Acte II — Doute (nuits 4 à 6)**
- Le joueur découvre un dossier caché de Marc sur le disque (fichiers, notes, début de table de codes).
- Il comprend que certains codes de résolution déclenchent des actions dans le monde réel (on les voit dans la presse, les e-mails, les appels suivants).
- Premiers choix conscients : obéir, dévier un code, ou enquêter.

**Acte III — Choix (nuits 7 à 9)**
- Le réseau prépare une opération. Le joueur est désormais un maillon clé.
- La nuit 9 converge vers une fin selon les variables et les flags.

### 3.2 Fins (4)

| Fin | Condition principale | Résumé |
|-----|----------------------|--------|
| **Rouage** | Obéissance, `awareness` basse ou choix d'obéir | Tu gardes ton poste. L'opération a lieu. Tu ne sauras jamais tout. |
| **Sabotage** | Codes déviés au bon moment, `suspicion` maîtrisée | L'opération échoue de l'intérieur. Personne ne sait que c'est toi. |
| **Fuite** | Preuves réunies + contact avec une journaliste | L'affaire éclate dans la presse. Heltron ferme. |
| **Disparition** | `suspicion` trop haute | Comme Marc. Le prochain opérateur trouvera *ton* dossier caché. |

### 3.3 Personnages (premier jet)

- **Le joueur** : opérateur de nuit, nouveau. Pas de nom imposé (saisi au boot).
- **M. Kessler** : chef de service, communique uniquement par e-mail. Froid, précis.
- **Marc** : prédécesseur disparu, présent à travers ses fichiers et ses notes.
- **Les appelants réguliers** : clients ordinaires (comiques, attachants) et « clients » du réseau (trop calmes, trop précis).
- **Une journaliste** (à définir) : contact possible dans l'acte II.

---

## 4. Systèmes

### 4.1 Réception des cas (dispatch)

- Le joueur **ne passe jamais d'appel**. Il attend qu'un cas lui soit transmis.
- Le standard transfère les appels : sonnerie, voyant de ligne qui clignote, bref message système (« Ligne 2 — appel transféré »).
- Entre deux appels, le temps s'écoule en temps réel (horloge du shift) : c'est le moment d'explorer. Quand le joueur a fini, il peut **attendre le prochain appel** (bouton de l'app Téléphone) : l'horloge saute, de façon mise en scène, jusqu'à l'appel suivant. Après un long moment d'inactivité, ce saut se fait tout seul (voir 2.2).
- Deux types d'appels :

| Type | Signal | Règle |
|------|--------|-------|
| **Libre** | Sonnerie normale, voyant cuivré | Pas de limite de temps. L'appelant attend patiemment. |
| **Urgent** | Sonnerie stridente, voyant rouge rapide | Jauge de situation dynamique (voir 4.10). Situation perdue = conséquence narrative (l'appelant raccroche, panique, agit seul). |

- Tout minuteur est **diégétique** : jamais de compte à rebours en HUD. Il se lit dans l'interface (voyant de ligne qui accélère dans l'app Téléphone, icône qui clignote dans la barre des tâches, appelant qui écrit en fragments, sons qui montent).

### 4.2 Communication avec l'appelant (système central — priorité n°2 après l'interface)

**Principe :** les appels sont une **transcription écrite** dans le Chat Opérateur (aucune voix). Le joueur communique par répliques choisies, mais **ce sont ses découvertes dans la documentation qui débloquent les bonnes questions**. Objectif : empêcher le « clic-tout » et faire de la doc le cœur du diagnostic.

#### 4.2.1 Trois verbes

| Verbe | Rôle | Source des options |
|-------|------|--------------------|
| **DEMANDER** | Poser une question à l'appelant | Questions de base toujours disponibles + questions **débloquées par la doc** |
| **INSTRUIRE** | Donner une étape à exécuter | Étapes des **procédures consultées**, avec paramètres à saisir (position, code, valeur) |
| **GÉRER** | Calmer, reformuler, faire patienter, mettre en attente | Toujours disponible ; agit sur le rythme et la relation |

- L'interface du chat présente les trois verbes comme des onglets/sections distincts de la zone de réponse.
- Questions de base (toujours présentes) : décrire le problème, numéro de série, modèle, depuis quand, ce qui a été fait avant.

#### 4.2.2 La doc débloque les questions

- Chaque page de procédure contient une **checklist de diagnostic** (questions) et des **étapes d'intervention** (instructions).
- Consulter une page ajoute ses questions/étapes au menu du chat, avec une animation : la ligne « glisse » de la Visionneuse vers la zone de réponse du chat + son de validation.
- Les options débloquées restent disponibles jusqu'à la fin de l'appel (liste qui s'enrichit, triée par page d'origine).
- Conséquence voulue : **impossible de poser la bonne question sans avoir trouvé la bonne page.**

#### 4.2.3 Capture d'informations

- Dans les messages de l'appelant, les **informations clés sont cliquables** (n° de série, message d'erreur, symptôme, nom, lieu, référence).
- Survol : soulignement discret. Clic : surlignage type feutre + son + la fiche « vole » vers le ticket.
- Une info capturée devient une **fiche** :
  - ajoutée au ticket en cours (champ correspondant) ;
  - ajoutée au carnet ;
  - utilisable comme **mot-clé** de recherche (recherche de la Visionneuse, Base Clients) par glisser-déposer ou clic.
- Toutes les infos ne sont pas utiles : capturer n'est pas comprendre.

#### 4.2.4 Instructions paramétrées

- Une étape peut contenir des champs à remplir avant envoi : `Retirez la barrette en position [__]`, `Réglez le cavalier JP[__] sur [__]`.
- Valeur juste → l'appelant exécute, résultat attendu. Valeur fausse → résultat différent (pas de blocage, un autre nœud).

#### 4.2.5 Réactions et tolérance

- Aucune réponse ne bloque : une question inutile, une mauvaise étape → l'appelant réagit (s'étonne, s'agace, se trompe, rappelle plus tard).
- Rythme : indicateur de frappe, délais réalistes, silences dramatisés, messages en plusieurs morceaux.
- L'humeur de l'appelant (calme ↔ paniqué) module son style d'écriture (phrases courtes, fautes, majuscules).

#### 4.2.6 Signature des appelants du réseau

- Répondent à des questions **non posées**, sont trop précis, citent des procédures **absentes des procédures** (qui apparaîtront plus tard).
- Aucun système supplémentaire : tout est dans l'écriture des missions.

#### 4.2.7 Exemple de déroulé

1. Appelant : « Mon PC fait **3 bips** au démarrage et rien ne s'affiche. »
2. Le joueur capture « 3 bips », cherche dans l'index → page 12 *Codes sonores BIOS*.
3. La page débloque : « Les bips sont-ils longs ou courts ? » → DEMANDER.
4. « Courts. » → le joueur identifie la procédure 12-C (mémoire vive).
5. INSTRUIRE : « Ouvrez le boîtier » → « Retirez la barrette en position [2] ».
6. Attente… « Il démarre ! » → clôture du ticket avec le code `R-07`.

> Le même principe de capture pourra s'étendre à d'autres supports (e-mails, fichiers, fiches clients) si le prototype confirme qu'il est satisfaisant.

### 4.3 Ticketing (application « HelpDesk »)

- Un ticket s'ouvre à chaque appel : n° client, produit, heure, symptômes (remplis par le joueur ou pré-remplis).
- Clôture obligatoire avec un **code de résolution** choisi dans une liste (canal secret, voir 2.1).
- Historique consultable : tickets passés, y compris ceux de Marc.

### 4.4 Documentation

- **Visionneuse de documents** (application, façon lecteur PDF d'époque) : manuel de procédures paginé, sommaire et signets par chapitre, recherche plein texte, zoom, schémas de cartes mères, tables de codes.
- Les pages sont affichées comme un vrai document imprimé numérisé : mise en page de manuel, tampons de révision, annotations manuscrites de Marc (plus tard).
- Les pages **évoluent entre les nuits** (révision tamponnée, page ajoutée, page arrachée).
- **Base clients** (application écran) : recherche par nom, n° de série, ville. Certaines fiches sont incohérentes : ce sont des indices.

### 4.5 Messagerie

- E-mails de début de shift, notes internes, messages de PNJ.
- Pièces jointes ouvrant des fichiers dans les applications correspondantes.
- Certains e-mails arrivent **pendant** un appel (distraction, tension).

### 4.6 Système de fichiers

- Explorateur façon Win95 : disque C:, lecteur de disquettes A: (disquettes reçues en pièce jointe ou trouvées), dossiers.
- Dossier caché de Marc (à débloquer), fichiers protégés par mot de passe, fichiers corrompus à reconstituer.

### 4.7 Carnet (application)

- Indices ajoutés automatiquement (avec un petit son de stylo).
- Notes libres du joueur.
- Table de décodage des codes, remplie au fil des découvertes.

### 4.8 État et sauvegarde

- Variables (`reputation`, `suspicion`, `awareness`, `trust_<pnj>`) et flags de mission.
- Sauvegarde automatique à la fin de chaque nuit. Reprise possible au début de n'importe quelle nuit déjà atteinte.

### 4.9 Événements scriptés

- Déclenchés par nuit, par flag ou par heure du shift : écran qui se fige, message système inattendu, coupure de courant (écran noir puis reboot), page qui change, appel à 3 h 33, fichier qui apparaît.

### 4.10 Jauge de situation des appels urgents (secondaire — hors MVP)

> ⚠️ Priorité basse. Ne pas implémenter avant que l'interface et le système de communication soient validés. Prévoir seulement le point d'extension dans le code.

- Pas de compte à rebours fixe : une **jauge de situation** avec une **vitesse de dégradation**.
- Bonne action → ralentit la dégradation ou redonne du temps.
- Question inutile, hésitation, mauvaise étape → coûte du temps, accélère la dégradation.
- GÉRER (calmer l'appelant) → ralentit le rythme mais consomme du temps : arbitrage.
- Événements scriptés → relancent la pression.
- Affichage diégétique uniquement (aiguille du minuteur mécanique, voyant, style d'écriture de l'appelant).

---

## 5. Interface

### 5.1 Charte « game feel » (exigence prioritaire)

L'interface est l'unique moyen d'agir. **Rien ne doit être mort, plat ou instantané sans raison.**

**Règle des 3 retours.** Chaque interaction produit :
1. un **retour visuel** immédiat (< 50 ms) ;
2. un **retour sonore** (unique par type d'objet, avec légères variations aléatoires de hauteur et de volume) ;
3. un **retour temporel** : anticipation → action → suite (un bouton s'enfonce, se relâche, l'effet suit).

**Principes :**
- **Sons doux et feutrés, jamais agressifs.** L'interface doit rester reposante sur une longue session de nuit.
- **Aucun clic mort** : tout ce qui semble cliquable réagit, même pour dire « non » (son sourd, petit tremblement).
- **Latence d'époque, mise en scène** : ouvrir une application = sablier + grattement de disque dur + fenêtre qui se dessine. C'est court (0,3 à 1,5 s) et satisfaisant, jamais pénible.
- **Poids et matière** : les fenêtres se déplacent avec une légère inertie, les pages de la Visionneuse défilent avec élan, une fiche capturée « colle » en arrivant dans le ticket.
- **Hover partout** : survol = changement subtil (surbrillance, curseur contextuel, léger décalage).
- **60 fps constant.** Animations interruptibles : le joueur n'attend jamais la fin d'une animation pour agir.
- **Interface diégétique** : aucun HUD hors fiction. Heure, minuteurs et notifications passent par les objets du jeu.

**Détails attendus côté écran :**
- Boutons Win95 qui s'enfoncent (inversion du relief biseauté, décalage de 1 px du texte).
- Fenêtres qui s'ouvrent avec l'effet de rectangle qui « explose » depuis l'icône.
- Curseurs d'époque crème à contour pétrole (flèche, sablier, main, texte).
- Frappe clavier : son de clavier mécanique à chaque touche, caret clignotant.

**Style visuel de l'écran (pas de filtre CRT) :**
- Interface old school nette : pixels francs, reliefs biseautés, pas de flou ni de lignes de balayage.
- Palette **cuivre / pétrole** (voir section 6).
- Allumage du poste : bref « clac » d'interrupteur + ronronnement du disque dur, puis séquence BIOS.

### 5.2 Une seule vue : HelplineOS en plein écran

- Le jeu **est** l'écran de l'ordinateur : HelplineOS occupe toute la fenêtre du navigateur.
- **Aucun décor** autour (pas de moniteur, pas de bureau physique, pas d'objets). Tout ce que le joueur manipule est une application ou un élément du système.

### 5.3 Applications HelplineOS

| Application | Rôle | MVP |
|-------------|------|-----|
| **Téléphone** | Standard logiciel : lignes et voyants, décrocher/raccrocher, mise en attente, historique des appels ; affichage de la pression pour les appels urgents | ✅ |
| **Chat Opérateur** | Transcription de l'appel, 3 verbes, capture d'infos, instructions paramétrées | ✅ |
| **Visionneuse** | Lecteur de documents façon PDF : manuel de procédures, sommaire, signets, recherche, zoom | ✅ |
| **HelpDesk** | Tickets : ouverture, champs, clôture par code de résolution | ✅ |
| **Carnet** | Indices capturés, notes libres, table de décodage des codes | ✅ |
| **Messagerie** | E-mails, pièces jointes | ✅ |
| **Base Clients** | Recherche de fiches clients et de numéros de série | ✅ |
| **Explorateur** | Fichiers, lecteur de disquettes A:, dossier caché | — |
| **Bloc-notes** | Ouverture des fichiers texte | — |
| **Pense-bêtes** | Petites notes jaunes épinglées sur le bureau HelplineOS | — |
| **Démineur** | Mini-jeu de détente entre les appels, à la manière des solitaires des jeux Zachtronics : purement optionnel, sans lien avec l'intrigue | — |
| **Panneau de configuration** | Volume, vitesse des animations, taille du texte, accessibilité | — |

Plus : écran « Allumer le poste », séquence de boot BIOS, bureau avec icônes, barre des tâches, menu Démarrer, zone de notification (icônes qui clignotent), horloge du shift.

### 5.4 Arrivée d'un appel

1. Son de sonnerie + icône Téléphone qui clignote dans la zone de notification.
2. Petite fenêtre « Appel entrant — Ligne 2 » qui glisse depuis le coin de l'écran (numéro, heure).
3. Le joueur clique **Décrocher** : l'app Téléphone passe la ligne en « En cours », le Chat Opérateur et un nouveau ticket HelpDesk s'ouvrent et se placent automatiquement.
4. Disposition par défaut pensée pour un appel : Chat à gauche, Visionneuse à droite, ticket réduit en bas. Le joueur peut tout réorganiser.

### 5.5 Appels urgents : mise en scène

- Voyant rouge de la ligne qui clignote de plus en plus vite dans l'app Téléphone et dans la zone de notification.
- Indicateur de situation dans l'app Téléphone (jauge ou aiguille stylisée, sans chiffre).
- Son d'ambiance qui monte ; l'appelant écrit en fragments.
- La pression doit se **ressentir**, jamais se lire comme un compte à rebours.

### 5.6 Accessibilité

- Option « animations réduites » (transitions raccourcies, sans supprimer les retours sonores).
- Taille du texte réglable.
- Option « minuteurs allongés » pour les appels urgents.

---

## 6. Direction artistique

### 6.1 Principe : néo-rétro

> **Structure 1993, finition 2026.**

HelplineOS reprend **l'ossature** d'un OS de bureau du début des années 90 (fenêtres à barre de titre, reliefs biseautés, barre des tâches, menu Démarrer, icônes pixel, boot BIOS) mais la **rend** avec les standards d'une interface moderne (typographie soignée, animations fluides à ressorts, hiérarchie claire, espacements généreux). Le joueur doit reconnaître l'époque au premier coup d'œil, et trouver pourtant l'interface agréable et lisible pendant des heures.

| Old school (on garde) | Moderne (on ajoute) |
|-----------------------|---------------------|
| Fenêtres, barres de titre, boutons Réduire/Fermer | Coins très légèrement adoucis (2 px max), ombres portées douces sous les fenêtres |
| Reliefs biseautés 1 px clair / 1 px sombre | Reliefs fins et nets, jamais baveux |
| Icônes sur grille de pixels | Icônes vectorielles (SVG) sur grille : pixels parfaitement nets à toute taille |
| Barre des tâches, menu Démarrer, zone de notification | Transitions animées, survols subtils, micro-interactions |
| Couleurs franches, peu de nuances | Dégradés discrets (ex. barre de titre active cuivre profond → cuivre), halo cuivré léger sur l'élément ciblé |
| Polices système bitmap | Famille **IBM Plex**, anti-aliasée, hiérarchie typographique claire |
| Boîtes de dialogue, sabliers, sons système | Rythme maîtrisé : latences mises en scène, jamais pénibles |

**À ne jamais faire :** filtre CRT, grain, flou décoratif, glassmorphism marqué, ombres épaisses, coins très arrondis, look « flat design » générique, imitation pixel-perfect de Win95 (ni son logo, ni ses icônes, ni ses polices).

### 6.2 Palette

**Cuivre → pétrole**, validée au J0 : des sombres pétrole/brun profonds, un texte crème chaud, des accents cuivrés. Une palette sobre et reposante pour de longues sessions de nuit.

Les couleurs sont définies **par rôle** dans `src/ui/theme/palette.ts` (source unique) ; `npm run theme:generate` en produit les variables CSS et les curseurs.

| Rôle | Couleur | Hex | Usage |
|------|---------|-----|-------|
| Fond du bureau | Pétrole profond | `#0B2B35` | Fond de HelplineOS, zones en creux, bandes autour de l'écran |
| Surfaces | Pétrole grisé | `#1E3337` | Fenêtres, barre des tâches, panneaux |
| Relief clair | Brun-gris | `#45423A` | Arête claire des biseaux |
| Relief sombre, contours | Pétrole très sombre | `#041920` | Arête sombre des biseaux, contours des icônes et curseurs |
| Séparateurs | Gris-vert | `#323A38` | Lignes de séparation |
| Bordures | Brun neutre | `#5C4D3C` | Bordures, barres de défilement |
| Texte désactivé | Brun clair | `#8A7358` | Éléments désactivés |
| Texte | Crème chaud | `#EFDFC6` | Texte courant, icônes (aplat clair) |
| Texte secondaire | Sable | `#BDA88C` | Aides, légendes, texte secondaire |
| Info importante | Cuivre clair | `#E9A263` | Infos importantes et capturables, halo de focus, survol |
| Accent vif | Cuivre | `#B76935` | Icônes, dégradés (jamais comme fond de texte) |
| Accent profond | Cuivre profond | `#815839` | Sélection, barre de titre active (fond portant du texte) |
| Alerte | Rouge sourd | `#D9656B` | Appels urgents, erreurs (voyants, icônes ; usage rare) |

**Contrastes (WCAG 2)**, vérifiés par un test automatique : minimum **4,5:1** pour tout texte courant, 3:1 pour les signaux.

| Texte | Fond | Contraste |
|-------|------|-----------|
| Texte | Surfaces / fond du bureau | 10,13:1 / 11,37:1 |
| Texte | Accent profond (sélection) | 4,73:1 |
| Texte secondaire | Surfaces / fond du bureau | 5,77:1 / 6,48:1 |
| Info importante | Surfaces / fond du bureau | 6,20:1 / 6,95:1 |
| Alerte (signal) | Surfaces | 3,80:1 |
| Texte désactivé (indicatif) | Surfaces | 2,95:1 |

- Le crème est la couleur du texte ; le cuivre clair signale l'information importante ; le cuivre porte les accents.
- Hiérarchie des sombres : relief sombre < fond du bureau < surfaces < séparateurs < relief clair. Ces tons ne doivent jamais se confondre.

### 6.3 Typographie : famille IBM Plex

Licence **SIL Open Font License** (usage commercial libre). Polices **auto-hébergées** (fichiers dans `assets/fonts/`, pas de chargement depuis un service externe).

| Police | Usage |
|--------|-------|
| **IBM Plex Sans** | Toute l'interface : menus, fenêtres, boutons, chat, e-mails |
| **IBM Plex Sans Condensed** | Tableaux denses : Base Clients, historique des tickets, barre des tâches |
| **IBM Plex Mono** | Boot BIOS, numéros de série, codes de résolution, références, valeurs saisies, infos capturées |
| **IBM Plex Serif** | Corps du manuel de procédures dans la Visionneuse (effet « document imprimé ») |

- Graisses utilisées : Regular, Medium, SemiBold (Bold pour les titres de manuel uniquement).
- Taille de base ≈ 18-20 px logiques (voir 8.4). Toutes les tailles sont des variables du thème.
- Plex couvre l'alphabet latin étendu : compatible avec la localisation future.

### 6.4 Icônes

- **Style néo-rétro original** : dessinées sur une **grille de 32 × 32 pixels**, affichées à 48 px (facteur 1,5) ou 64 px, en **SVG** pour rester nettes.
- **Palette restreinte** (rôles de la palette 6.2) : crème, sable, cuivre, cuivre profond, relief clair, surface, + l'alerte. Contour de 1 pixel, pas de photoréalisme, pas de dégradé complexe (1 aplat de lumière maximum).
- **Formes simples et lisibles** : une icône = un objet reconnaissable (combiné téléphonique, enveloppe, document, fiche, carnet, dossier, disquette, loupe, engrenage).
- **Création originale uniquement** : ne pas reproduire d'icônes Microsoft ou d'autres jeux.
- **Icônes nécessaires au MVP :** Téléphone, Chat Opérateur, Visionneuse, HelpDesk, Carnet, Messagerie, Base Clients, menu Démarrer, Corbeille, dossier, document, e-mail non lu, appel entrant, sablier, états (ok, erreur, avertissement, information).
- Curseurs (flèche, main, texte, sablier) dans le même style, en crème avec contour pétrole très sombre.

### 6.5 Audio — *à définir*

- **Sons doux et feutrés, jamais agressifs.** L'interface doit rester reposante sur une longue session de nuit.
- **Sons répétitifs nettement plus bas que les sons ponctuels.** Clavier, survol, pages, défilement : ils reviennent sans cesse et doivent se faire oublier, à peine audibles. Un test automatique vérifie que le plus fort des sons répétitifs reste sous le plus doux des sons ponctuels.
- Principes déjà posés en 5.1 et 8.5 : chaque interaction a son son, variations aléatoires, ambiance de bureau de nuit.
- Direction musicale et liste des sons à préciser pendant J1.

---

## 7. Format du contenu et des missions

### 7.1 Principes

1. **Le contenu est séparé du code.** Missions, pages de doc, e-mails, clients : tout est dans des fichiers texte. On ajoute une mission sans toucher au moteur.
2. **Les questions et instructions vivent dans la doc, pas dans les missions.** Une page de procédure déclare ses questions et ses étapes ; une mission déclare seulement **comment son appelant y répond**. Pas d'explosion combinatoire d'arbres.
3. **Jamais de cul-de-sac.** Toute action sans réponse prévue déclenche une réplique de repli de l'appelant (« Euh… je ne vois pas le rapport »).
4. **Déclaratif, jamais de code dans le contenu.** Conditions et effets sont des structures simples, vérifiables automatiquement.
5. **Tout est validé avant de jouer.** Une référence cassée, un identifiant en double ou une mission impossible à résoudre fait échouer la validation.

### 7.2 Format de fichier

- **Écriture : YAML** (lisible, commentable, agréable à rédiger à la main).
- **Source de vérité : schémas Zod** (TypeScript), qui génèrent aussi un JSON Schema pour l'autocomplétion et la validation en direct dans VS Code.
- **Au build :** tout le contenu est validé puis compilé en un bundle JSON unique chargé par le jeu.
- **Textes :** en français directement dans les fichiers pour l'instant. La localisation future est prévue dès maintenant (voir 8.10).

### 7.3 Arborescence

```
content/
├── nights/          # Déroulé de chaque nuit (appels, e-mails, événements)
│   └── night_01.yaml
├── missions/        # Un fichier par appel
│   └── n01_03_trois_bips.yaml
├── docs/            # Pages du manuel de procédures (Visionneuse)
│   ├── base.yaml    # Questions/instructions de base, toujours disponibles
│   └── p12_codes_bios.yaml
├── callers/         # Personnalités des appelants (répliques de repli, style)
├── clients/         # Fiches de la Base clients
├── emails/          # E-mails
├── files/           # Fichiers du disque virtuel (dont le dossier de Marc)
└── codes/           # Codes de résolution (sens officiel + sens caché)
```

### 7.4 Identifiants

Préfixe = type. Tout identifiant est unique dans tout le contenu.

| Préfixe | Type | Exemple |
|---------|------|---------|
| `n` | Nuit | `n.01` |
| `m` | Mission | `m.n01_03` |
| `p` | Page de doc | `p.12` |
| `q` | Question | `q.bios.bip_type` |
| `i` | Instruction | `i.ram.remove_slot` |
| `cap` | Info capturable | `cap.bips` |
| `c` | Appelant | `c.bernard_fleury` |
| `cl` | Fiche client | `cl.0412` |
| `e` | E-mail | `e.n01.kessler_accueil` |
| `f` | Flag | `f.m03.fixed` |
| `R-` | Code de résolution | `R-07` |

### 7.5 Page de documentation

```yaml
id: p.12
tab: Démarrage
title: Codes sonores BIOS
keywords: [bips, bip, bios, démarrage, écran noir, mémoire]   # pour la recherche par mot-clé
revision: { night: 1 }            # une nouvelle révision peut remplacer la page à une nuit donnée
body: |                            # contenu affiché de la page (markdown léger)
  ## Tableau des codes
  | Bips | Signification | Procédure |
  | 1 long | Carte graphique | 14-A |
  | 3 courts | Mémoire vive | 12-C |
  ## 12-C — Mémoire vive défectueuse
  Retirer les barrettes une par une jusqu'au démarrage.

questions:                         # ajoutées au menu DEMANDER quand la page est consultée
  - id: q.bios.bip_type
    text: Les bips sont-ils longs ou courts ?
  - id: q.bios.bip_count
    text: Combien de bips exactement ?

instructions:                      # ajoutées au menu INSTRUIRE quand la page est consultée
  - id: i.case.open
    text: Éteignez l'ordinateur et ouvrez le boîtier.
  - id: i.ram.remove_slot
    text: Retirez la barrette de mémoire en position {slot}.
    params:
      slot: { type: choice, options: [1, 2, 3, 4] }
```

Types de paramètres : `choice` (liste), `number` (min/max), `text` (motif optionnel), `code` (format imposé, ex. `R-##`).

### 7.6 Appelant

```yaml
id: c.bernard_fleury
name: Bernard Fleury
mood_start: 1                      # humeur de -2 (paniqué/furieux) à +2 (détendu)
typing_speed: 0.9                  # multiplicateur du rythme de frappe
fallback:
  irrelevant:                      # action sans réponse prévue dans la mission
    - Euh… je ne vois pas le rapport.
    - Je ne sais pas, moi, je ne suis pas informaticien.
  repeat:                          # même action une seconde fois
    - Je vous l'ai déjà dit, non ?
  hold:                            # mis en attente
    - D'accord… j'attends.
```

### 7.7 Mission

```yaml
id: m.n01_03
title: Trois bips
night: 1
caller: c.bernard_fleury
client: cl.0412
type: libre                        # libre | urgent
network: false                     # true = appelant du réseau

captures:                          # infos cliquables dans les répliques
  cap.bips:   { label: 3 bips au démarrage, field: symptom, keywords: [bips, bios] }
  cap.serial: { label: N° série HX-486-0412, field: serial, keywords: [HX-486-0412] }
  cap.short:  { label: Bips courts, field: symptom, keywords: [bips courts, mémoire] }

opening:
  - Bonsoir… j'espère que je ne dérange pas si tard.
  - Mon ordinateur fait [[3 bips|cap.bips]] au démarrage et l'écran reste noir.

local_questions:                   # questions propres à cette mission (hors doc)
  []

responses:                         # clé = id de question/instruction ; première entrée valide = jouée
  q.base.serial:
    - say:
        - Attendez, c'est écrit derrière… [[HX-486-0412|cap.serial]].

  q.bios.bip_type:
    - say:
        - Courts. Trois bips [[courts|cap.short]], comme un réveil.

  i.case.open:
    - say:
        - Voilà, c'est ouvert. Il y a de la poussière partout…
      then: { set_flags: [f.m03.case_open] }

  i.ram.remove_slot:
    - when: { flags_none: [f.m03.case_open] }
      say:
        - Retirer quoi ? Le boîtier est encore fermé…
      then: { mood: -1 }
    - when: { param: { slot: 2 } }
      say:
        - C'est fait. Je rallume ?
        - { text: "…", pause: 5 }            # suspense
        - IL DÉMARRE ! Merci, vraiment !
      then: { set_flags: [f.m03.fixed], end_call: resolved }
    - say:
        - Je l'ai retirée… toujours trois bips.
      then: { mood: -1 }

closure:                           # codes de résolution au moment de clore le ticket
  codes:
    R-07:
      when: { flags_all: [f.m03.fixed] }
      then: { vars: { reputation: +1 } }
    default:
      then: { vars: { reputation: -1 } }
```

**Répliques (`say`)** : liste de messages. Chaque message est soit un texte, soit un objet `{ text, pause, typing }`. La durée de frappe est calculée automatiquement à partir de la longueur et du `typing_speed`, puis modulée par l'humeur.

**Balise de capture** : `[[texte affiché|cap.id]]`. L'id doit exister dans `captures`.

**Conditions (`when`)** — toutes doivent être vraies :

| Clé | Sens |
|-----|------|
| `flags_all` / `flags_none` | Flags présents / absents |
| `captured` | Infos déjà capturées |
| `asked` / `done` | Questions déjà posées / instructions déjà exécutées |
| `param` | Valeurs des paramètres de l'instruction |
| `mood` | Humeur, ex. `"<=0"` |
| `vars` | Variables globales, ex. `{ suspicion: ">=3" }` |

**Effets (`then`)** :

| Clé | Sens |
|-----|------|
| `set_flags` / `clear_flags` | Poser / retirer des flags |
| `vars` | Modifier des variables globales (`+1`, `-2`, `=0`) |
| `mood` | Modifier l'humeur de l'appelant |
| `unlock` | Débloquer des `local_questions` ou des pages de doc |
| `email` | Envoyer un e-mail (immédiat ou différé) |
| `end_call` | Terminer l'appel : `resolved`, `failed`, `hangup` → passage à la clôture |
| `pressure` | Réservé à la jauge d'urgence (4.10), ignoré pour l'instant |

### 7.8 Mission du réseau : les codes comme ordres

```yaml
network: true
closure:
  codes:
    R-14:                          # sens officiel : « remplacement alimentation »
      then: { set_flags: [f.net.ordre_14_transmis] }
    R-09:                          # code dévié délibérément
      then: { set_flags: [f.net.ordre_devie], vars: { suspicion: +2 } }
    default:
      then: { vars: { suspicion: +1 } }
```

Le fichier `codes/` associe à chaque code son **sens officiel** (affiché dans HelpDesk) et son **sens caché** (révélé progressivement dans le Carnet).

### 7.9 Nuit

```yaml
id: n.01
start: "22:00"
end: "06:00"
emails_at_boot: [e.n01.kessler_accueil]
calls:
  - { mission: m.n01_01, at: "22:20" }
  - { mission: m.n01_02, after_previous: 15 }      # minutes de jeu après la fin de l'appel précédent
  - { mission: m.n01_03, after_previous: 10 }
  - { mission: m.n01_04, after_previous: 20, when: { flags_all: [f.m02.callback] } }
events:
  - { at: "03:33", type: screen_freeze }
  - { at: "04:10", type: email, id: e.n01.inconnu }
```

### 7.10 Outils de validation (à livrer avec le moteur)

- **`npm run content:check`** — schémas, identifiants en double, références cassées, balises de capture invalides, questions jamais débloquées, captures jamais utilisées (avertissement).
- **`npm run content:sim`** — un solveur explore automatiquement chaque mission (toutes les actions possibles) et vérifie qu'une fin `resolved` est **atteignable**. Il signale les réponses jamais atteignables.
- **Mode debug** — `?mission=m.n01_03` lance une mission isolée, avec un panneau d'état (flags, variables, humeur) et le rechargement à chaud du contenu.

### 7.11 Règles d'écriture

- Un message = 1 à 2 phrases. Découper plutôt qu'allonger.
- Idéalement une seule info capturable par message.
- Toute instruction a une réponse `default` (sans `when`) en dernière position.
- Les appelants du réseau ne portent **aucun marqueur technique visible** : seule l'écriture les trahit.

---

## 8. Architecture technique

### 8.1 Stack

| Besoin | Choix | Pourquoi |
|--------|-------|----------|
| Langage | **TypeScript** (strict) | Typage fort : les erreurs sont détectées avant l'exécution |
| Build / serveur de dev | **Vite** | Rapide, rechargement à chaud |
| Interface | **React** | Idéal pour une interface faite de fenêtres, formulaires, listes, texte |
| Animations / gestes | **Motion** (ex-Framer Motion) | Ressorts physiques, glisser-déposer, animations interruptibles |
| État de l'interface | **Zustand** | Simple, léger, lisible |
| Validation du contenu | **Zod** + **yaml** | Schémas = source de vérité (section 7) |
| Audio | **Howler.js** + **Web Audio API** | Échantillons (clics, téléphone) + sons procéduraux (ronronnement du PC, variations) |
| Tests | **Vitest** | Tests unitaires du moteur et du contenu |
| Version Steam (plus tard) | **Electron + steamworks.js** | Voie la plus éprouvée pour les succès et l'overlay Steam. Décision finale à la phase Steam. |

### 8.2 Architecture en couches

Règle d'or : **le moteur de jeu ne connaît pas l'interface.** Il peut tourner seul (tests, solveur, debug).

```
┌─────────────────────────────────────────────┐
│  UI (React)                                 │
│  os/ (bureau, fenêtres, applis)             │
│  theme/ (palette, reliefs, polices)         │
│  feel/ (kit de retours : son + anim + délai)│
└──────────────┬──────────────▲───────────────┘
      actions  │              │ événements
┌──────────────▼──────────────┴───────────────┐
│  ENGINE (TypeScript pur, aucun DOM)         │
│  état · horloge · dialogue · nuits · save   │
└──────────────┬──────────────────────────────┘
               │ lit
┌──────────────▼──────────────────────────────┐
│  CONTENT (YAML → validé → bundle JSON)      │
└─────────────────────────────────────────────┘
      + audio/   + platform/ (stockage, plein écran, Steam)
```

**Flux :**
- L'UI envoie des **actions** au moteur : `ASK`, `INSTRUCT`, `MANAGE`, `CAPTURE`, `OPEN_PAGE`, `CLOSE_TICKET`, `ANSWER_CALL`, `HOLD`…
- Le moteur renvoie des **événements horodatés** : `caller.typing`, `caller.message`, `option.unlocked`, `flag.set`, `call.ended`, `email.received`…
- L'UI **met en scène** ces événements (délais, sons, animations). Le moteur décide *quoi*, l'UI décide *comment le montrer*.

**Horloge :** le moteur utilise une horloge injectable. En jeu, elle suit le temps réel ; en test et dans le solveur, elle avance instantanément ; en debug, elle peut accélérer.

### 8.3 Kit « feel » (application technique de la charte 5.1)

Pour garantir que **tout** respecte la règle des 3 retours, l'UI passe par une bibliothèque interne de primitives. **Interdiction d'utiliser un `<button>` brut ou un clic non instrumenté.**

| Primitive | Rôle |
|-----------|------|
| `<Pressable>` | Tout élément cliquable : état survol/enfoncé, son, micro-animation, refus sonore si désactivé |
| `<Button95>` | Bouton style Win95 basé sur `Pressable` (relief inversé, décalage 1 px) |
| `<Window95>` | Fenêtre : ouverture « rectangle qui explose », focus, déplacement, réduction, fermeture |
| `<Draggable>` | Élément déplaçable (fenêtre, fiche capturée, icône) : inertie légère, son de prise/pose |
| `<TypedText>` | Texte qui s'écrit (chat, boot), rythme variable |
| `<Capturable>` | Info cliquable (section 4.2.3) : soulignement, feutre, envol vers le ticket |
| `useSound(id)` | Joue un son avec légère variation aléatoire de hauteur et de volume |
| `useFeedback()` | Combine son + anim + tremblement de refus en un appel |

Tous les réglages (durées, courbes de ressort, volumes) sont dans **un seul fichier de configuration** `feel.config.ts` pour pouvoir tout ajuster au même endroit.

### 8.4 Rendu de l'écran

**Résolution logique :** HelplineOS est dessiné en **1920 × 1080 (16:9)**, puis mis à l'échelle pour remplir la fenêtre du navigateur (bandes pétrole profond si le format diffère). Pas de cadre de moniteur, pas de décor : l'OS est tout l'écran.

**Lisibilité :** à cette résolution, des éléments Win95 à leur taille d'origine seraient minuscules. Les tailles de base sont donc **agrandies** (texte courant ≈ 18-20 px logiques, barres de titre ≈ 36 px, icônes 48 px) pour rester lisibles quand l'écran est réduit (ex. portable 1366 × 768 → facteur ≈ 0,71). Toutes ces tailles sont des variables du thème.

**Approche :** interface 100 % HTML/CSS, nette, **sans aucun filtre CRT** (pas de lignes de balayage, de courbure, de scintillement ni de lueur). Icônes et bitmaps en `image-rendering: pixelated` pour garder des contours francs.

**Thème :** toutes les couleurs, reliefs et polices sont des **variables CSS centralisées** dans `src/ui/theme/` (voir section 6). Aucune couleur écrite en dur dans les composants.

### 8.5 Audio

- **Catégories** : interface, téléphone, ambiance, musique. Un volume par catégorie (Panneau de configuration).
- **Variations** : chaque son joué avec de très légères variations (±1,5 % de hauteur, ±4 % de volume) pour éviter l'effet mitraillette, sans que la différence s'entende nettement.
- **Procédural** (Web Audio) : ronronnement du PC et du disque dur, tic-tac.
- **Déblocage audio** : les navigateurs bloquent le son avant le premier clic. L'écran titre demande un clic (« Allumer le poste »), qui lance la séquence de boot : contrainte transformée en moment d'immersion.

### 8.6 Sauvegarde

- Une interface `SaveStorage` unique. Web : `localStorage`. Steam : fichiers locaux.
- Sauvegarde automatique en fin de nuit + versionnée (champ `version`) pour migrer les anciennes sauvegardes.

### 8.7 Arborescence du projet

```
helpline93/
├── content/                 # Contenu YAML (section 7)
├── src/
│   ├── engine/              # Moteur pur TS : state, clock, dialogue, nights, save
│   ├── content/             # Schémas Zod, chargement du bundle
│   ├── ui/
│   │   ├── feel/            # Kit de retours (8.3) + feel.config.ts
│   │   ├── os/              # Bureau, barre des tâches, gestionnaire de fenêtres
│   │   ├── apps/            # Téléphone, Chat, Visionneuse, HelpDesk, Carnet, Messagerie, BaseClients…
│   │   └── theme/           # Palette, reliefs, polices, boot
│   ├── audio/               # Gestionnaire audio, sons procéduraux
│   ├── platform/            # Stockage, plein écran, (Steam plus tard)
│   └── debug/               # Panneau d'état, lanceur de mission isolée
├── tools/                   # content:check, content:sim
├── assets/                  # Sons, images, polices
└── tests/
```

### 8.8 Précautions légales et d'identité

- **Ne pas utiliser** le nom « Windows », le logo Microsoft, ni leurs polices (MS Sans Serif). Le système du jeu est **fictif** : **HelplineOS**. Le style peut s'en inspirer librement.
- Polices, sons et musiques : uniquement sous licence compatible avec une vente commerciale (vérifier chaque licence, les tracer dans `assets/CREDITS.md`).

### 8.9 Performance

- 60 fps stables sur un ordinateur portable moyen.
- Premier chargement web < 10 Mo ; sons et images non essentiels chargés en arrière-plan pendant le boot.
- Cibles : Chrome, Firefox, Edge récents. Safari : best effort.

---

### 8.10 Préparation à la localisation

Le jeu sort d'abord **en français uniquement**, mais rien ne doit empêcher d'ajouter d'autres langues plus tard.

- **Interface :** tous les libellés dans `src/ui/strings/fr.ts`, appelés par clé (`t('helpdesk.close_ticket')`). Ajouter une langue = ajouter un fichier (`en.ts`, `de.ts`…).
- **Contenu :** textes en français dans les YAML pour l'instant. Chaque texte a une place identifiable (id de mission + chemin), ce qui permettra un outil d'extraction vers des fichiers de traduction.
- **Jamais de phrases construites par concaténation** (`"Vous avez " + n + " messages"`) : utiliser des modèles avec variables et gestion du pluriel (`Intl.PluralRules`).
- **Dates, heures, nombres, montants** formatés via `Intl` selon la langue active.
- **Mise en page tolérante** : prévoir des textes jusqu'à 30 % plus longs (allemand) sans casser les fenêtres ; pas de texte dans les images.
- **Balises de capture** `[[texte|cap.id]]` : le texte affiché se traduit, l'id ne change jamais.
- Paramètre de langue présent dans le moteur et la sauvegarde dès J0 (valeur unique : `fr`).

---

## 9. Périmètre du MVP et roadmap

### 9.1 Définition du MVP

> **Le MVP = la nuit 1 complète, jouable de bout en bout dans le navigateur (20 à 30 min).**
> Boot → e-mail de Kessler → 4 appels → clôtures de tickets → rapport de fin de shift → sauvegarde.

Il doit prouver deux choses, dans cet ordre :
1. **L'interface est satisfaisante à manipuler** (pilier 5).
2. **Le système de communication est amusant** : chercher dans la doc, capturer, questionner, instruire (section 4.2).

Si ces deux points ne sont pas convaincants, on corrige **avant** d'écrire du contenu supplémentaire.

### 9.2 Dans le MVP / hors MVP

| ✅ Dans le MVP | ❌ Hors MVP (plus tard) |
|---------------|------------------------|
| Boot, bureau HelplineOS, barre des tâches, menu Démarrer | Explorateur de fichiers et dossier caché de Marc |
| Gestionnaire de fenêtres complet | Démineur, Bloc-notes |
| Apps : Téléphone, Chat Opérateur, Visionneuse, HelpDesk, Carnet, Messagerie, Base Clients | Pense-bêtes, disquettes, Panneau de configuration |
| Arrivée d'appel (notification, fenêtre, disposition automatique) | Jauge d'urgence (4.10) et appels urgents |
| Système de communication complet (4.2) | Pages de doc révisées entre nuits |
| Pipeline de contenu YAML + `content:check` | Solveur `content:sim` |
| Nuit 1 : 4 appels libres, 6 à 8 pages de doc, 3 e-mails | Nuits 2 à 9, fins, variables narratives avancées |
| Sauvegarde de fin de nuit | Traduction, version Steam |
| Sons provisoires (banques libres de droits) | Musique, sons définitifs, illustrations finales |
| Panneau de debug | Bloc-notes |

### 9.3 Jalons

Chaque jalon se termine par un **point de contrôle** : Loïc teste, valide ou demande des corrections. On ne passe pas au jalon suivant sans validation.

**J0 — Fondations** *(taille S)*
- Projet Vite + React + TypeScript, lint, formatage, Vitest.
- Thème (variables CSS de la palette), polices IBM Plex auto-hébergées, jeu d'icônes provisoire néo-rétro.
- Squelette du moteur (`engine/`) avec horloge injectable et bus d'événements.
- Gestionnaire audio (Howler) avec variations de hauteur/volume.
- Kit feel de base : `Pressable`, `Button95`, `useSound`, `useFeedback`, `feel.config.ts`.
- ✔️ *Contrôle :* une page de démo (« bac à sable ») présente chaque primitive ; chaque clic donne son + animation.

**J1 — Interface HelplineOS** *(taille L — priorité n°1)*
- Écran « Allumer le poste » → séquence BIOS → bureau.
- `Window95` : ouverture animée depuis l'icône, déplacement, focus, réduction, fermeture, empilement.
- Barre des tâches, menu Démarrer, horloge du shift.
- Zone de notification, fenêtre « Appel entrant », app Téléphone (décrocher, raccrocher, attente).
- Visionneuse : sommaire, signets, pages, défilement, zoom, recherche.
- Carnet : liste d'indices et notes libres.
- Coquilles des autres applications du MVP.
- ✔️ *Contrôle :* **test « game feel » de 10 minutes sans aucun contenu.** Manipuler le poste doit déjà être plaisant. Si ce n'est pas le cas, on itère ici.

**J2 — Système de communication** *(taille L — priorité n°2)*
- Schémas Zod + chargement YAML + `content:check`.
- Moteur de dialogue : résolution `when`/`then`, répliques de repli, humeur, rythme de frappe.
- Chat Opérateur : 3 verbes, options débloquées par la doc (animation Visionneuse → chat), instructions paramétrées.
- `<Capturable>` : capture d'infos, envol vers le ticket et le Carnet, recherche par mot-clé.
- HelpDesk : ticket automatique, clôture par code de résolution.
- Mode debug `?mission=` avec panneau d'état.
- Contenu : la mission « Trois bips » + 2 pages de doc.
- ✔️ *Contrôle :* résoudre « Trois bips » de bout en bout ; tester volontairement les mauvaises réponses (aucun blocage).

**J3 — Nuit 1 jouable = MVP** *(taille M)*
- Planificateur de nuit (`nights/`), appels déclenchés par l'horloge.
- Messagerie (e-mails au boot et en cours de nuit), Base Clients.
- Rapport de fin de shift, sauvegarde/reprise.
- Contenu complet de la nuit 1 (écrit par Loïc avec l'aide de Claude).
- ✔️ *Contrôle :* **playtest par 2 à 3 personnes extérieures**, observées sans aide. Noter où elles bloquent, s'ennuient, sourient.

**Après le MVP** *(ordre indicatif)*
- **J4 — Outils de contenu** : solveur `content:sim`, rechargement à chaud.
- **J5 — Acte I** (nuits 2-3) : pages révisées, Explorateur, premiers indices, Bloc-notes.
- **J6 — Actes II et III** : dossier de Marc, table de décodage, codes déviés, 4 fins.
- **J7 — Tension et finitions** : appels urgents et jauge (4.10), Pense-bêtes, disquettes, Démineur, Panneau de configuration, sons et visuels définitifs, accessibilité.
  - *Piste à évaluer après le playtest du MVP :* une refonte graphique de HelplineOS.
- **J8 — Publication** : version web publique (itch.io), puis portage Steam (Electron + steamworks.js).

### 9.4 Assets provisoires

- Jusqu'à J7, sons et visuels sont **provisoires** : banques libres de droits (licence CC0 de préférence), icônes provisoires respectant déjà la grille néo-rétro (6.4).
- Chaque asset est tracé dans `assets/CREDITS.md` avec sa licence, pour faciliter le remplacement.

### 9.5 Règles de conduite du projet

- **Toujours jouable** : à la fin de chaque session de travail, le jeu démarre sans erreur.
- **Un jalon à la fois**, validé par Loïc avant de passer au suivant.
- **Le ressenti prime sur les fonctionnalités** : mieux vaut 3 interactions parfaites que 10 moyennes.

---

## 10. Règles pour Claude Code

> Ces règles s'appliquent à chaque session. Elles sont aussi résumées dans `CLAUDE.md`, lu automatiquement par Claude Code.

### 10.1 Rôle et posture

- Ce document (`GDD_HELPLINE93.md`) est la **source de vérité**. Le lire en entier au début de chaque nouveau jalon.
- Si un point est flou, contradictoire ou manquant : **poser la question à Loïc** plutôt que deviner. Proposer 2 ou 3 options avec une recommandation.
- Loïc n'est pas développeur web confirmé : expliquer les choix **simplement, en français**, sans jargon inutile.
- Demander **avant** de modifier : la stack (8.1), l'architecture en couches (8.2), le format du contenu (section 7), ou d'ajouter une dépendance.

### 10.2 Méthode de travail

- **Un jalon à la fois** (section 9). Ne pas implémenter de fonctionnalités de jalons futurs ; prévoir seulement les points d'extension mentionnés.
- **Début de session :** annoncer en quelques lignes ce qui va être fait et dans quel ordre.
- **Fin de session :** résumer ce qui a été fait, **comment le tester** (étapes concrètes à cliquer), ce qui reste, et les questions ouvertes.
- Tenir à jour **`PROGRESS.md`** : jalon en cours, tâches faites / à faire, décisions prises, points à valider par Loïc.
- **Toujours jouable :** à la fin de chaque session, `npm run dev` démarre sans erreur ni avertissement dans la console.
- Commits petits et fréquents, à chaque étape fonctionnelle. Messages en anglais, format `type: description` (`feat`, `fix`, `refactor`, `content`, `chore`).

### 10.3 Langues

- **Code, noms de fichiers, identifiants, commentaires :** anglais.
- **Textes affichés au joueur :** français. Jamais écrits en dur dans les composants : soit dans `content/` (missions, docs, e-mails), soit dans `src/ui/strings/fr.ts` (libellés de l'interface). Respecter les règles de localisation (8.10).
- **Échanges avec Loïc, `PROGRESS.md` :** français.

### 10.4 Conventions de code

- TypeScript **strict**, pas de `any` (sauf cas justifié et commenté).
- ESLint + Prettier configurés dès J0 ; aucun avertissement toléré.
- Composants React fonctionnels, un composant par fichier, fichiers de moins de ~300 lignes.
- **Aucune couleur, taille ou police en dur** : uniquement les variables du thème (`src/ui/theme/`).
- **Aucune durée, courbe ou volume en dur** : uniquement `feel.config.ts`.
- **Aucune logique de jeu dans les composants React.** Les règles vivent dans `src/engine/` ; l'UI envoie des actions et met en scène des événements (8.2).
- Le moteur est **pur et déterministe** (horloge injectable, pas d'accès au DOM ni à `Date.now()` direct) et couvert par des tests Vitest : chaque condition (`when`) et chaque effet (`then`) a au moins un test.

### 10.5 Règles « game feel » (non négociables)

- **Interdit :** `<button>` brut, `onClick` sur un élément non instrumenté. Tout élément interactif passe par le kit feel (`Pressable`, `Button95`, `Draggable`, `Capturable`…).
- **Checklist pour chaque élément interactif**, à vérifier avant de le considérer comme terminé :
  - [ ] état survol visible
  - [ ] état enfoncé visible
  - [ ] son au clic (avec variation)
  - [ ] réaction de refus si désactivé (son sourd + petit tremblement)
  - [ ] animation interruptible
  - [ ] curseur adapté
- Animations uniquement sur `transform` et `opacity` (fluidité à 60 fps).
- **Aucun HUD hors fiction** : pas de compteur, pas de barre de progression ou d'infobulle qui n'existerait pas dans HelplineOS.
- Maintenir une page **bac à sable** (`?sandbox`) qui présente chaque primitive du kit feel et chaque composant d'interface, pour tester le ressenti isolément.

### 10.6 Interdits généraux

- Aucun effet CRT (balayage, courbure, scintillement, lueur).
- Aucun décor hors de HelplineOS (moniteur, bureau physique, objets).
- Aucun nom, logo ou police Microsoft ; aucune marque réelle.
- Aucun texte de mission, e-mail ou page de doc dans le code.
- Aucun asset sans licence compatible commerciale ; chaque asset est tracé dans `assets/CREDITS.md`.
- Aucune donnée envoyée sur Internet (pas d'analytics, pas de télémétrie) sans accord explicite.

### 10.7 Vérifications avant de livrer

Une seule commande doit passer avant chaque fin de session :

```
npm run check   # = typecheck + lint + tests + content:check
```

Puis vérifier manuellement dans le navigateur ce qui a été modifié, et le décrire à Loïc dans le résumé de fin de session.

---

## Questions ouvertes

- Aucune question bloquante à ce stade. Les nouvelles questions sont ajoutées ici au fil du développement.
