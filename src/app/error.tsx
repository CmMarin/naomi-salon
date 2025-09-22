'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service or console
    // eslint-disable-next-line no-console
    console.error('Client error boundary caught:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #000, #111)',
          color: '#facc15',
          padding: '24px'
        }}>
          <div style={{
            border: '1px solid rgba(250, 204, 21, 0.3)',
            backgroundColor: 'rgba(250, 204, 21, 0.05)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '640px',
            width: '100%'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              A apărut o eroare în aplicație
            </h2>
            <p style={{ color: '#e5e7eb', marginBottom: '16px', fontSize: '14px' }}>
              Te rugăm să încerci din nou. Dacă problema persistă, reîncarcă pagina.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => reset()}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(to right, #facc15, #eab308)',
                  color: '#000',
                  borderRadius: '8px',
                  fontWeight: 700,
                }}
              >
                Încearcă din nou
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  border: '1px solid rgba(250, 204, 21, 0.5)',
                  color: '#facc15',
                  borderRadius: '8px',
                  background: 'transparent',
                }}
              >
                Reîncarcă pagina
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
