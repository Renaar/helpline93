import { describe, expect, it } from 'vitest';
import { captureIdsIn, hasMalformedTag, messageText, parseSegments, plainText } from './tags.ts';

describe('capture tags', () => {
  it('splits a message into text and captures', () => {
    expect(parseSegments('Il fait [[3 bips|cap.bips]] au démarrage.')).toEqual([
      { kind: 'text', text: 'Il fait ' },
      { kind: 'capture', text: '3 bips', captureId: 'cap.bips' },
      { kind: 'text', text: ' au démarrage.' },
    ]);
  });

  it('handles tags at both ends and several tags', () => {
    const message = '[[HX-486|cap.model]] et [[0412|cap.serial]]';
    expect(captureIdsIn(message)).toEqual(['cap.model', 'cap.serial']);
    expect(plainText(message)).toBe('HX-486 et 0412');
  });

  it('keeps plain messages whole', () => {
    expect(parseSegments('Bonsoir.')).toEqual([{ kind: 'text', text: 'Bonsoir.' }]);
    expect(captureIdsIn('Bonsoir.')).toEqual([]);
  });

  it('detects malformed tags', () => {
    expect(hasMalformedTag('[[3 bips]]')).toBe(true);
    expect(hasMalformedTag('[[3 bips|cap.bips]')).toBe(true);
    expect(hasMalformedTag('[[3 bips|cap.bips]]')).toBe(false);
  });

  it('reads the text of both message forms', () => {
    expect(messageText('a')).toBe('a');
    expect(messageText({ text: 'b', pause: 2 })).toBe('b');
  });
});
