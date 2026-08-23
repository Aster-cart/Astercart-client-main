import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry, Sentry } from './lib/sentry'

initSentry()

createRoot(document.getElementById('root')!).render(
  <Sentry.ErrorBoundary
    fallback={() => (
      <div style={{ padding: 40, fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p style={{ color: '#DC2626' }}>An unexpected error occurred.</p>
        <p style={{ color: '#888' }}>
          Please reload the page. If this keeps happening, contact support with this message.
        </p>
      </div>
    )}
  >
    <App />
  </Sentry.ErrorBoundary>
)
