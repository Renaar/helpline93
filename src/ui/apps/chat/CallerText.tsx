import { parseSegments } from '../../../content/tags.ts';
import type { Dialogue } from '../../../engine/dialogue/types.ts';
import { useEngineState } from '../../engine/hooks.ts';
import { engine } from '../../engine/runtime.ts';
import { Capturable } from '../../feel/Capturable.tsx';
import { toStageRect, useStageGeometry } from '../../theme/stageScale.ts';
import { searchKeyword } from '../searchKeyword.ts';
import { useChat } from './chatStore.ts';

/** A caller message, with its key pieces of information capturable (GDD 4.2.3). */
export function CallerText({ text, dialogue }: { text: string; dialogue: Dialogue }) {
  const geometry = useStageGeometry();
  const closed = useEngineState(
    (state) => state.tickets.find((tk) => tk.id === dialogue.ticketId)?.status === 'closed',
  );
  const mission = engine.content.missions[dialogue.missionId];
  return (
    <>
      {parseSegments(text).map((segment, index) => {
        if (segment.kind === 'text') return <span key={index}>{segment.text}</span>;
        const capture = mission?.captures[segment.captureId];
        return (
          <Capturable
            key={index}
            captured={dialogue.captured.includes(segment.captureId)}
            disabled={closed}
            onCapture={(element) => {
              useChat
                .getState()
                .setCaptureSource(segment.captureId, toStageRect(element, geometry));
              engine.dispatch({
                type: 'CAPTURE',
                callId: dialogue.callId,
                captureId: segment.captureId,
              });
            }}
            onSearch={() => {
              searchKeyword(capture?.field ?? 'symptom', capture?.keywords[0] ?? segment.text);
            }}
          >
            {segment.text}
          </Capturable>
        );
      })}
    </>
  );
}
