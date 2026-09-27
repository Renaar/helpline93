/**
 * French UI strings (GDD 8.10). Called by key: t('sandbox.title').
 * Adding a language = adding a file with the same shape (en.ts, de.ts…).
 * Mission texts, e-mails and manual pages live in content/, never here.
 */
export const fr = {
  app: {
    title: 'HELPLINE93',
  },

  format: {
    /** US phone numbers (the setting stays American, GDD 1.4). */
    phoneNumber: '({area}) {exchange}-{line}',
  },

  boot: {
    powerOn: 'Allumer le poste',
    bios: {
      header: 'HELTRON BIOS v2.11',
      copyright: '© 1992 Heltron Computer Corp. — San Aurelio',
      cpu: 'Processeur : 486DX2-66',
      memory: 'Test de la mémoire : {amount} Ko',
      memoryOk: 'Test de la mémoire : {amount} Ko OK',
      floppy: 'Lecteur de disquettes A: 1,44 Mo',
      drives: 'Détection des disques IDE…',
      primaryMaster: '  Maître primaire : HX-340A',
      primarySlave: '  Esclave primaire : aucun',
      starting: 'Démarrage de HelplineOS…',
      skipHint: 'Appuyez sur ÉCHAP pour passer',
    },
    login: {
      title: 'Ouverture de session',
      station: 'Poste NL-04 · Service de nuit',
      prompt: 'Entrez votre nom pour commencer le service.',
      nameLabel: 'Nom de l’opérateur',
      ok: 'OK',
    },
    defaultOperator: 'Opérateur',
  },

  os: {
    start: 'Démarrer',
    shutdown: 'Arrêter le poste',
    minimize: 'Réduire',
    close: 'Fermer',
    taskbar: 'Barre des tâches',
    tray: {
      phone: 'Téléphone',
      clock: 'Heure du service',
    },
    brand: 'HelplineOS',
    /** Tape-deck fast-forward indicator shown during a time jump. */
    fastForward: '▶▶',
  },

  apps: {
    phone: {
      title: 'Téléphone',
      switchboard: 'Standard · Service de nuit',
      line: 'Ligne {line}',
      lineCode: 'NL-0{line}',
      status: {
        idle: 'Libre',
        ringing: 'Appel entrant',
        active: 'En communication',
        held: 'En attente',
      },
      answer: 'Décrocher',
      hold: 'Attente',
      resume: 'Reprendre',
      hangUp: 'Raccrocher',
      waitNext: 'Attendre le prochain appel',
      history: 'Historique des appels',
      historyEmpty: 'Aucun appel pour l’instant.',
      columns: {
        time: 'Heure',
        line: 'Ligne',
        number: 'Numéro',
        duration: 'Durée',
      },
      duration: {
        one: '{count} min',
        other: '{count} min',
      },
    },
    incoming: {
      title: 'Appel entrant — Ligne {line}',
      urgentTitle: 'Appel urgent — Ligne {line}',
      transferred: 'Appel transféré par le standard',
      number: 'Numéro',
      time: 'Reçu à',
      answer: 'Décrocher',
      hide: 'Masquer',
    },
    chat: {
      title: 'Chat Opérateur',
      idle: 'Aucun appel en cours.',
      idleHint: 'Les appels transférés s’afficheront ici.',
      connected: 'Ligne {line} · {number}',
      waiting: 'Liaison établie. En attente de la transcription…',
    },
    helpdesk: {
      title: 'HelpDesk',
      empty: 'Aucun ticket ouvert.',
      emptyHint: 'Un ticket s’ouvre à chaque appel décroché.',
      ticket: 'Ticket n° {number}',
      fields: {
        opened: 'Ouvert à',
        line: 'Ligne',
        caller: 'Appelant',
        product: 'Produit',
        symptoms: 'Symptômes',
      },
      unknown: '—',
      close: 'Clore le ticket',
    },
    notebook: {
      title: 'Carnet',
      tabs: {
        clues: 'Indices',
        notes: 'Notes',
      },
      cluesEmpty: 'Aucun indice pour l’instant.',
      cluesHint: 'Les informations capturées pendant les appels viendront s’ajouter ici.',
      notesLabel: 'Notes libres',
      notesPlaceholder: 'Écrire une note…',
    },
    mail: {
      title: 'Messagerie',
      inbox: 'Boîte de réception',
      empty: 'Aucun message.',
    },
    clients: {
      title: 'Base Clients',
      searchLabel: 'Rechercher un client',
      searchPlaceholder: 'Nom, n° de série, ville…',
      empty: 'Aucune fiche à afficher.',
    },
    viewer: {
      title: 'Visionneuse',
      document: 'Manuel de procédures',
      tabs: {
        contents: 'Sommaire',
        bookmarks: 'Signets',
        search: 'Recherche',
      },
      page: 'Page {current} / {total}',
      previous: 'Page précédente',
      next: 'Page suivante',
      zoomIn: 'Agrandir',
      zoomOut: 'Réduire',
      zoom: '{percent} %',
      bookmark: 'Signet',
      bookmarksEmpty: 'Aucun signet. Le bouton « Signet » marque la page affichée.',
      searchLabel: 'Rechercher dans le manuel',
      searchPlaceholder: 'Mot-clé…',
      results: {
        zero: 'Aucun résultat.',
        one: '{count} résultat',
        other: '{count} résultats',
      },
      searchHint: 'Deux lettres au moins.',
      revision: 'Rév. nuit {night}',
      pageNumber: 'p. {number}',
    },
  },

  debug: {
    title: 'Débogage',
    toggle: 'Afficher ou masquer le débogage',
    shortcut: 'F9 : masquer',
    incomingCall: 'Simuler un appel',
    urgentCall: 'Simuler un appel urgent',
    scheduleCall: 'Programmer un appel (+{minutes} min)',
    nextEvent: 'Prochain événement : {time}',
    noEvent: 'Aucun événement programmé',
    minute: 'Minute du service : {minute}',
  },

  icons: {
    phone: 'Téléphone',
    'incoming-call': 'Appel entrant',
    chat: 'Chat Opérateur',
    viewer: 'Visionneuse',
    helpdesk: 'HelpDesk',
    notebook: 'Carnet',
    mail: 'Messagerie',
    'mail-unread': 'E-mail non lu',
    clients: 'Base Clients',
    start: 'Démarrer',
    trash: 'Corbeille',
    folder: 'Dossier',
    document: 'Document',
    hourglass: 'Sablier',
    ok: 'OK',
    error: 'Erreur',
    warning: 'Avertissement',
    info: 'Information',
    power: 'Marche / arrêt',
  },

  sandbox: {
    title: 'Bac à sable — kit feel',
    intro:
      'Chaque élément réagit au survol, à l’appui et au relâchement, avec un son légèrement différent à chaque fois. Glisser hors d’un bouton avant de relâcher annule l’action.',
    back: 'Retour',

    buttons: {
      title: 'Button95',
      hint: 'Relief qui s’inverse, texte décalé de 1 px. Le bouton désactivé refuse : son sourd et tremblement.',
      ok: 'Valider',
      cancel: 'Annuler',
      primary: 'Par défaut',
      disabled: 'Désactivé',
      toggle: 'Bascule',
    },

    pressable: {
      title: 'Pressable',
      hint: 'L’élément s’enfonce avec un ressort, et rebondit au relâchement. La dernière icône est désactivée.',
      pressed: {
        one: '{count} icône pressée',
        other: '{count} icônes pressées',
      },
    },

    sounds: {
      title: 'Sons',
      hint: 'Cliquer plusieurs fois : hauteur (±{pitch} %) et volume (±{volume} %) varient très légèrement à chaque lecture.',
      hover: 'Survol',
      press: 'Appui',
      release: 'Relâchement',
      deny: 'Refus',
      confirm: 'Validation',
      power: 'Interrupteur',
      spinup: 'Disque qui démarre',
      hdd: 'Disque dur',
      biosBeep: 'Bip BIOS',
      windowOpen: 'Ouverture',
      windowClose: 'Fermeture',
      windowMinimize: 'Réduction',
      windowRestore: 'Restauration',
      menuOpen: 'Menu',
      dragPick: 'Prise',
      dragDrop: 'Pose',
      pageTurn: 'Page',
      viewerJump: 'Aller à la page',
      key: 'Touche',
      phoneRing: 'Sonnerie',
      phonePickup: 'Décrocher',
      phoneHangup: 'Raccrocher',
      phoneHold: 'Attente',
      clockSkip: 'Saut dans le temps',
    },

    feedback: {
      title: 'useFeedback — refus',
      hint: 'La même réaction que tout élément désactivé : son sourd + petit tremblement.',
      target: 'Accès refusé',
      trigger: 'Provoquer un refus',
    },

    engine: {
      title: 'Moteur → interface',
      hint: 'Le moteur programme un événement dans {delay} s. L’interface le met en scène : voyant + son.',
      ping: 'Envoyer un ping',
      log: 'Journal des événements',
      empty: 'Aucun événement pour l’instant.',
      entry: '{type} — à {time} s',
    },

    cursors: {
      title: 'Curseurs',
      hint: 'Survoler chaque zone.',
      arrow: 'Flèche',
      hand: 'Main',
      text: 'Texte',
      wait: 'Sablier',
      denied: 'Refus',
      'resize-ns': 'Hauteur',
      'resize-ew': 'Largeur',
      'resize-nwse': 'Coin ↘',
      'resize-nesw': 'Coin ↙',
    },

    typography: {
      title: 'Typographie — IBM Plex',
      sans: 'Plex Sans — menus, fenêtres, boutons, chat',
      condensed: 'Plex Sans Condensed — tableaux denses, barre des tâches',
      mono: 'HX-486-0412 · R-07 · 22:20 · JP3',
      serif: 'Plex Serif — corps du manuel de procédures',
      serifBold: '12-C — Mémoire vive défectueuse',
    },

    palette: {
      title: 'Palette — rôles',
      roles: {
        desktop: 'Fond du bureau',
        surface: 'Fenêtres, panneaux',
        bevelLight: 'Relief clair',
        bevelDark: 'Relief sombre, contours',
        separator: 'Séparateurs',
        border: 'Bordures',
        text: 'Texte',
        textDim: 'Texte secondaire',
        textDisabled: 'Texte désactivé',
        highlight: 'Info importante',
        accent: 'Accent vif',
        accentDeep: 'Accent profond',
        alert: 'Alerte',
      },
    },

    contrast: {
      title: 'Contrastes (WCAG 2)',
      hint: 'Minimum {text}:1 pour le texte courant, {graphic}:1 pour les signaux. Les autres valeurs sont indicatives.',
      pair: '{text} sur {background}',
      ratio: '{ratio}:1',
      required: 'min. {minimum}:1',
      informative: 'indicatif',
      sample: 'Aa',
    },

    inputs: {
      title: 'TextField · TypedText',
      hint: 'Chaque touche donne un son de clavier feutré. Le champ refuse au-delà de 12 caractères.',
      fieldLabel: 'Champ de démonstration',
      placeholder: 'Tapez quelque chose…',
      typed: 'Liaison établie. En attente de la transcription de l’appel…',
      replay: 'Rejouer',
    },

    vhs: {
      title: 'Avance rapide VHS',
      hint: 'L’effet du saut dans le temps (2,5 s). Avec « Animations réduites » : un simple fondu.',
      play: 'Lancer l’effet',
    },

    lamps: {
      title: 'Voyants',
      hint: 'Éteint, allumé, sonnerie, attente, urgence.',
    },

    window: {
      title: 'Window95',
      hint: 'Déplacer par la barre de titre (inertie légère au lâcher), redimensionner par les bords et les coins, réduire, fermer.',
      open: 'Ouvrir',
      restore: 'Restaurer',
      windowTitle: 'Fenêtre de démonstration',
      body: 'Contenu de la fenêtre.',
    },

    settings: {
      title: 'Réglages',
      reducedMotion: 'Animations réduites',
      muted: 'Son coupé',
    },
  },
} as const;
