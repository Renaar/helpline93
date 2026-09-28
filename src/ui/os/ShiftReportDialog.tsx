import { AnimatePresence, motion } from 'motion/react';
import { nextNightId } from '../../engine/night/system.ts';
import { useEngineState } from '../engine/hooks.ts';
import { engine } from '../engine/runtime.ts';
import { Button95 } from '../feel/Button95.tsx';
import { feelConfig, ms } from '../feel/feel.config.ts';
import { nightNumber } from '../session/nights.ts';
import { useSettings } from '../settings/settingsStore.ts';
import { formatClock } from '../strings/format.ts';
import { formatNumber, t } from '../strings/i18n.ts';
import styles from './ShiftReportDialog.module.css';

/**
 * End of shift (GDD 2.2): HelplineOS prints the night's report. Closing the session reloads the
 * workstation; the login then offers the nights reached (the game was saved just before).
 */
export function ShiftReportDialog() {
  const report = useEngineState((state) => state.report);
  const reducedMotion = useSettings((state) => state.reducedMotion);
  const night = engine.content.nights.find((n) => n.id === report?.nightId);
  const nextId = report ? nextNightId(engine.content, report.nightId) : null;
  const next = engine.content.nights.find((n) => n.id === nextId);
  const minutes = (count: number | null) =>
    count === null ? t('report.none') : t('report.minutes', { count });

  return (
    <AnimatePresence>
      {report && night && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reducedMotion ? 0 : ms(feelConfig.boot.loginFadeMs) }}
        >
          <div className={styles.dialog} role="dialog" aria-labelledby="report-title">
            <header className={styles.title}>
              <h1 id="report-title">{t('report.title')}</h1>
            </header>
            <div className={styles.body}>
              <p className={styles.night}>
                {t('report.night', { number: nightNumber(night), title: night.title })}
              </p>
              <dl className={styles.stats}>
                <dt>{t('report.stats.calls')}</dt>
                <dd>{formatNumber(report.callsAnswered)}</dd>
                <dt>{t('report.stats.closed')}</dt>
                <dd>{formatNumber(report.ticketsClosed)}</dd>
                <dt>{t('report.stats.resolved')}</dt>
                <dd>{formatNumber(report.resolved)}</dd>
                <dt>{t('report.stats.average')}</dt>
                <dd>{minutes(report.averageCallMinutes)}</dd>
              </dl>
              <h2 className={styles.section}>{t('report.log')}</h2>
              <table className={styles.log}>
                <thead>
                  <tr>
                    <th>{t('report.columns.ticket')}</th>
                    <th>{t('report.columns.time')}</th>
                    <th>{t('report.columns.code')}</th>
                    <th>{t('report.columns.outcome')}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.log.map((line) => (
                    <tr key={line.ticketNumber}>
                      <td>{formatNumber(line.ticketNumber, { useGrouping: false })}</td>
                      <td>{formatClock(line.openedAt)}</td>
                      <td>{line.code ?? t('report.none')}</td>
                      <td>
                        {line.outcome === null
                          ? t('report.none')
                          : t(`report.outcome.${line.outcome}`)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.saved}>
                {next ? t('report.saved', { title: next.title }) : t('report.demoEnd')}
              </p>
            </div>
            <footer className={styles.actions}>
              <Button95
                variant="primary"
                onPress={() => {
                  window.location.reload();
                }}
              >
                {t('report.close')}
              </Button95>
            </footer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
