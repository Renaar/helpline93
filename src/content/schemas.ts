import { z } from 'zod';

/**
 * Content schemas (GDD 7): the source of truth for every YAML file in content/.
 * Identifiers carry their type as a prefix and are unique across all content (GDD 7.4).
 */

const idPattern = (prefix: string) => new RegExp(`^${prefix.replace('.', '\\.')}[a-z0-9_.]+$`);
const prefixed = (prefix: string, example: string) =>
  z.string().regex(idPattern(prefix), `ids look like ${example}`);

export const questionId = prefixed('q.', 'q.bios.bip_type');
export const instructionId = prefixed('i.', 'i.ram.remove_slot');
/** GÉRER options (calm down, ask to wait…): not in GDD 7.4 yet, prefix `g.` (J2 decision). */
export const manageId = prefixed('g.', 'g.calm');
export const captureId = prefixed('cap.', 'cap.bips');
export const flagId = prefixed('f.', 'f.m03.fixed');
export const callerId = prefixed('c.', 'c.bernard_fleury');
export const clientId = prefixed('cl.', 'cl.0412');
export const pageId = z.string().regex(/^p\.\d{2,3}$/, 'page ids look like p.12');
export const missionId = z.string().regex(/^m\.n\d{2}_\d{2}$/, 'mission ids look like m.n01_03');
export const codeId = z.string().regex(/^R-\d{2}$/, 'resolution codes look like R-07');
export const emailId = prefixed('e.', 'e.n01.kessler_accueil');
export const nightId = z.string().regex(/^n\.\d{2}$/, 'night ids look like n.01');
/** "22:20", "03:33": a time of the shift (after midnight = the next morning). */
export const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'times look like "22:20"');
const tenDigits = z.string().regex(/^\d{10}$/, 'ten digits, e.g. 7075550142');

export const VAR_NAMES = ['reputation', 'suspicion', 'awareness'] as const;
export type VarName = (typeof VAR_NAMES)[number];

export const MOOD_MIN = -2;
export const MOOD_MAX = 2;

// ── Messages ────────────────────────────────────────────────────────────────

/** A caller message: plain text, or text with a silence before it and/or a forced typing time. */
export const messageSchema = z.union([
  z.string().min(1),
  z.object({
    text: z.string().min(1),
    /** Silence before the caller starts typing, in seconds (suspense). */
    pause: z.number().min(0).optional(),
    /** Typing time in seconds, instead of the automatic one. */
    typing: z.number().min(0).optional(),
  }),
]);
export type Message = z.infer<typeof messageSchema>;

// ── Conditions and effects (GDD 7.7) ──────────────────────────────────────────

/** "<=0", ">=3", "=1", "2"… compared with a number. */
export const comparisonSchema = z.union([
  z.number(),
  z.string().regex(/^(<=|>=|<|>|==|=)?\s*-?\d+$/, 'comparisons look like "<=0" or ">=3"'),
]);

const paramValue = z.union([z.string(), z.number()]);

export const conditionSchema = z
  .object({
    flags_all: z.array(flagId).optional(),
    flags_none: z.array(flagId).optional(),
    captured: z.array(captureId).optional(),
    asked: z.array(questionId).optional(),
    done: z.array(instructionId).optional(),
    param: z.record(z.string(), paramValue).optional(),
    mood: comparisonSchema.optional(),
    vars: z.partialRecord(z.enum(VAR_NAMES), comparisonSchema).optional(),
  })
  .strict();
export type Condition = z.infer<typeof conditionSchema>;

/** Variable change: a number is added ("+1", "-2"); "=0" sets the value. */
export const varChangeSchema = z.union([
  z.number(),
  z.string().regex(/^=\s*-?\d+$/, 'use +1 / -2 to add, or "=0" to set'),
]);

export const END_OUTCOMES = ['resolved', 'failed', 'hangup'] as const;
export type EndOutcome = (typeof END_OUTCOMES)[number];

export const effectSchema = z
  .object({
    set_flags: z.array(flagId).optional(),
    clear_flags: z.array(flagId).optional(),
    vars: z.partialRecord(z.enum(VAR_NAMES), varChangeSchema).optional(),
    mood: z.number().int().optional(),
    /** Local questions of the mission, or doc pages (as if consulted). */
    unlock: z.array(z.union([questionId, pageId])).optional(),
    /** E-mail sent now or later (game minutes). Delivered by the Mail app in J3. */
    email: z.object({ id: z.string().min(1), delay: z.number().min(0).optional() }).optional(),
    end_call: z.enum(END_OUTCOMES).optional(),
    /** Reserved for the urgent-call gauge (GDD 4.10): accepted, ignored for now. */
    pressure: z.number().optional(),
  })
  .strict();
export type Effect = z.infer<typeof effectSchema>;

// ── Documentation (GDD 7.5) ───────────────────────────────────────────────────

export const paramSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), options: z.array(paramValue).min(1) }),
  z.object({ type: z.literal('number'), min: z.number().optional(), max: z.number().optional() }),
  z.object({
    type: z.literal('text'),
    /** Regular expression the value must match (optional). */
    pattern: z.string().optional(),
    max_length: z.number().int().positive().optional(),
  }),
  /** Imposed format: # = digit, A = letter, anything else literal (e.g. "R-##"). */
  z.object({ type: z.literal('code'), format: z.string().min(1) }),
]);
export type Param = z.infer<typeof paramSchema>;

export const questionSchema = z.object({ id: questionId, text: z.string().min(1) }).strict();
export type Question = z.infer<typeof questionSchema>;

export const instructionSchema = z
  .object({
    id: instructionId,
    /** Text with {param} placeholders. */
    text: z.string().min(1),
    params: z.record(z.string().regex(/^[a-z_][a-z0-9_]*$/), paramSchema).optional(),
  })
  .strict();
export type Instruction = z.infer<typeof instructionSchema>;

export const manageOptionSchema = z
  .object({
    id: manageId,
    text: z.string().min(1),
    /** Default effect when the mission does not override it (e.g. calming: mood +1). */
    then: effectSchema.optional(),
  })
  .strict();
export type ManageOption = z.infer<typeof manageOptionSchema>;

export const manualSchema = z
  .object({
    id: z.literal('manual'),
    title: z.string().min(1),
    publisher: z.string().min(1),
    service: z.string().min(1),
  })
  .strict();

export const docPageSchema = z
  .object({
    id: pageId,
    tab: z.string().min(1),
    title: z.string().min(1),
    keywords: z.array(z.string().min(1)).default([]),
    revision: z.object({ night: z.number().int().min(1) }),
    body: z.string().min(1),
    /** Added to ASK when the page is consulted during a call (GDD 4.2.2). */
    questions: z.array(questionSchema).default([]),
    /** Added to INSTRUCT when the page is consulted during a call. */
    instructions: z.array(instructionSchema).default([]),
  })
  .strict();

/** content/docs/base.yaml: options always available during a call (GDD 4.2.1). */
export const baseOptionsSchema = z
  .object({
    id: z.literal('base'),
    questions: z.array(questionSchema).default([]),
    instructions: z.array(instructionSchema).default([]),
    manage: z.array(manageOptionSchema).default([]),
  })
  .strict();

export type Manual = z.infer<typeof manualSchema>;
export type DocPage = z.infer<typeof docPageSchema>;
export type BaseOptions = z.infer<typeof baseOptionsSchema>;

// ── Callers (GDD 7.6) ─────────────────────────────────────────────────────────

const lines = z.array(messageSchema).min(1);

export const callerSchema = z
  .object({
    id: callerId,
    name: z.string().min(1),
    /** Ten digits, US style (shown on the incoming-call window). A fictional one if omitted. */
    phone: z
      .string()
      .regex(/^\d{10}$/, 'ten digits, e.g. 2135550142')
      .optional(),
    mood_start: z.number().int().min(MOOD_MIN).max(MOOD_MAX),
    typing_speed: z.number().positive(),
    fallback: z
      .object({
        irrelevant: lines,
        repeat: lines,
        hold: lines,
        /** Reactions to GÉRER options, by option id. */
        manage: z.record(manageId, lines).optional(),
      })
      .strict(),
  })
  .strict();
export type Caller = z.infer<typeof callerSchema>;

// ── Missions (GDD 7.7) ────────────────────────────────────────────────────────

export const CAPTURE_FIELDS = [
  'symptom',
  'serial',
  'model',
  'name',
  'place',
  'reference',
  'error',
  'product',
] as const;
export type CaptureField = (typeof CAPTURE_FIELDS)[number];

export const captureSchema = z
  .object({
    label: z.string().min(1),
    field: z.enum(CAPTURE_FIELDS),
    keywords: z.array(z.string().min(1)).default([]),
  })
  .strict();
export type Capture = z.infer<typeof captureSchema>;

export const responseSchema = z
  .object({
    when: conditionSchema.optional(),
    say: z.array(messageSchema).default([]),
    then: effectSchema.optional(),
  })
  .strict();
export type Response = z.infer<typeof responseSchema>;

export const closureRuleSchema = z
  .object({ when: conditionSchema.optional(), then: effectSchema.optional() })
  .strict();

export const missionSchema = z
  .object({
    id: missionId,
    title: z.string().min(1),
    night: z.number().int().min(1),
    caller: callerId,
    client: clientId.optional(),
    type: z.enum(['libre', 'urgent']),
    network: z.boolean().default(false),
    captures: z.record(captureId, captureSchema).default({}),
    opening: z.array(messageSchema).min(1),
    local_questions: z.array(questionSchema).default([]),
    /** Key = question / instruction / GÉRER option id; the first entry whose `when` holds plays. */
    responses: z
      .record(z.union([questionId, instructionId, manageId]), z.array(responseSchema).min(1))
      .default({}),
    closure: z
      .object({
        codes: z.record(z.union([codeId, z.literal('default')]), closureRuleSchema),
      })
      .strict(),
  })
  .strict();
export type Mission = z.infer<typeof missionSchema>;

// ── Resolution codes (GDD 7.8) ────────────────────────────────────────────────

export const codesSchema = z
  .object({
    id: z.literal('codes'),
    codes: z
      .array(
        z
          .object({
            id: codeId,
            /** Official meaning, shown in HelpDesk. */
            label: z.string().min(1),
            /** Hidden meaning, revealed progressively in the Notebook (J6). */
            hidden: z.string().optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export type ResolutionCode = z.infer<typeof codesSchema>['codes'][number];

// ── E-mails (GDD 4.5) ─────────────────────────────────────────────────────────

export const emailSchema = z
  .object({
    id: emailId,
    /** Sender as displayed ("M. Kessler"). Empty = no sender shown. */
    from: z.string(),
    /** Sender address, if any ("kessler@heltron.corp"). */
    address: z.string().optional(),
    subject: z.string().min(1),
    /** Light markdown, like manual pages. */
    body: z.string().min(1),
  })
  .strict();
export type Email = z.infer<typeof emailSchema>;

// ── Client records (GDD 4.4) ──────────────────────────────────────────────────

/** Free text that writers may type as a bare number in YAML (years: `since: 1991`). */
const freeText = z.union([z.string().min(1), z.number()]).transform(String);

export const clientSchema = z
  .object({
    id: clientId,
    name: z.string().min(1),
    company: z.string().optional(),
    city: z.string().min(1),
    address: z.string().optional(),
    phone: tenDigits.optional(),
    /** Customer since (free text, e.g. "1991"). */
    since: freeText.optional(),
    equipment: z
      .array(
        z
          .object({
            serial: z.string().min(1),
            model: z.string().min(1),
            purchased: freeText.optional(),
            warranty: freeText.optional(),
          })
          .strict(),
      )
      .default([]),
    /** Past contacts with the hotline, oldest first. */
    history: z
      .array(z.object({ date: z.string().min(1), text: z.string().min(1) }).strict())
      .default([]),
    notes: z.string().optional(),
  })
  .strict();
export type Client = z.infer<typeof clientSchema>;

// ── Nights (GDD 7.9) ──────────────────────────────────────────────────────────

export const nightCallSchema = z
  .object({
    mission: missionId,
    /** Fixed time of the shift… */
    at: clockTime.optional(),
    /** …or game minutes after the previous call of the night has ended. */
    after_previous: z.number().int().min(0).optional(),
    /** The call only happens if this holds when it is due to be planned. */
    when: conditionSchema.optional(),
  })
  .strict()
  .refine((call) => (call.at === undefined) !== (call.after_previous === undefined), {
    message: 'give either "at" or "after_previous"',
  });
export type NightCall = z.infer<typeof nightCallSchema>;

export const nightEventSchema = z
  .object({
    at: clockTime,
    /** Only e-mails for the MVP; scripted events (GDD 4.9) come later. */
    type: z.literal('email'),
    id: emailId,
  })
  .strict();

export const nightSchema = z
  .object({
    id: nightId,
    title: z.string().min(1),
    start: clockTime,
    end: clockTime,
    emails_at_boot: z.array(emailId).default([]),
    calls: z.array(nightCallSchema).min(1),
    events: z.array(nightEventSchema).default([]),
  })
  .strict();
export type Night = z.infer<typeof nightSchema>;

/** Every validated content file, as loaded by the game and by content:check. */
export interface ContentBundle {
  manual: Manual;
  /** Sorted by page number. */
  pages: DocPage[];
  base: BaseOptions;
  callers: Record<string, Caller>;
  missions: Record<string, Mission>;
  codes: ResolutionCode[];
  emails: Record<string, Email>;
  clients: Record<string, Client>;
  /** Sorted by night number. */
  nights: Night[];
}

/** "p.12" → 12 */
export function pageNumber(page: Pick<DocPage, 'id'>): number {
  return Number(page.id.slice(2));
}
