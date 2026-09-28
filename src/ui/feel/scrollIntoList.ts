/**
 * Scrolls the nearest `[data-scroll-list]` ancestor (and only it) so that `element` is fully
 * visible. Unlike scrollIntoView, it never moves the stage or the windows around.
 */
export function scrollIntoList(element: HTMLElement, smooth: boolean): void {
  const list = element.parentElement?.closest<HTMLElement>('[data-scroll-list]');
  if (!list) return;
  const box = element.getBoundingClientRect();
  const frame = list.getBoundingClientRect();
  const scale = frame.height / list.offsetHeight || 1;
  let delta = 0;
  if (box.bottom > frame.bottom) delta = (box.bottom - frame.bottom) / scale;
  if (box.top - delta * scale < frame.top) delta = (box.top - frame.top) / scale;
  if (delta !== 0) list.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' });
}
