import { describe, expect, it } from 'vitest';
import { createTranslator } from './i18n.ts';

const dictionary = {
  greeting: 'Bonsoir, {name}.',
  mail: { unread: { one: '{count} message non lu', other: '{count} messages non lus' } },
  price: 'Total : {amount} $',
} as const;

describe('createTranslator', () => {
  const t = createTranslator(dictionary, 'fr-CH');

  it('interpolates parameters', () => {
    expect(t('greeting', { name: 'Marc' })).toBe('Bonsoir, Marc.');
  });

  it('picks the plural form with Intl rules', () => {
    expect(t('mail.unread', { count: 1 })).toBe('1 message non lu');
    expect(t('mail.unread', { count: 3 })).toBe('3 messages non lus');
    expect(t('mail.unread', { count: 0 })).toBe('0 message non lu');
  });

  it('formats numbers for the locale', () => {
    expect(t('price', { amount: 1250.5 })).toBe(
      `Total : ${new Intl.NumberFormat('fr-CH').format(1250.5)} $`,
    );
  });

  it('leaves unknown placeholders visible', () => {
    expect(t('greeting')).toBe('Bonsoir, {name}.');
  });
});
