import { describe, expect, it } from 'vitest';
import { parseBlocks, parseSpans, plainText } from './markdownLight.ts';

describe('parseBlocks', () => {
  it('reads headings, paragraphs, lists, tables and notes', () => {
    const body = [
      '## Titre',
      'Première ligne',
      'suite du paragraphe.',
      '',
      '- un',
      '- deux',
      '| A | B |',
      '| --- | --- |',
      '| 1 | 2 |',
      '> Attention',
      '### Sous-titre',
    ].join('\n');
    expect(parseBlocks(body)).toEqual([
      { type: 'heading', level: 2, text: 'Titre' },
      { type: 'paragraph', text: 'Première ligne suite du paragraphe.' },
      { type: 'list', items: ['un', 'deux'] },
      { type: 'table', header: ['A', 'B'], rows: [['1', '2']] },
      { type: 'note', text: 'Attention' },
      { type: 'heading', level: 3, text: 'Sous-titre' },
    ]);
  });
});

describe('parseSpans', () => {
  it('splits bold markers', () => {
    expect(parseSpans('code **R-07** ok')).toEqual([
      { text: 'code ', bold: false },
      { text: 'R-07', bold: true },
      { text: ' ok', bold: false },
    ]);
  });

  it('keeps an unclosed marker as text', () => {
    expect(parseSpans('a **b')).toEqual([{ text: 'a **b', bold: false }]);
  });
});

describe('plainText', () => {
  it('drops markup', () => {
    expect(plainText('## T\n- **gras**\n| a | b |')).toBe('T gras a b');
  });
});
