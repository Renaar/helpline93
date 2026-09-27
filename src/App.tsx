import { MotionConfig } from 'motion/react';
import { Sandbox } from './debug/sandbox/Sandbox.tsx';
import { currentRoute } from './platform/routing.ts';
import { Shell } from './ui/boot/Shell.tsx';
import { Stage } from './ui/theme/Stage.tsx';

/**
 * "Reduced animations" is a game setting (initialised from the system preference) that every
 * component applies itself, so Motion must not second-guess it.
 */
export function App() {
  return (
    <MotionConfig reducedMotion="never">
      <Stage>{currentRoute() === 'sandbox' ? <Sandbox /> : <Shell />}</Stage>
    </MotionConfig>
  );
}
