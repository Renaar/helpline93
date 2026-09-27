import { Button95 } from '../../ui/feel/Button95.tsx';
import { useFeedback } from '../../ui/feel/useFeedback.ts';
import { PixelIcon } from '../../ui/icons/PixelIcon.tsx';
import { t } from '../../ui/strings/i18n.ts';
import styles from './Sandbox.module.css';
import { Section } from './Section.tsx';

export function FeedbackDemo() {
  const { scope, deny } = useFeedback<HTMLDivElement>();
  return (
    <Section title={t('sandbox.feedback.title')} hint={t('sandbox.feedback.hint')}>
      <div className={styles.row}>
        <div ref={scope} className={styles.denyTarget}>
          <PixelIcon name="error" size="sm" />
          <span>{t('sandbox.feedback.target')}</span>
        </div>
        <Button95 onPress={deny}>{t('sandbox.feedback.trigger')}</Button95>
      </div>
    </Section>
  );
}
