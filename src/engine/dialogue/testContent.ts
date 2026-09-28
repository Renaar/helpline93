import { loadBundle } from '../../content/bundle.ts';

/** A small, complete content set for engine tests (independent of content/). */
export const testContent = loadBundle({
  'docs/manual.yaml': 'id: manual\ntitle: Manuel\npublisher: Heltron\nservice: NL',
  'docs/base.yaml': `
id: base
questions:
  - { id: q.base.serial, text: Numéro de série ? }
  - { id: q.base.since, text: Depuis quand ? }
instructions:
  - { id: i.base.restart, text: Redémarrez. }
manage:
  - { id: g.calm, text: Du calme., then: { mood: 1 } }
  - { id: g.wait, text: Un instant. }
`,
  'docs/p12.yaml': `
id: p.12
tab: Démarrage
title: Codes sonores
revision: { night: 1 }
body: Corps
questions:
  - { id: q.bios.type, text: Longs ou courts ? }
instructions:
  - { id: i.case.open, text: Ouvrez le boîtier. }
  - id: i.ram.remove
    text: Retirez la barrette {slot}.
    params: { slot: { type: choice, options: [1, 2] } }
`,
  'docs/p20.yaml': 'id: p.20\ntab: T\ntitle: Sans options\nrevision: { night: 1 }\nbody: Corps',
  'docs/p31.yaml': `
id: p.31
tab: Cartes
title: Cavaliers
revision: { night: 1 }
body: Corps
instructions:
  - id: i.code.enter
    text: Tapez {code}.
    params: { code: { type: code, format: R-## } }
`,
  'codes/codes.yaml': `
id: codes
codes: [{ id: R-07, label: Mémoire }, { id: R-09, label: Atelier }]
`,
  'callers/bob.yaml': `
id: c.bob
name: Bob
phone: '7075550142'
mood_start: 0
typing_speed: 1
fallback:
  irrelevant: [Hein ?, Quoi ?]
  repeat: [Déjà dit.]
  hold: [J'attends.]
  manage: { g.calm: [Je suis calme.] }
`,
  'missions/m.yaml': `
id: m.n01_01
title: Test
night: 1
caller: c.bob
type: libre
captures:
  cap.bips: { label: 3 bips, field: symptom, keywords: [bips] }
  cap.serial: { label: N° 0412, field: serial }
opening:
  - Bonsoir.
  - Ça fait [[3 bips|cap.bips]].
local_questions:
  - { id: q.local.secret, text: Un secret ? }
responses:
  q.base.serial:
    - say: ['[[0412|cap.serial]].']
  q.base.since:
    - when: { captured: [cap.serial] }
      say: ['Depuis hier, et le numéro est noté.']
      then: { unlock: [q.local.secret, p.31], email: { id: e.test, delay: 5 } }
    - say: [Depuis hier.]
  q.local.secret:
    - say: [Chut.]
      then: { vars: { suspicion: '=3' }, clear_flags: [f.t.open] }
  i.case.open:
    - say: [Ouvert.]
      then: { set_flags: [f.t.open] }
  i.ram.remove:
    - when: { flags_none: [f.t.open] }
      say: [C'est fermé.]
      then: { mood: -1 }
    - when: { param: { slot: 2 }, mood: '>=-1' }
      say: [Je rallume…, { text: Ça marche !, pause: 2, typing: 1 }]
      then: { set_flags: [f.t.fixed], end_call: resolved }
    - say: [Toujours pareil.]
      then: { mood: -1 }
  i.base.restart:
    - when: { vars: { suspicion: '>=3' } }
      say: [Vous êtes bizarre.]
      then: { end_call: hangup }
    - say: [Rien.]
closure:
  codes:
    R-07:
      when: { flags_all: [f.t.fixed] }
      then: { vars: { reputation: +1 } }
    default:
      then: { vars: { reputation: -1 } }
`,
});
