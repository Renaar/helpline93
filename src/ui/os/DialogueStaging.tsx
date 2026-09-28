import type { Verb } from '../../engine/dialogue/types.ts';
import { useChat } from '../apps/chat/chatStore.ts';
import { withBlanks } from '../apps/chat/optionText.ts';
import { useHelpDesk } from '../apps/helpdesk/helpdeskStore.ts';
import { useEngineEvent } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { audio } from '../feel/audio.ts';
import { feelConfig } from '../feel/feel.config.ts';
import { useFlights } from '../feel/flight/flightStore.ts';
import type { Rect } from '../theme/layout.ts';
import { useStageGeometry } from '../theme/stageScale.ts';
import { elementRect, flightTarget } from './flightTargets.ts';

const overlaps = (a: Rect, b: Rect) =>
  a.y + a.height > b.y && a.y < b.y + b.height && a.x + a.width > b.x && a.x < b.x + b.width;

/**
 * Stages the conversation (no visuals of its own): message sounds, options flying from the
 * Viewer to the chat (GDD 4.2.2), captures flying to the ticket and the Notebook (4.2.3).
 */
export function DialogueStaging() {
  const geometry = useStageGeometry();
  const { durationMs, staggerMs } = feelConfig.flight;

  useEngineEvent('dialogue.started', () => {
    useChat.getState().reset();
    useHelpDesk.getState().pick(null);
  });
  useEngineEvent('caller.message', () => {
    audio.play('chat.receive');
  });
  useEngineEvent('operator.message', () => {
    audio.play('chat.send');
  });

  useEngineEvent('options.unlocked', ({ payload }) => {
    const { index } = engine.dialogue;
    const items: { id: string; verb: Verb }[] = [
      ...payload.questionIds.map((id) => ({ id, verb: 'ask' as const })),
      ...payload.instructionIds.map((id) => ({ id, verb: 'instruct' as const })),
    ];
    const to = flightTarget('chat-options', 'chat', geometry);
    const fallbackFrom = elementRect('[data-flight-target="viewer-page"]', geometry);
    let landed = false;
    const arrive = (ids: string[]) => {
      if (!landed) audio.play('option.unlock');
      landed = true;
      useChat.getState().addFresh(
        ids,
        items.filter((item) => ids.includes(item.id)).map((item) => item.verb),
      );
      setTimeout(() => {
        useChat.getState().removeFresh(ids);
      }, feelConfig.chat.freshGlowMs);
    };
    items.forEach((item, i) => {
      // From the line in the manual when it is on screen, else from the middle of the page.
      const line = elementRect(`[data-option-id="${item.id}"]`, geometry);
      const from = line && fallbackFrom && overlaps(line, fallbackFrom) ? line : fallbackFrom;
      const option =
        index.questions.get(item.id)?.option ?? index.instructions.get(item.id)?.option;
      if (!from || !to || !option) {
        setTimeout(() => {
          arrive([item.id]);
        }, i * staggerMs);
        return;
      }
      useFlights.getState().launch({
        from,
        to,
        label: withBlanks(option.text),
        variant: 'option',
        delayMs: i * staggerMs,
        onLand: () => {
          arrive([item.id]);
        },
      });
    });
  });

  useEngineEvent('capture.added', ({ payload }) => {
    const from = useChat.getState().captureSources[payload.captureId] ?? null;
    const flash = () => {
      useHelpDesk.getState().flash(payload.field);
      setTimeout(() => {
        useHelpDesk.getState().unflash(payload.field);
      }, feelConfig.ticket.flashMs);
    };
    const toTicket = flightTarget('ticket-fields', 'helpdesk', geometry);
    const toNotebook = flightTarget('notebook-clues', 'notebook', geometry);
    if (from && toTicket) {
      useFlights.getState().launch({
        from,
        to: toTicket,
        label: payload.label,
        variant: 'capture',
        delayMs: 0,
        onLand: flash,
      });
    } else flash();
    if (from && toNotebook) {
      useFlights.getState().launch({
        from,
        to: toNotebook,
        label: payload.label,
        variant: 'capture',
        delayMs: staggerMs,
        onLand: () => {
          audio.play('pen.write');
        },
      });
    } else {
      setTimeout(() => {
        audio.play('pen.write');
      }, durationMs);
    }
  });

  return null;
}
