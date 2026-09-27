/**
 * Capture tags in caller messages (GDD 7.7): `[[text shown|cap.id]]`.
 * Pure helpers shared by the engine, the UI and content:check.
 */
import type { Message } from './schemas.ts';

export type Segment =
  { kind: 'text'; text: string } | { kind: 'capture'; text: string; captureId: string };

const TAG = /\[\[([^[\]|]+)\|([^[\]|]+)\]\]/g;

/** Splits a message into plain text and capturable pieces. */
export function parseSegments(message: string): Segment[] {
  const segments: Segment[] = [];
  let last = 0;
  for (const match of message.matchAll(TAG)) {
    const [whole, text = '', captureId = ''] = match;
    if (match.index > last) segments.push({ kind: 'text', text: message.slice(last, match.index) });
    segments.push({ kind: 'capture', text, captureId: captureId.trim() });
    last = match.index + whole.length;
  }
  if (last < message.length) segments.push({ kind: 'text', text: message.slice(last) });
  return segments;
}

/** Capture ids tagged in a message. */
export function captureIdsIn(message: string): string[] {
  return parseSegments(message).flatMap((s) => (s.kind === 'capture' ? [s.captureId] : []));
}

/** The message as the reader sees it, without tag markup. */
export function plainText(message: string): string {
  return parseSegments(message)
    .map((s) => s.text)
    .join('');
}

/** True when `[[` or `]]` remain once every well-formed tag is removed. */
export function hasMalformedTag(message: string): boolean {
  const rest = message.replace(TAG, '');
  return rest.includes('[[') || rest.includes(']]');
}

/** The raw text of a caller message (tags included). */
export function messageText(message: Message): string {
  return typeof message === 'string' ? message : message.text;
}
