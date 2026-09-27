import type { ContentIssue } from './bundle.ts';
import { indexOptions, placeholders, type OptionIndex } from './options.ts';
import type { Condition, ContentBundle, Effect, Message, Mission } from './schemas.ts';
import { captureIdsIn, hasMalformedTag, messageText } from './tags.ts';

/**
 * References between content files (GDD 7.10): broken ids, capture tags, parameters,
 * resolution codes. Errors block the game; warnings point at likely writing mistakes.
 */
export function crossCheck(bundle: ContentBundle, fileOf: (id: string) => string): ContentIssue[] {
  const issues: ContentIssue[] = [];
  const index = indexOptions(bundle);
  const pageIds = new Set(bundle.pages.map((page) => page.id));
  const codeIds = new Set<string>();

  for (const code of bundle.codes) {
    if (codeIds.has(code.id)) {
      issues.push({ level: 'error', file: fileOf('codes'), message: `duplicate code ${code.id}` });
    }
    codeIds.add(code.id);
  }
  for (const id of index.duplicates) {
    issues.push({
      level: 'error',
      file: '(options)',
      message: `option id "${id}" is declared more than once`,
    });
  }

  // Instructions: every {placeholder} has a parameter, and every parameter is shown.
  for (const [id, { option, source }] of index.instructions) {
    const file = fileOf(source.kind === 'page' ? source.pageId : 'base');
    const shown = new Set(placeholders(option.text));
    const declared = new Set(Object.keys(option.params ?? {}));
    for (const name of shown) {
      if (!declared.has(name)) {
        issues.push({ level: 'error', file, message: `${id}: {${name}} has no parameter` });
      }
    }
    for (const name of declared) {
      if (!shown.has(name)) {
        issues.push({
          level: 'error',
          file,
          message: `${id}: parameter "${name}" is not in the text`,
        });
      }
    }
  }

  // Callers: no capture tags (captures belong to missions), known GÉRER options.
  for (const caller of Object.values(bundle.callers)) {
    const file = fileOf(caller.id);
    const { irrelevant, repeat, hold, manage = {} } = caller.fallback;
    for (const message of [...irrelevant, ...repeat, ...hold, ...Object.values(manage).flat()]) {
      if (captureIdsIn(messageText(message)).length > 0 || hasMalformedTag(messageText(message))) {
        issues.push({ level: 'error', file, message: 'capture tags are only allowed in missions' });
      }
    }
    for (const id of Object.keys(manage)) {
      if (!index.manage.has(id)) {
        issues.push({ level: 'error', file, message: `fallback.manage: unknown option ${id}` });
      }
    }
  }

  const flagsSet = new Set<string>();
  const flagsRead: { flag: string; file: string }[] = [];
  for (const mission of Object.values(bundle.missions)) {
    const check = checkMission(mission, bundle, index, pageIds, codeIds, fileOf(mission.id));
    issues.push(...check.issues);
    for (const flag of check.flagsSet) flagsSet.add(flag);
    flagsRead.push(...check.flagsRead);
  }
  for (const { flag, file } of flagsRead) {
    if (!flagsSet.has(flag)) {
      issues.push({ level: 'warning', file, message: `flag ${flag} is tested but never set` });
    }
  }
  return issues;
}

function checkMission(
  mission: Mission,
  bundle: ContentBundle,
  index: OptionIndex,
  pageIds: Set<string>,
  codeIds: Set<string>,
  file: string,
) {
  const issues: ContentIssue[] = [];
  const error = (message: string) => issues.push({ level: 'error', file, message });
  const warn = (message: string) => issues.push({ level: 'warning', file, message });
  const flagsSet = new Set<string>();
  const flagsRead: { flag: string; file: string }[] = [];
  const tagged = new Set<string>();
  const unlocked = new Set<string>();
  const localIds = new Set(mission.local_questions.map((q) => q.id));
  let resolvable = false as boolean; // set inside checkEffect()

  if (!(mission.caller in bundle.callers)) error(`unknown caller ${mission.caller}`);

  function checkMessages(where: string, messages: Message[]) {
    for (const message of messages) {
      const text = messageText(message);
      if (hasMalformedTag(text)) error(`${where}: malformed capture tag in "${text}"`);
      for (const id of captureIdsIn(text)) {
        if (id in mission.captures) tagged.add(id);
        else error(`${where}: unknown capture ${id}`);
      }
    }
  }

  function checkCondition(where: string, when: Condition | undefined, instructionId?: string) {
    if (!when) return;
    for (const flag of [...(when.flags_all ?? []), ...(when.flags_none ?? [])]) {
      flagsRead.push({ flag, file });
    }
    for (const id of when.captured ?? []) {
      if (!(id in mission.captures)) error(`${where}: unknown capture ${id}`);
    }
    for (const id of when.asked ?? []) {
      if (!index.questions.has(id)) error(`${where}: unknown question ${id}`);
    }
    for (const id of when.done ?? []) {
      if (!index.instructions.has(id)) error(`${where}: unknown instruction ${id}`);
    }
    if (when.param) {
      const params = instructionId
        ? index.instructions.get(instructionId)?.option.params
        : undefined;
      if (!params) error(`${where}: "param" only applies to an instruction with parameters`);
      else {
        for (const [name, value] of Object.entries(when.param)) {
          const param = params[name];
          if (!param) error(`${where}: unknown parameter "${name}"`);
          else if (param.type === 'choice' && !param.options.map(String).includes(String(value))) {
            error(`${where}: ${String(value)} is not an option of "${name}"`);
          }
        }
      }
    }
  }

  function checkEffect(where: string, then: Effect | undefined) {
    if (!then) return;
    for (const flag of then.set_flags ?? []) flagsSet.add(flag);
    for (const id of then.unlock ?? []) {
      if (id.startsWith('p.')) {
        if (!pageIds.has(id)) error(`${where}: unknown page ${id}`);
      } else if (localIds.has(id)) unlocked.add(id);
      else error(`${where}: ${id} is not a local question of this mission`);
    }
    if (then.end_call === 'resolved') resolvable = true;
  }

  checkMessages('opening', mission.opening);

  for (const [key, responses] of Object.entries(mission.responses)) {
    const known = index.questions.has(key) || index.instructions.has(key) || index.manage.has(key);
    const localOfOther = index.questions.get(key)?.source.kind === 'mission' && !localIds.has(key);
    if (!known || localOfOther) error(`responses: unknown option ${key}`);
    const instructionId = key.startsWith('i.') ? key : undefined;
    responses.forEach((response, i) => {
      const where = `responses.${key}[${i}]`;
      checkMessages(where, response.say);
      checkCondition(where, response.when, instructionId);
      checkEffect(where, response.then);
    });
    if (instructionId && responses.at(-1)?.when) {
      warn(`responses.${key}: the last entry should have no "when" (GDD 7.11)`);
    }
  }

  for (const [code, rule] of Object.entries(mission.closure.codes)) {
    if (code !== 'default' && !codeIds.has(code)) error(`closure: unknown code ${code}`);
    checkCondition(`closure.${code}`, rule.when);
    checkEffect(`closure.${code}`, rule.then);
  }
  if (!('default' in mission.closure.codes)) warn('closure: no "default" rule');

  for (const id of Object.keys(mission.captures)) {
    if (!tagged.has(id)) warn(`capture ${id} is never tagged in a message`);
  }
  for (const id of localIds) {
    if (!unlocked.has(id)) warn(`local question ${id} is never unlocked`);
  }
  if (!resolvable) warn('no response ends the call as "resolved"');
  return { issues, flagsSet, flagsRead };
}
