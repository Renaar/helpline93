import type { CaptureField } from '../../content/schemas.ts';
import { searchClientBase } from './clients/clientsStore.ts';
import { searchManual } from './viewer/searchManual.ts';

/** Fields that identify a client: searched in the client database, the rest in the manual. */
const CLIENT_FIELDS: readonly CaptureField[] = ['serial', 'name', 'place'];

/** A captured piece of information used as a keyword (GDD 4.2.3). */
export function searchKeyword(field: CaptureField, keyword: string): void {
  if (CLIENT_FIELDS.includes(field)) searchClientBase(keyword);
  else searchManual(keyword);
}

export function searchesClients(field: CaptureField): boolean {
  return CLIENT_FIELDS.includes(field);
}
