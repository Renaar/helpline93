import { describe, expect, it } from 'vitest';
import { buildBundle, type ContentIssue } from './bundle.ts';

const BASE_FILES: Record<string, string> = {
  'docs/manual.yaml': 'id: manual\ntitle: Manuel\npublisher: Heltron\nservice: NL',
  'docs/base.yaml': `
id: base
questions: [{ id: q.base.serial, text: Numéro ? }]
manage: [{ id: g.calm, text: Calme., then: { mood: 1 } }]
`,
  'docs/p12.yaml': `
id: p.12
tab: T
title: Bips
revision: { night: 1 }
body: Corps
questions: [{ id: q.bios.type, text: Longs ou courts ? }]
instructions:
  - id: i.ram.remove
    text: Retirez la barrette {slot}.
    params: { slot: { type: choice, options: [1, 2] } }
`,
  'codes/codes.yaml': 'id: codes\ncodes: [{ id: R-07, label: Mémoire }]',
  'callers/bob.yaml': `
id: c.bob
name: Bob
mood_start: 0
typing_speed: 1
fallback: { irrelevant: [Hein ?], repeat: [Déjà dit.], hold: [J'attends.] }
`,
};

const MISSION = `
id: m.n01_01
title: Test
night: 1
caller: c.bob
type: libre
captures:
  cap.bips: { label: Bips, field: symptom }
opening:
  - Ça fait des [[bips|cap.bips]].
responses:
  i.ram.remove:
    - when: { param: { slot: 2 } }
      say: [Réparé !]
      then: { end_call: resolved }
    - say: [Non.]
closure:
  codes:
    R-07: { then: { vars: { reputation: +1 } } }
    default: {}
`;

function build(mission: string, extra: Record<string, string> = {}) {
  return buildBundle({ ...BASE_FILES, 'missions/m.yaml': mission, ...extra });
}

const messages = (issues: ContentIssue[], level: ContentIssue['level']) =>
  issues.filter((issue) => issue.level === level).map((issue) => issue.message);

describe('content bundle', () => {
  it('builds a valid bundle without issues', () => {
    const { bundle, issues } = build(MISSION);
    expect(issues).toEqual([]);
    expect(bundle?.missions['m.n01_01']?.title).toBe('Test');
    expect(bundle?.pages.map((page) => page.id)).toEqual(['p.12']);
  });

  it('reports YAML and schema errors with the file name', () => {
    const { bundle, issues } = build('id: m.n01_01\ntitle: [oops');
    expect(bundle).toBeNull();
    expect(issues[0]?.file).toBe('missions/m.yaml');
  });

  it('reports duplicate ids', () => {
    const { issues } = build(MISSION, { 'missions/other.yaml': MISSION });
    expect(messages(issues, 'error').some((m) => m.includes('duplicate id "m.n01_01"'))).toBe(true);
  });

  it('reports a missing base, manual or codes file', () => {
    const { bundle, issues } = buildBundle({ 'missions/m.yaml': MISSION });
    expect(bundle).toBeNull();
    expect(issues.map((issue) => issue.file)).toEqual([
      'docs/manual.yaml',
      'docs/base.yaml',
      'codes/codes.yaml',
    ]);
  });

  it('reports broken references', () => {
    const broken = MISSION.replace('caller: c.bob', 'caller: c.nobody')
      .replace('[[bips|cap.bips]].', '[[bips|cap.nope]] [[x]]')
      .replace('i.ram.remove:', 'i.unknown:')
      .replace('R-07:', 'R-99:');
    const errors = messages(build(broken).issues, 'error');
    expect(errors).toEqual(
      expect.arrayContaining([
        'unknown caller c.nobody',
        'opening: unknown capture cap.nope',
        expect.stringContaining('malformed capture tag'),
        'responses: unknown option i.unknown',
        'closure: unknown code R-99',
      ]),
    );
  });

  it('checks parameters used in conditions', () => {
    const errors = messages(
      build(MISSION.replace('param: { slot: 2 }', 'param: { slot: 7, size: 1 }')).issues,
      'error',
    );
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('7 is not an option of "slot"'),
        expect.stringContaining('unknown parameter "size"'),
      ]),
    );
  });

  it('checks condition and unlock references', () => {
    const mission = MISSION.replace(
      '    - say: [Non.]',
      `    - when: { asked: [q.nope], done: [i.nope], captured: [cap.nope] }
      say: [Non.]
      then: { unlock: [q.base.serial, p.99] }`,
    );
    const errors = messages(build(mission).issues, 'error');
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('unknown question q.nope'),
        expect.stringContaining('unknown instruction i.nope'),
        expect.stringContaining('unknown capture cap.nope'),
        expect.stringContaining('q.base.serial is not a local question'),
        expect.stringContaining('unknown page p.99'),
      ]),
    );
  });

  it('checks instruction placeholders against parameters', () => {
    const files = { ...BASE_FILES };
    files['docs/p12.yaml'] = (files['docs/p12.yaml'] ?? '').replace('{slot}', '{position}');
    const errors = messages(buildBundle({ ...files, 'missions/m.yaml': MISSION }).issues, 'error');
    expect(errors).toEqual([
      'i.ram.remove: {position} has no parameter',
      'i.ram.remove: parameter "slot" is not in the text',
    ]);
  });

  it('refuses capture tags in caller files and unknown GÉRER reactions', () => {
    const errors = messages(
      build(MISSION, {
        'callers/bob.yaml': (BASE_FILES['callers/bob.yaml'] ?? '').replace(
          "hold: [J'attends.] }",
          "hold: ['[[x|cap.bips]]'], manage: { g.nope: [Ok] } }",
        ),
      }).issues,
      'error',
    );
    expect(errors).toEqual([
      'capture tags are only allowed in missions',
      'fallback.manage: unknown option g.nope',
    ]);
  });

  it('warns about likely writing mistakes without failing', () => {
    const mission = MISSION.replace(
      '    - say: [Non.]',
      '    - when: { flags_all: [f.never] }\n      say: [Non.]',
    )
      .replace('then: { end_call: resolved }', 'then: {}')
      .replace('default: {}', '')
      .replace('Ça fait des [[bips|cap.bips]].', 'Bonsoir.')
      .replace('responses:', 'local_questions: [{ id: q.local.x, text: X ? }]\nresponses:');
    const { bundle, issues } = build(mission);
    expect(bundle).not.toBeNull();
    expect(messages(issues, 'warning')).toEqual([
      'responses.i.ram.remove: the last entry should have no "when" (GDD 7.11)',
      'closure: no "default" rule',
      'capture cap.bips is never tagged in a message',
      'local question q.local.x is never unlocked',
      'no response ends the call as "resolved"',
      'flag f.never is tested but never set',
    ]);
  });
});
