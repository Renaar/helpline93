import { useEffect, useRef } from 'react';
import type { Param } from '../../../content/schemas.ts';
import { acceptParams, type ChatOption } from '../../../engine/index.ts';
import type { Dialogue } from '../../../engine/dialogue/types.ts';
import { engine } from '../../engine/runtime.ts';
import { useSettings } from '../../settings/settingsStore.ts';
import { Button95 } from '../../feel/Button95.tsx';
import { Pressable } from '../../feel/Pressable.tsx';
import { TextField } from '../../feel/TextField.tsx';
import { t } from '../../strings/i18n.ts';
import styles from './Chat.module.css';
import { scrollIntoList } from '../../feel/scrollIntoList.ts';
import { useChat } from './chatStore.ts';
import { splitPlaceholders, withBlanks } from './optionText.ts';

const TEXT_PARAM_MAX = 24;

function send(dialogue: Dialogue, option: ChatOption, params: Record<string, string> = {}) {
  const callId = dialogue.callId;
  if (option.verb === 'ask') engine.dispatch({ type: 'ASK', callId, questionId: option.id });
  else if (option.verb === 'manage')
    engine.dispatch({ type: 'MANAGE', callId, manageId: option.id });
  else engine.dispatch({ type: 'INSTRUCT', callId, instructionId: option.id, params });
  useChat.getState().select(null);
}

function maxLength(param: Param): number {
  if (param.type === 'code') return param.format.length;
  if (param.type === 'text') return param.max_length ?? TEXT_PARAM_MAX;
  return TEXT_PARAM_MAX;
}

function ParamInput({
  name,
  param,
  onSubmit,
}: {
  name: string;
  param: Param;
  onSubmit: () => void;
}) {
  const value = useChat((state) => state.params[name] ?? '');
  const setParam = useChat.getState().setParam;
  if (param.type === 'choice') {
    return (
      <span className={styles.choices}>
        {param.options.map((choice) => (
          <Pressable
            key={String(choice)}
            className={styles.choice}
            toggled={value === String(choice)}
            onPress={() => {
              setParam(name, String(choice));
            }}
          >
            {choice}
          </Pressable>
        ))}
      </span>
    );
  }
  return (
    <TextField
      className={styles.paramField}
      mono
      autoFocus
      value={value}
      label={t('apps.chat.paramLabel', { name })}
      maxLength={maxLength(param)}
      onChange={(next) => {
        setParam(name, next);
      }}
      onSubmit={onSubmit}
    />
  );
}

/** An instruction with parameters, filled in place: « Retirez la barrette en position [2] ». */
function ParamEditor({
  option,
  dialogue,
  disabled,
}: {
  option: ChatOption;
  dialogue: Dialogue;
  disabled: boolean;
}) {
  const params = useChat((state) => state.params);
  const accepted = acceptParams(option.params, params);
  const submit = () => {
    if (accepted && !disabled) send(dialogue, option, accepted);
  };
  return (
    <div className={styles.editor}>
      <p className={styles.editorText}>
        {splitPlaceholders(option.text).map((part, index) => {
          if (part.kind === 'text') return <span key={index}>{part.text}</span>;
          const param = option.params[part.name];
          return param ? (
            <ParamInput key={index} name={part.name} param={param} onSubmit={submit} />
          ) : null;
        })}
      </p>
      <div className={styles.editorActions}>
        <Button95
          onPress={() => {
            useChat.getState().select(null);
          }}
        >
          {t('apps.chat.cancel')}
        </Button95>
        <Button95 variant="primary" disabled={!accepted || disabled} onPress={submit}>
          {t('apps.chat.send')}
        </Button95>
      </div>
    </div>
  );
}

/** One line of the reply menu. Refuses (sound + shake) while the caller is answering. */
export function OptionRow({
  option,
  dialogue,
  disabled,
}: {
  option: ChatOption;
  dialogue: Dialogue;
  disabled: boolean;
}) {
  const selected = useChat((state) => state.selected === option.id);
  const fresh = useChat((state) => state.fresh.includes(option.id));
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const row = useRef<HTMLDivElement>(null);
  // A new option lands out of sight, or the parameters open: bring the row into view.
  useEffect(() => {
    if ((fresh || selected) && row.current) scrollIntoList(row.current, !reducedMotion);
  }, [fresh, selected, reducedMotion]);
  const hasParams = Object.keys(option.params).length > 0;
  const said =
    (option.verb === 'ask' && dialogue.asked.includes(option.id)) ||
    (option.verb === 'instruct' && dialogue.done.includes(option.id));
  return (
    <div ref={row} className={styles.option} data-fresh={fresh || undefined}>
      <Pressable
        className={styles.optionButton}
        pressEffect="none"
        toggled={selected}
        disabled={disabled && !selected}
        onPress={() => {
          if (hasParams) useChat.getState().select(selected ? null : option.id);
          else send(dialogue, option);
        }}
      >
        <span className={styles.optionText}>{withBlanks(option.text)}</span>
        {said && <span className={styles.said}>{t('apps.chat.alreadySaid')}</span>}
      </Pressable>
      {selected && <ParamEditor option={option} dialogue={dialogue} disabled={disabled} />}
    </div>
  );
}
