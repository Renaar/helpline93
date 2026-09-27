/** Entry points selected by the URL query (CLAUDE.md): `?sandbox` opens the feel-kit sandbox. */
export type Route = 'game' | 'sandbox';

export function currentRoute(search: string = window.location.search): Route {
  return new URLSearchParams(search).has('sandbox') ? 'sandbox' : 'game';
}

export function navigateTo(route: Route): void {
  window.location.search = route === 'sandbox' ? '?sandbox' : '';
}
