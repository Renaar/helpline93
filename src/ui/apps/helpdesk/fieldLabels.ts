import type { CaptureField } from '../../../content/schemas.ts';
import type { UiStringKey } from '../../strings/i18n.ts';

/** The ticket field each kind of capture fills (GDD 4.3). */
export const fieldLabel: Record<CaptureField, UiStringKey> = {
  symptom: 'apps.helpdesk.fields.symptoms',
  serial: 'apps.helpdesk.fields.serial',
  model: 'apps.helpdesk.fields.product',
  product: 'apps.helpdesk.fields.product',
  name: 'apps.helpdesk.fields.name',
  place: 'apps.helpdesk.fields.place',
  reference: 'apps.helpdesk.fields.reference',
  error: 'apps.helpdesk.fields.error',
};
