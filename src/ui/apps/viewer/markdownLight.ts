/**
 * "Light markdown" of manual pages (GDD 7.5): headings (##, ###), paragraphs, lists (- ),
 * tables (| a | b |, first row = header), notes (> ) and **bold**. Nothing else, no HTML.
 */
export type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'note'; text: string };

export interface Span {
  text: string;
  bold: boolean;
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

const isSeparatorRow = (cells: string[]) => cells.every((cell) => /^:?-{2,}:?$/.test(cell));

export function parseBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]?.trim() ?? '';
    if (line === '') {
      i++;
    } else if (line.startsWith('### ') || line.startsWith('## ')) {
      const level = line.startsWith('### ') ? 3 : 2;
      blocks.push({ type: 'heading', level, text: line.slice(level + 1).trim() });
      i++;
    } else if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (lines[i]?.trim().startsWith('|')) {
        const cells = tableCells(lines[i] ?? '');
        if (!isSeparatorRow(cells)) rows.push(cells);
        i++;
      }
      const [header = [], ...rest] = rows;
      blocks.push({ type: 'table', header, rows: rest });
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (lines[i]?.trim().startsWith('- ')) {
        items.push((lines[i] ?? '').trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'list', items });
    } else if (line.startsWith('> ')) {
      const parts: string[] = [];
      while (lines[i]?.trim().startsWith('> ')) {
        parts.push((lines[i] ?? '').trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'note', text: parts.join(' ') });
    } else {
      const parts: string[] = [];
      while (i < lines.length) {
        const next = lines[i]?.trim() ?? '';
        if (next === '' || /^(#{2,3} |\||- |> )/.test(next)) break;
        parts.push(next);
        i++;
      }
      blocks.push({ type: 'paragraph', text: parts.join(' ') });
    }
  }
  return blocks;
}

/** Splits `**bold**` markers into spans. An unclosed marker stays literal text. */
export function parseSpans(text: string): Span[] {
  const spans: Span[] = [];
  const pattern = /\*\*(.+?)\*\*/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) spans.push({ text: text.slice(last, match.index), bold: false });
    spans.push({ text: match[1] ?? '', bold: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) spans.push({ text: text.slice(last), bold: false });
  return spans;
}

/** Plain text of a page body (for search), without markup. */
export function plainText(body: string): string {
  return parseBlocks(body)
    .map((block) => {
      switch (block.type) {
        case 'list':
          return block.items.join(' ');
        case 'table':
          return [block.header, ...block.rows].map((row) => row.join(' ')).join(' ');
        default:
          return block.text;
      }
    })
    .join(' ')
    .replace(/\*\*/g, '');
}
