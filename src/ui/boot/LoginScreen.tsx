import { motion } from 'motion/react';
import { useState } from 'react';
import { OPERATOR_NAME_MAX_LENGTH } from '../../engine/config.ts';
import { engine } from '../engine/runtime.ts';
import { audio } from '../feel/audio.ts';
import { Button95 } from '../feel/Button95.tsx';
import { TextField } from '../feel/TextField.tsx';
import { useFeedback } from '../feel/useFeedback.ts';
import { PixelIcon } from '../icons/PixelIcon.tsx';
import { Pressable } from '../feel/Pressable.tsx';
import { nightNumber, playableNights, startNight } from '../session/nights.ts';
import { loadedSave } from '../session/saveGame.ts';
import { t } from '../strings/i18n.ts';
import styles from './Boot.module.css';
import { useBoot } from './bootStore.ts';

/**
 * Login: the player types the operator's name (GDD 3.3), which starts the shift. With a save,
 * any night already reached can be started again (GDD 4.8).
 */
export function LoginScreen() {
  const [name, setName] = useState(() => loadedSave()?.operatorName ?? '');
  const nights = playableNights();
  const [nightId, setNightId] = useState(() => nights.at(-1)?.id ?? '');
  const { motionStyle, deny } = useFeedback();

  const submit = () => {
    if (name.trim() === '') {
      deny();
      return;
    }
    audio.play('os.hdd');
    engine.dispatch({ type: 'START_SHIFT', operatorName: name });
    if (nightId !== '') startNight(nightId);
    useBoot.getState().setPhase('desktop');
  };

  return (
    <div className={styles.login}>
      <motion.div
        style={motionStyle}
        className={styles.dialog}
        role="dialog"
        aria-labelledby="login-title"
      >
        <header className={styles.dialogTitle}>
          <h1 id="login-title">{t('boot.login.title')}</h1>
        </header>
        <div className={styles.dialogBody}>
          <PixelIcon name="start" size="lg" />
          <div className={styles.dialogText}>
            <p className={styles.station}>{t('boot.login.station')}</p>
            <p>{t('boot.login.prompt')}</p>
            <TextField
              autoFocus
              mono
              label={t('boot.login.nameLabel')}
              value={name}
              maxLength={OPERATOR_NAME_MAX_LENGTH}
              onChange={setName}
              onSubmit={submit}
            />
            {nights.length > 1 && (
              <div className={styles.nights} role="radiogroup" aria-label={t('boot.login.night')}>
                <p className={styles.nightsHint}>{t('boot.login.resumeHint')}</p>
                {nights.map((night) => (
                  <Pressable
                    key={night.id}
                    className={styles.nightChoice}
                    pressEffect="none"
                    toggled={night.id === nightId}
                    onPress={() => {
                      setNightId(night.id);
                    }}
                  >
                    {t('boot.login.nightLabel', { number: nightNumber(night), title: night.title })}
                  </Pressable>
                ))}
              </div>
            )}
          </div>
        </div>
        <footer className={styles.dialogActions}>
          <Button95 variant="primary" onPress={submit}>
            {t('boot.login.ok')}
          </Button95>
        </footer>
      </motion.div>
    </div>
  );
}
