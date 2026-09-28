import type { ContentBundle } from '../content/schemas.ts';

/** No content at all: the phone and the clock still work (debug calls, unit tests). */
export const EMPTY_CONTENT: ContentBundle = {
  manual: { id: 'manual', title: '', publisher: '', service: '' },
  pages: [],
  base: { id: 'base', questions: [], instructions: [], manage: [] },
  callers: {},
  missions: {},
  codes: [],
  emails: {},
  clients: {},
  nights: [],
};
