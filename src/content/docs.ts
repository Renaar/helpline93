import { parse } from 'yaml';
import { docPageSchema, manualSchema, pageNumber, type DocPage, type Manual } from './schemas.ts';

const files = import.meta.glob<string>('../../content/docs/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function load(): { manual: Manual; pages: DocPage[] } {
  let manual: Manual | null = null;
  const pages: DocPage[] = [];
  for (const [path, source] of Object.entries(files)) {
    const data: unknown = parse(source);
    const isManual =
      typeof data === 'object' && data !== null && 'id' in data && data.id === 'manual';
    if (isManual) manual = manualSchema.parse(data);
    else {
      const result = docPageSchema.safeParse(data);
      if (!result.success) throw new Error(`${path}: ${result.error.message}`);
      pages.push(result.data);
    }
  }
  if (!manual) throw new Error('content/docs/manual.yaml is missing');
  pages.sort((a, b) => pageNumber(a) - pageNumber(b));
  return { manual, pages };
}

/** The procedure manual shown in the Viewer (validated at load; content:check does it earlier). */
export const docs = load();
