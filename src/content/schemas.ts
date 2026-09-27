import { z } from 'zod';

/**
 * Content schemas (GDD 7). J1 keeps only what the Viewer needs; questions, instructions and
 * the other content types are added in J2.
 */
export const manualSchema = z.object({
  id: z.literal('manual'),
  title: z.string().min(1),
  publisher: z.string().min(1),
  service: z.string().min(1),
});

export const docPageSchema = z.object({
  id: z.string().regex(/^p\.\d{2,3}$/, 'page ids look like p.12'),
  tab: z.string().min(1),
  title: z.string().min(1),
  keywords: z.array(z.string().min(1)).default([]),
  revision: z.object({ night: z.number().int().min(1) }),
  body: z.string().min(1),
});

export type Manual = z.infer<typeof manualSchema>;
export type DocPage = z.infer<typeof docPageSchema>;

/** "p.12" → 12 */
export function pageNumber(page: Pick<DocPage, 'id'>): number {
  return Number(page.id.slice(2));
}
