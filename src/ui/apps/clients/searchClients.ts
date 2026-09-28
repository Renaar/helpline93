import type { Client } from '../../../content/schemas.ts';
import { fold } from '../viewer/search.ts';

export const MIN_CLIENT_QUERY = 2;

/** Every searchable text of a record: name, company, city, address, phone, serials, models. */
function haystack(client: Client): string {
  return fold(
    [
      client.id,
      client.name,
      client.company ?? '',
      client.city,
      client.address ?? '',
      client.phone ?? '',
      ...client.equipment.flatMap((e) => [e.serial, e.model]),
    ].join(' '),
  );
}

/** Records matching every word of the query (accents and case ignored), in name order. */
export function searchClients(clients: readonly Client[], query: string): Client[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (query.trim().length < MIN_CLIENT_QUERY) return [];
  return clients
    .filter((client) => {
      const text = haystack(client);
      return words.every((word) => text.includes(word));
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
