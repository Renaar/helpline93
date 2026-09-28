import { describe, expect, it } from 'vitest';
import type { Client } from '../../../content/schemas.ts';
import { searchClients } from './searchClients.ts';

const client = (id: string, name: string, city: string, serial: string): Client => ({
  id,
  name,
  city,
  equipment: [{ serial, model: 'Heltron HX-486' }],
  history: [],
});

const clients = [
  client('cl.0412', 'Bernard Fleury', 'Harbor Heights', 'HX-486-0412'),
  client('cl.0077', 'Doris Kowalski', 'Old Mission', 'HX-386-0077'),
];

describe('searchClients', () => {
  it('finds by name, city or serial, ignoring accents and case', () => {
    expect(searchClients(clients, 'fleury').map((c) => c.id)).toEqual(['cl.0412']);
    expect(searchClients(clients, 'HX-386').map((c) => c.id)).toEqual(['cl.0077']);
    expect(searchClients(clients, 'harbor heights').map((c) => c.id)).toEqual(['cl.0412']);
    expect(searchClients(clients, 'hx 486').map((c) => c.id)).toEqual(['cl.0412', 'cl.0077']);
  });

  it('needs two characters and every word', () => {
    expect(searchClients(clients, 'b')).toEqual([]);
    expect(searchClients(clients, 'doris fleury')).toEqual([]);
  });
});
