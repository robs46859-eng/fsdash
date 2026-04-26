import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import AdminApp from './apps/admin/src/App.tsx';
import StelaraiApp from './apps/stelarai/StelaraiApp.tsx';
import './index.css';

/**
 * AppSelector determines which product experience to load based on the current hostname.
 * This allows a single frontend deployment to serve multiple product domains.
 */
function AppSelector() {
  const hostname = window.location.hostname;
  
  // StelarAI primary and campaign domains
  const stelaraiDomains = [
    'stelarai.tech',
    'www.stelarai.tech',
    'solamaze.com',
    'www.solamaze.com',
    'getsemu.com',
    'www.getsemu.com',
  ];

  const isStelarai = stelaraiDomains.some(d => hostname.endsWith(d));
  
  // Also support explicit workspace paths on any domain for testing
  const isWorkspacePath = window.location.pathname.startsWith('/workspace');

  if (isStelarai || isWorkspacePath) {
    return <StelaraiApp />;
  }

  // Default to the FullStack Admin dashboard (for fsai.pro and other domains)
  return <AdminApp />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSelector />
  </StrictMode>,
);
