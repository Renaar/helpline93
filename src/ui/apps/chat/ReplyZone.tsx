import { useMemo } from 'react';
import { pageNumber } from '../../../content/schemas.ts';
import { availableOptions, canReply, type ChatOption } from '../../../engine/index.ts';
import type { Dialogue, Verb } from '../../../engine/dialogue/types.ts';
import { useEngineState } from '../../engine/hooks.ts';
import { engine } from '../../engine/runtime.ts';
import { TabBar } from '../../os/TabBar.tsx';
import { t } from '../../strings/i18n.ts';
import styles from './Chat.module.css';
import { useChat } from './chatStore.ts';
import { OptionRow } from './OptionRow.tsx';

const VERBS: readonly Verb[] = ['ask', 'instruct', 'manage'];

interface Group {
  key: string;
  title: string;
  options: ChatOption[];
}

function groupTitle(option: ChatOption): string {
  const { source } = option;
  if (source.kind === 'page') {
    const page = engine.content.pages.find((p) => p.id === source.pageId);
    return t('apps.chat.sources.page', {
      number: page ? pageNumber(page) : source.pageId,
      title: page?.title ?? '',
    });
  }
  if (source.kind === 'mission') return t('apps.chat.sources.mission');
  return option.verb === 'manage' ? t('apps.chat.sources.manage') : t('apps.chat.sources.base');
}

/** Options grouped by origin: base first, then pages in the order they were consulted. */
function groupOptions(options: ChatOption[]): Group[] {
  const groups: Group[] = [];
  for (const option of options) {
    const key = option.source.kind === 'page' ? option.source.pageId : option.source.kind;
    const group = groups.find((g) => g.key === key);
    if (group) group.options.push(option);
    else groups.push({ key, title: groupTitle(option), options: [option] });
  }
  return groups;
}

/** The three verbs of the reply zone (GDD 4.2.1). */
export function ReplyZone({ dialogue }: { dialogue: Dialogue }) {
  const verb = useChat((state) => state.verb);
  const unseen = useChat((state) => state.unseen);
  const replyable = useEngineState((state) => canReply(state, dialogue.callId));
  const held = useEngineState((state) =>
    state.phone.lines.some((l) => l.status === 'held' && l.call?.id === dialogue.callId),
  );
  const options = useMemo(
    () => availableOptions(engine.content, engine.dialogue.index, dialogue),
    [dialogue],
  );
  const groups = groupOptions(options[verb]);

  let status: string | null = null;
  if (dialogue.status === 'ended') status = t('apps.chat.ended');
  else if (held) status = t('apps.chat.onHold');
  else if (!replyable) status = t('apps.chat.waitCaller');

  return (
    <div className={styles.reply}>
      <TabBar
        tabs={VERBS.map((id) => ({
          id,
          label: t(`apps.chat.verbs.${id}`),
          badge: unseen.includes(id),
        }))}
        selected={verb}
        onSelect={useChat.getState().setVerb}
      />
      {status !== null && <p className={styles.status}>{status}</p>}
      <div className={styles.options} data-flight-target="chat-options" data-scroll-list>
        {groups.map((group) => (
          <section key={group.key} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            {group.options.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                dialogue={dialogue}
                disabled={!replyable}
              />
            ))}
          </section>
        ))}
        {verb !== 'manage' && dialogue.pages.length === 0 && dialogue.status === 'talking' && (
          <p className={styles.hint}>{t('apps.chat.replyHint')}</p>
        )}
      </div>
    </div>
  );
}
