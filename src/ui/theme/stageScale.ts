import { createContext, useContext } from 'react';

/** Current scale of the 1920 × 1080 stage. Pointer maths (dragging) must divide by it. */
export const StageScaleContext = createContext(1);

export function useStageScale(): number {
  return useContext(StageScaleContext);
}
