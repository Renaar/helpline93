import { Sandbox } from './debug/sandbox/Sandbox.tsx';
import { currentRoute } from './platform/routing.ts';
import { PlaceholderDesktop } from './ui/os/PlaceholderDesktop.tsx';
import { Stage } from './ui/theme/Stage.tsx';

export function App() {
  return <Stage>{currentRoute() === 'sandbox' ? <Sandbox /> : <PlaceholderDesktop />}</Stage>;
}
