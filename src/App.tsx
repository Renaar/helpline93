import { Sandbox } from './debug/sandbox/Sandbox.tsx';
import { currentRoute } from './platform/routing.ts';
import { Shell } from './ui/boot/Shell.tsx';
import { Stage } from './ui/theme/Stage.tsx';

export function App() {
  return <Stage>{currentRoute() === 'sandbox' ? <Sandbox /> : <Shell />}</Stage>;
}
