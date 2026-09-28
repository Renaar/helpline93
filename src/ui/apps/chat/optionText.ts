import { t } from '../../strings/i18n.ts';

/** An instruction as printed in the manual or flying to the chat: `{slot}` → `[ ]`. */
export function withBlanks(text: string): string {
  return text.replace(/\{[a-z_][a-z0-9_]*\}/g, t('apps.viewer.blank'));
}

/** Splits an instruction text around its `{param}` placeholders. */
export function splitPlaceholders(
  text: string,
): ({ kind: 'text'; text: string } | { kind: 'param'; name: string })[] {
  return text
    .split(/(\{[a-z_][a-z0-9_]*\})/g)
    .filter((part) => part !== '')
    .map((part) =>
      /^\{[a-z_][a-z0-9_]*\}$/.test(part)
        ? { kind: 'param', name: part.slice(1, -1) }
        : { kind: 'text', text: part },
    );
}
