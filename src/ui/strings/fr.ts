/**
 * French UI strings (GDD 8.10). Called by key: t('sandbox.title').
 * Adding a language = adding a file with the same shape (en.ts, de.ts…).
 * Mission texts, e-mails and manual pages live in content/, never here.
 */
export const fr = {
  app: {
    title: 'HELPLINE93',
  },

  home: {
    os: 'HelplineOS',
    milestone: 'Jalon J0 — fondations',
    notice:
      'Le poste sera allumable au jalon J1. En attendant, le bac à sable présente le kit « feel ».',
    openSandbox: 'Ouvrir le bac à sable',
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

    settings: {
      title: 'Réglages',
      reducedMotion: 'Animations réduites',
      muted: 'Son coupé',
    },
  },
} as const;
