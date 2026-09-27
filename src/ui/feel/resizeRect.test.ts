import { describe, expect, it } from 'vitest';
import { resizeRect } from './resizeRect.ts';

const limits = { bounds: { x: 0, y: 0, width: 1000, height: 800 }, minWidth: 300, minHeight: 200 };
const start = { x: 100, y: 100, width: 500, height: 400 };

describe('resizeRect', () => {
  it('grows from the right and bottom edges, keeping the top-left corner', () => {
    expect(resizeRect(start, 'se', 50, 80, limits)).toEqual({
      x: 100,
      y: 100,
      width: 550,
      height: 480,
    });
  });

  it('moves the left and top edges, keeping the opposite ones', () => {
    expect(resizeRect(start, 'nw', -40, 30, limits)).toEqual({
      x: 60,
      y: 130,
      width: 540,
      height: 370,
    });
  });

  it('only changes the dragged dimension on side handles', () => {
    expect(resizeRect(start, 'e', 20, 999, limits)).toEqual({ ...start, width: 520 });
    expect(resizeRect(start, 'n', 999, -20, limits)).toEqual({ ...start, y: 80, height: 420 });
  });

  it('never goes below the minimum size', () => {
    expect(resizeRect(start, 'se', -900, -900, limits)).toMatchObject({ width: 300, height: 200 });
    expect(resizeRect(start, 'nw', 900, 900, limits)).toEqual({
      x: 300,
      y: 300,
      width: 300,
      height: 200,
    });
  });

  it('never leaves the desktop', () => {
    expect(resizeRect(start, 'se', 900, 900, limits)).toEqual({
      x: 100,
      y: 100,
      width: 900,
      height: 700,
    });
    expect(resizeRect(start, 'nw', -900, -900, limits)).toEqual({
      x: 0,
      y: 0,
      width: 600,
      height: 500,
    });
  });
});
