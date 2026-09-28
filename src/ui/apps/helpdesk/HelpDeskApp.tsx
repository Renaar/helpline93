import type { Ticket } from '../../../engine/dialogue/types.ts';
import type { GameState } from '../../../engine/state.ts';
import { useEngineState } from '../../engine/hooks.ts';
import { TabBar } from '../../os/TabBar.tsx';
import { t } from '../../strings/i18n.ts';
import appStyles from '../apps.module.css';
import { currentDialogue } from '../currentCall.ts';
import { EmptyState } from '../EmptyState.tsx';
import { TicketHistory } from './TicketHistory.tsx';
import { TicketView } from './TicketView.tsx';
import { useHelpDesk, type HelpDeskTab } from './helpdeskStore.ts';

/** The ticket on screen: the one picked in the history, else the current call's, else the last. */
function shownTicket(state: GameState, picked: string | null): Ticket | undefined {
  if (picked !== null) return state.tickets.find((tk) => tk.id === picked);
  const dialogue = currentDialogue(state);
  return state.tickets.find((tk) => tk.id === dialogue?.ticketId) ?? state.tickets.at(-1);
}

/** Ticketing (GDD 4.3): automatic ticket, captured fields, closure by resolution code. */
export function HelpDeskApp() {
  const tab = useHelpDesk((state) => state.tab);
  const picked = useHelpDesk((state) => state.picked);
  const ticket = useEngineState((state) => shownTicket(state, picked));
  const count = useEngineState((state) => state.tickets.length);

  if (count === 0) {
    return (
      <EmptyState
        icon="helpdesk"
        title={t('apps.helpdesk.empty')}
        hint={t('apps.helpdesk.emptyHint')}
      />
    );
  }
  return (
    <div className={appStyles.app}>
      <TabBar<HelpDeskTab>
        tabs={[
          { id: 'current', label: t('apps.helpdesk.tabs.current') },
          { id: 'history', label: t('apps.helpdesk.tabs.history') },
        ]}
        selected={tab}
        onSelect={useHelpDesk.getState().setTab}
      />
      {tab === 'history' || !ticket ? (
        <TicketHistory />
      ) : (
        <TicketView key={ticket.id} ticket={ticket} />
      )}
    </div>
  );
}
