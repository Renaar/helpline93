import type { AppId } from '../os/apps.ts';
import { ChatApp } from './chat/ChatApp.tsx';
import { ClientsApp } from './clients/ClientsApp.tsx';
import { HelpDeskApp } from './helpdesk/HelpDeskApp.tsx';
import { MailApp } from './mail/MailApp.tsx';
import { NotebookApp } from './notebook/NotebookApp.tsx';
import { PhoneApp } from './phone/PhoneApp.tsx';
import { ViewerApp } from './viewer/ViewerApp.tsx';

/** The content of each application window. */
export function AppContent({ app }: { app: AppId }) {
  switch (app) {
    case 'phone':
      return <PhoneApp />;
    case 'chat':
      return <ChatApp />;
    case 'viewer':
      return <ViewerApp />;
    case 'helpdesk':
      return <HelpDeskApp />;
    case 'notebook':
      return <NotebookApp />;
    case 'mail':
      return <MailApp />;
    case 'clients':
      return <ClientsApp />;
  }
}
