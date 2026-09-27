import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { audio } from './ui/feel/audio.ts';
import { feelCssVariables } from './ui/feel/feel.config.ts';
import { t } from './ui/strings/i18n.ts';
import './ui/theme/global.css';

for (const [name, value] of Object.entries(feelCssVariables())) {
  document.documentElement.style.setProperty(name, value);
}
document.title = t('app.title');
audio.startOnFirstGesture();

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
