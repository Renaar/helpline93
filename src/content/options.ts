import type { ContentBundle, Instruction, ManageOption, Question } from './schemas.ts';

/** Where a chat option comes from (GDD 4.2.2: the list is sorted by page of origin). */
export type OptionSource =
  { kind: 'base' } | { kind: 'page'; pageId: string } | { kind: 'mission'; missionId: string };

export interface Indexed<T> {
  option: T;
  source: OptionSource;
}

export interface OptionIndex {
  questions: Map<string, Indexed<Question>>;
  instructions: Map<string, Indexed<Instruction>>;
  manage: Map<string, Indexed<ManageOption>>;
  /** Ids declared more than once (reported by content:check). */
  duplicates: string[];
}

/** Every question, instruction and GÉRER option of the content, by id. */
export function indexOptions(bundle: ContentBundle): OptionIndex {
  const index: OptionIndex = {
    questions: new Map(),
    instructions: new Map(),
    manage: new Map(),
    duplicates: [],
  };
  function add<T extends { id: string }>(
    map: Map<string, Indexed<T>>,
    options: T[],
    source: OptionSource,
  ) {
    for (const option of options) {
      if (map.has(option.id)) index.duplicates.push(option.id);
      else map.set(option.id, { option, source });
    }
  }
  const base: OptionSource = { kind: 'base' };
  add(index.questions, bundle.base.questions, base);
  add(index.instructions, bundle.base.instructions, base);
  add(index.manage, bundle.base.manage, base);
  for (const page of bundle.pages) {
    const source: OptionSource = { kind: 'page', pageId: page.id };
    add(index.questions, page.questions, source);
    add(index.instructions, page.instructions, source);
  }
  for (const mission of Object.values(bundle.missions)) {
    add(index.questions, mission.local_questions, { kind: 'mission', missionId: mission.id });
  }
  return index;
}

/** `{slot}` placeholders of an instruction text. */
export function placeholders(text: string): string[] {
  return [...text.matchAll(/\{([a-z_][a-z0-9_]*)\}/g)].map((match) => match[1] ?? '');
}
